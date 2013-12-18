//Maeda Hanafi
//Game server file:coordinates multiplayer

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
	flyingShapes	//all flying shapes
	;

var MAX_NUM_SHAPES = 10, STANDARD_HEIGHT = 600, STANDARD_WIDTH=600;

function init(){
	//initializing the players variable to an empty array
	players = [];
	flyingShapes = [];	//same for this one
	addFlyingShapes();
	
	//The express server handles passing our content to the browser,****************************8
	//Tell the server to listen for incoming connections
    server.listen(gameport)
	
	//app should send index.html to the user
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
		util.log("animate!");
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

function playerById(id){
	var i;
	for(i=0; i<players.length; i++){
		if(players[i].id == id)
			return players[i];
	};
	return false;
};

function addFlyingShapes(){	//for adding shapes to the array
	
	var num =Math.round(Math.random()*(10))+5;
	
	for(i=0; i<num; i++){
		var startX = Math.round(Math.random()*(STANDARD_WIDTH-5)),
			startY = Math.round(Math.random()*(STANDARD_HEIGHT-5)),
			initShape = Math.round(Math.random()*(3));
		var newShape = new FlyingShapes(i,startX, startY, initShape);
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
function animate() {
	update();
};

function update() {
	
	for(i=0; i<flyingShapes.length; i++){
	
		if(flyingShapes[i].update()){
			util.log("Update flying shapes "+ flyingShapes[i].getX()+" "+flyingShapes[i].getY()); 
			if(players.length>=1){	//send a message to all the folks out there if they exist
				this.broadcast.emit("move shape", {id: flyingShapes[i].getID(), x: flyingShapes[i].getX(), y: flyingShapes[i].getY()});
			}
		}
	};
};
//call the init func
init();

