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
	countShapes=0;	//this is used to count total of shapes (including non active ones), and used for shapes unique id

var MAX_NUM_SHAPES = 10,MIN_NUM_SHAPES = 5, STANDARD_HEIGHT = 500, STANDARD_WIDTH=750;

//Initializing server/game
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
	client.on("score update", onUpdateScoreBoard);
};

//functions that handle other events******************************

//When client disconnects, the server removes that player from the array and tell everyone else about its removal
//This function is called, when a client closes
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

//This function is called when the client first connects.
//it creates a new player in the players array and broadcasts its existence to the rest of the players
//Also sends the flying objects array to the new player
//The server also sends the client his unique id number
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

//This function is called when a client sends "move player" message
//The server sends the updated coordinates to the rest of the player
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

//A client will constantly alert the server to send the updated coordinates of the flying shapes
//This function will respond to the "move shapes" by sending updates to clients on the flying objects
//This function also decides if new shapes will be created
function sendFlyingShapesUpdate(data){
	for(i=0; i<flyingShapes.length; i++){
		this.emit("move shape", {id: flyingShapes[i].getID(), x: flyingShapes[i].getX(), y: flyingShapes[i].getY(), shapeid: flyingShapes[i].getShapeID()});
	};
	//should we add more shapes?
	if(flyingShapes.length<MIN_NUM_SHAPES){
		//add more shapes
		addFlyingShapes();
		sendFlyingShapes(this);
	};
};

//A helper function to find player by its unique id
function playerById(id){
	var i;
	for(i=0; i<players.length; i++){
		if(players[i].id == id)
			return players[i];
	};
	return false;
};

//This function creates flying shapes to the array, flyingShapes
function addFlyingShapes(){	//for adding shapes to the array
	var num =Math.round(Math.random()*(MAX_NUM_SHAPES))+MIN_NUM_SHAPES;
	
	for(i=0; i<num; i++){
		var startX = Math.round(Math.random()*(STANDARD_WIDTH-5)),
			startY = Math.round(Math.random()*(STANDARD_HEIGHT-5)),
			initShape = Math.round(Math.random()*(2))
			;
		var newShape = new FlyingShapes(countShapes,startX, startY, initShape);
		countShapes++;
		flyingShapes.push(newShape);
	};
};

//Thus function is called by other functions in this server file to send the updates to all the clients 
//This is normally called when a new player is created or when a client asks for an update on the coordinates
function sendFlyingShapes(client){
	for(i=0; i<flyingShapes.length; i++){
		var curr = flyingShapes[i];
		//send all flying shapes to all clients (broadcast)
		client.broadcast.emit("add shape", {id: curr.getID(), x: curr.getX(), y: curr.getY(), shapeid: curr.getShapeID()});
		//send an update to a particular client, if called by one
		client.emit("add shape", {id: curr.getID(), x: curr.getX(), y: curr.getY(), shapeid: curr.getShapeID()});
	};
};

//A helper function to find a shape by its unique id
function shapeById(id){
	var i;
	for(i=0; i<flyingShapes.length; i++){
		if(flyingShapes[i].getID() == id)
			return flyingShapes[i];
	};
	return false;
};

//When a client alerts of a collision with "remove shape", this function is called
//A broadcast is sent to alert a removed shape
//Then the shape is removed from the array
function onCollision(data){
	var removeShape = shapeById(data.shapeid);
	//make sure that the shape to remove is found
	if(!removeShape){
		return;
	};
	//removing the shape from array
	flyingShapes.splice(flyingShapes.indexOf(removeShape), 1);
	this.broadcast.emit("remove shape", {id: data.shapeid});
};

//This function is called when "score update" message is received
//The score board is updated
function onUpdateScoreBoard(data){
	var playerUpdate = playerById(data.id);
	if(!playerUpdate){
		util.log("Player with new score NOT FOUND "+data.id+" " + data.newscore);
		return;
	};
	//set a new score
	playerUpdate.setScore(data.newscore);
	//Broadcast new score to everyone
	//util.log("Broadcast new score "+data.id+" " + data.newscore);
	this.broadcast.emit("score update", {id: data.id, newscore: playerUpdate.getScore()});
};

//animation updates the flying shapes *******************************
//This function is constantly called to animate the flying objects
function animate() {
	update();
	
};

//Updating the flying shapes coordinates
function update() {
	for(i=0; i<flyingShapes.length; i++){	
		flyingShapes[i].update(STANDARD_WIDTH, STANDARD_HEIGHT);
	};
};

//call the init func
init();

