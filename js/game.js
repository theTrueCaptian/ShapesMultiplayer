//Maeda Hanafi
//client version of game.js

/**************************************************
** GAME VARIABLES
**************************************************/
var width,
	height,
	game,			// game object (from simpleGame.js)
	localPlayer,	// Local player
	remotePlayers,  //the other players
	flyingObjects,	//flying objects 
	chatMode = false,	//chat mode (use enter to go into chat mode)
	socket;			//socket variable

var STANDARD_HEIGHT = 600, STANDARD_WIDTH=750;

/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	
	//create the scene
	game = new Scene();
	game.setSize(STANDARD_WIDTH,STANDARD_HEIGHT);
	
	// Calculate a random start position for the local player
	// The minus 5 (half a player size) stops the player being
	// placed right on the egde of the screen
	var startX = Math.round(Math.random()*(game.width-5)),//startX = Math.round(Math.random()*(canvas.width-5)),
		startY = Math.round(Math.random()*(game.height-5)),//startY = Math.round(Math.random()*(canvas.height-5)),
		initshape = Math.round(Math.random()*(3));

	// Initialise the local player
	localPlayer = new Player(0,startX, startY,initshape,"");
	localPlayer.setShape();
	
	socket = io.connect();
	
	//game start
	game.start();
	
	// Start listening for events
	setEventHandlers();
	
	remotePlayers = [];
	flyingObject=[];
};


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	
	// Window resize
	window.addEventListener("resize", onResize, false);
	//setting event handlers, first param is the message to receive and 
	//the second param is the function it will process on receiving the message
	socket.on("connect", onSocketConnected);
	socket.on("disconnect", onSocketDisconnect);
	
	socket.on("new player", onNewPlayer);
	socket.on("id info", onReceiveID);
	socket.on("move player", onMovePlayer);
	socket.on("remove player", onRemovePlayer);
	socket.on("add shape", onAddShape);
	socket.on("move shape", onMoveShape);
};

// Browser window resize
function onResize(e) {
	// set the canvas	
	/*width = window.innerWidth;
	height = window.innerHeight;
	game.setSize(width,height);*/
};

function onSocketConnected() {
    console.log("Connected to socket server");
	//tell server to create a new player on connecting
	socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY(), shapeid: localPlayer.getShapeID(), name: localPlayer.getName()});
};

function onSocketDisconnect() {
    console.log("Disconnected from socket server");
};
function onReceiveID(data){
	console.log("received my id:"+data.id);
	//set this client's id
	localPlayer.setID(data.id);
	
};

function onNewPlayer(data) {
    console.log("New player connected: "+data.id);
	//creating a new player based on the position data from the server
	var newPlayer = new Player(data.id,data.x, data.y, data.shapeid, data.name);
	newPlayer.setShape();
	remotePlayers.push(newPlayer);
};

function onMovePlayer(data) {
	//search for the player that is being moved and update it
	var movePlayer = playerById(data.id);
	if(!movePlayer){
		console.log("Player not found: "+data.id);
		return;
	};
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);

};

function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);
	console.log("I am told to remove this player: "+data.id);
	//make sure that the player is found
	if(!removePlayer){
		console.log("PLayer not found: "+data.id);
		return;
	};
	//removing player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
	
};

function onAddShape(data){
	console.log("new shape: "+data.id);
	//creating a new shape based on the position data from the server
	var newShape = new FlyingShapes(data.id, data.x, data.y, data.shapeid);
	newShape.setShape();
	flyingObject.push(newShape);
};

function onMoveShape(data){
	//console.log("move shape: "+data.id);
	//search for the shape that is being moved and update it
	var moveShape = shapeById(data.id);
	if(!moveShape){
		console.log("Shape not found: "+data.id);
		return;
	};
	moveShape.setX(data.x);
	moveShape.setY(data.y);
};

function onRemoveShape(data) {
	//search for the shape that is being moved and update it
	var moveShape = shapeById(data.id);
	console.log("I am told to remove this shape: "+data.id);
	//make sure that the moveShape is found
	if(!moveShape){
		console.log("shape not found: "+data.id);
		return;
	};
	//removing player from array
	flyingObject.splice(flyingObject.indexOf(moveShape), 1);
	
};

/**************************************************
** GAME UPDATE
**************************************************/
function update() {
	game.clear();
	localPlayer.update(STANDARD_WIDTH, STANDARD_HEIGHT);
	//update the server on my position only on change
	if(localPlayer.update()){
		socket.emit("move player", {id: localPlayer.getID(), x: localPlayer.getX(), y: localPlayer.getY(), shapeid: localPlayer.getShapeID()});
	};
	
	//draw all remote players to canvas
	var i;
	for(i=0; i<remotePlayers.length; i++){
		remotePlayers[i].draw(game);
	};
	
	//draw all flying shapes to canvas
	var i;
	for(i=0; i<flyingObject.length; i++){
		flyingObject[i].draw(game);
	};
	
	//alert server to send updates shapes coordinates
	socket.emit("move shape", {id: localPlayer.getID()});
	
	//check for collisions
	var i;
	for(i=0; i<flyingObject.length; i++){
		if(localPlayer.getShape().collidesWith(flyingObject[i].getShape())){
			socket.emit("collision", {id: localPlayer.getID(), shapeid: flyingObject[i].id});
		}
	};
	
	//check if chat mode is on
	//if(!chatMode &&){
	
	//}
	
	draw();
};


/**************************************************
** GAME DRAW
**************************************************/
function draw() {
	// Draw the local player
	localPlayer.draw(game);
	
	//draw all remote players to canvas
	var i;
	for(i=0; i<remotePlayers.length; i++){
		remotePlayers[i].draw(game);
	};
};

//helper functions******************************************
function playerById(id){
	var i;
	for(i=0; i<remotePlayers.length; i++){
		console.log("remote player checking: "+remotePlayers[i].getID());
		if(remotePlayers[i].getID() == id){
			return remotePlayers[i];
		}
	};
	return false;
};
function shapeById(id){
	var i;
	for(i=0; i<flyingObject.length; i++){
		if(flyingObject[i].id == id){
			return flyingObject[i];
		}
	};
	return false;
};