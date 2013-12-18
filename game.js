//Maeda Hanafi
//Game server file:coordinates multiplayer
//This file will run on the cloud, and respond to clients to coordinate multiplayer

//some stuff for node.js
var util = require("util");
	io = require("socket.io"),
	Player = require("./Player").Player,
	FlyingShapes = require("./FlyingShapes").FlyingShapes,
	gameport        = process.env.PORT || 8000,	//use localhost:8000 if testing in local
	express         = require('express'), //express framework 
	http            = require('http'),	//requires http (to send html over http when on cloud)
	app             = express(),
    server          = http.createServer(app),
	verbose         = false;
	
//core game variables
var socket, players, 
	flyingShapes,	//all flying shapes
	countShapes=0;

var MAX_NUM_SHAPES = 10,MIN_NUM_SHAPES = 5, STANDARD_HEIGHT = 600, STANDARD_WIDTH=750;

function init(){
	//initializing the players variable to an empty array
	players = [];
	flyingShapes = [];	//same for this one
	addFlyingShapes();
	
	//The express server handles passing our content to the browser,****************************8
	//Tell the server to listen for incoming connections
    server.listen(gameport)
	
	//app should send index.html to the user, when there is a connection
	app.get( '/', function( req, res ){
        console.log('trying to load %s', __dirname + '/index.html');
        res.sendfile( '/index.html' , { root:__dirname });
    });
	
	//This handler will listen for requests on /*, any file from the root of our server.
    app.get( '/*' , function( req, res, next ) {

        //This is the current file they have requested
        var file = req.params[0];
        //For debugging, we can track what files are requested.
        if(verbose) console.log('\t :: Express :: file requested : ' + file);
        //Send the requesting client the file.
        res.sendfile( __dirname + '/' + file );

    });
	
	//configuration for socket.io *************************
	socket = io.listen(server);
	
	socket.configure(function (){
        socket.set('log level', 2);
        socket.set('authorization', function (handshakeData, callback) {
          callback(null, true); // error first callback style
        });

    });
	
	//set animation for shapes
	setInterval(function() { 
		//util.log("animate!");
		animate();
	}, 500);
	
	//listen for related events
	setEventHandlers(); 
};

//listening to events
var setEventHandlers = function(){
	//listening for new connections to socket.io, which then calls onSocketConnection function
	socket.sockets.on("connection", onSocketConnection);
	
};

//function called when cnnnection recieved
function onSocketConnection(client){
	util.log("New player is connected: "+ client.id); //each player has a client.id, used for communicating with other players
	//setting other of the event handlers
	client.on("disconnect", onClientDisconnect);
	client.on("new player", onNewPlayer);
	client.on("move player", onMovePlayer);
	client.on("move shape", sendFlyingShapesUpdate);
	client.on("remove shape", onCollision);
	
};

//functions that handle other events*********************
function onClientDisconnect(){
	util.log("player has disconnected: "+this.id); //this refers to the client variable from the onSocketConnection func
	var removePlayer = playerById(this.id);
	//make sure that the player is found
	if(!removePlayer){
		util.log("PLayer not found: "+this.id);
		return;
	};
	//removing player from array
	players.splice(players.indexOf(removePlayer), 1);
	//let the rst of player know someone disconnected
	util.log("sending message to the rest of players of a removed player:"+this.id);
	this.broadcast.emit("remove player", {id: this.id});
};
function onNewPlayer(data){
	//creates a new player
	var newPlayer = new Player(data.x, data.y, data.shapeid, data.name);
	newPlayer.id = this.id;

	//send client his number	
	util.log("sending id to client:"+this.id);
	this.emit("id info", {id: this.id }); 

	//send info to the other players
	this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), shapeid: newPlayer.getShapeID(), name: newPlayer.getName()});

	//send existing players to the new player
	var i, existingPlayer;
	for(i=0; i<players.length; i++){
		existingPlayer = players[i];
		//send a message to the client we are dealing with
		this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY(), shapeid: existingPlayer.getShapeID(), name: existingPlayer.getName()});
		
	};
	players.push(newPlayer);
	
	//do the same for the flying shapes
	sendFlyingShapes(this);
	
};
function onMovePlayer(data){
	var movePlayer = playerById(this.id);
	
	if(!movePlayer){
		util.log("Player not found: "+this.id);
		return;
	};
	
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
	
	this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY(), shapeid: movePlayer.getShapeID()});
};

function sendFlyingShapesUpdate(data){
	for(i=0; i<flyingShapes.length; i++){
		//util.log("Update flying shapes "+ flyingShapes[i].getX()+" "+flyingShapes[i].getY()); 	
		this.emit("move shape", {id: flyingShapes[i].getID(), x: flyingShapes[i].getX(), y: flyingShapes[i].getY(), shapeid: flyingShapes[i].getShapeID()});
	};
	//should we add more shapes?
	if(flyingShapes.length<MIN_NUM_SHAPES){
		//add more shapes
		addFlyingShapes();
		sendFlyingShapes(this);
	};
};

function playerById(id){
	var i;
	for(i=0; i<players.length; i++){
		if(players[i].id == id)
			return players[i];
	};
	return false;
};

function addFlyingShapes(){	//for adding shapes to the array
	
	var num =Math.round(Math.random()*(MAX_NUM_SHAPES))+MIN_NUM_SHAPES;
	
	for(i=0; i<num; i++){
		var startX = Math.round(Math.random()*(STANDARD_WIDTH-5)),
			startY = Math.round(Math.random()*(STANDARD_HEIGHT-5)),
			initShape = Math.round(Math.random()*(3))
			;
		var newShape = new FlyingShapes(countShapes,startX, startY, initShape);
		countShapes++;
		flyingShapes.push(newShape);
	};
};

function sendFlyingShapes(client){
	for(i=0; i<flyingShapes.length; i++){
		var curr = flyingShapes[i];
		//send a message to the client we are dealing with
		client.emit("add shape", {id: curr.getID(), x: curr.getX(), y: curr.getY(), shapeid: curr.getShapeID()});
	};
};
function shapeById(id){
	var i;
	for(i=0; i<flyingShapes.length; i++){
	//util.log("check for id: "+flyingShapes[i].getID());
		if(flyingShapes[i].getID() == id)
			return flyingShapes[i];
	};
	return false;
};
function onCollision(data){
	//util.log("Collision: "+data.id+" " +data.shapeid);
	
	var removeShape = shapeById(data.shapeid);
	//make sure that the shape to remove is found
	if(!removeShape){
		//util.log("shape not found: "+data.shapeid);
		return;
	};
	//removing the shape from array
	flyingShapes.splice(flyingShapes.indexOf(removeShape), 1);
	this.broadcast.emit("remove shape", {id: data.shapeid});
};

//animation updates the flying shapes ******************
function animate() {
	update();
	
};

function update() {
	for(i=0; i<flyingShapes.length; i++){	
		flyingShapes[i].update(STANDARD_WIDTH, STANDARD_HEIGHT);
	};
};

//call the init func
init();

