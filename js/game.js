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
	socket;			//socket variable


/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	
	//create the scene
	game = new Scene();

	// Maximise the canvas
	//width = window.innerWidth;
	//height = window.innerHeight;
	//game.setSize(width,height);
	
	// Calculate a random start position for the local player
	// The minus 5 (half a player size) stops the player being
	// placed right on the egde of the screen
	var startX = Math.round(Math.random()*(game.width-5)),//startX = Math.round(Math.random()*(canvas.width-5)),
		startY = Math.round(Math.random()*(game.height-5)),//startY = Math.round(Math.random()*(canvas.height-5)),
		initshape = Math.round(Math.random()*(3));

	// Initialise the local player
	localPlayer = new Player(startX, startY,initshape,"hey girl");
	localPlayer.setShape();
	
	socket = io.connect();
	
	//game start
	game.start();
	
	// Start listening for events
	setEventHandlers();
	
	remotePlayers = [];
};


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	
	// Window resize
	window.addEventListener("resize", onResize, false);
	
	socket.on("connect", onSocketConnected);
	socket.on("disconnect", onSocketDisconnect);
	socket.on("new player", onNewPlayer);
	socket.on("move player", onMovePlayer);
	socket.on("remove player", onRemovePlayer);
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

function onNewPlayer(data) {
    console.log("New player connected: "+data.id);
	//creating a new player based on the position data from the server
	var newPlayer = new Player(data.x, data.y, data.shapeid, data.name);
	newPlayer.setShape();
	newPlayer.id = data.id;
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


/**************************************************
** GAME UPDATE
**************************************************/
function update() {
	game.clear();
	localPlayer.update();
	//update the server on my position only on change
	if(localPlayer.update()){
		socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY(), shapeid: localPlayer.getShapeID()});
	};
	
	//draw all remote players to canvas
	var i;
	for(i=0; i<remotePlayers.length; i++){
		remotePlayers[i].draw();
	};
	
	draw();
};


/**************************************************
** GAME DRAW
**************************************************/
function draw() {
	//game.clear();
	
	// Draw the local player
	localPlayer.draw();
	
	//draw all remote players to canvas
	var i;
	for(i=0; i<remotePlayers.length; i++){
		remotePlayers[i].draw();
	};
};

function playerById(id){
	var i;
	for(i=0; i<remotePlayers.length; i++){
		if(remotePlayers[i].id == id)
			return remotePlayers[i];
	};
	return false;
};