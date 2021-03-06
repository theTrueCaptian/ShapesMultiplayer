//Maeda Hanafi
//client version of game.js
//This is part  the index.html

/**************************************************
** GAME VARIABLES
**************************************************/
var width,
	height,
	game,			// game object (from simpleGame.js)
	localPlayer,	// Local player
	remotePlayers,  //the other players
	flyingObjects,	//flying objects 
	collidedObjects, //array of collided objects
	soundArray,		//all the sounds used for collision
	instructions,	//instructions image
	initmode = true,	//init mode ask user for the username and show instructions and loading screen
	chatMode = false,	//chat mode (use enter to go into chat mode)
	socket;			//socket variable

var STANDARD_HEIGHT = 500, STANDARD_WIDTH=750,
	POINTS_INC = 10, POINTS_DEC = -5;

/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	
	//create the scene
	game = new Scene();
	game.setSize(STANDARD_WIDTH,STANDARD_HEIGHT);
	
	//load sound
	loadSound();
	loadImg();
	
	// Calculate a random start position for the local player
	// The minus 5 (half a player size) stops the player being
	// placed right on the egde of the screen
	var startX = Math.round(Math.random()*(game.width-50)),
		startY = Math.round(Math.random()*(game.height-50)),
		initshape = Math.round(Math.random()*(2));

	// Initialise the local player
	localPlayer = new Player(0,startX, startY,initshape,"");
	localPlayer.setShape();
	
	//game start
	game.start();
	
	//show instructions	
	draw();
	setTimeout(function(){
		if(initmode)
			initmode = false;	// set the instructions off after 5 secs
	},10000);
	
	connect();	//finally connect to server
	
	remotePlayers = [];
	flyingObject=[];
	collidedObjects = [];
};

var connect = function(){
	//connecting
	socket = io.connect();
		
	// Start listening for events
	setEventHandlers();
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
	socket.on("remove shape", onRemoveShape);
	socket.on("score update", onUpdateScoreBoard);
	
};

// Browser window resize
function onResize(e) {
	// set the canvas	
	/*width = window.innerWidth;
	height = window.innerHeight;
	game.setSize(width,height);*/
};

//When the first connects, it sends a message to the server about its location and name and shape
function onSocketConnected() {
    console.log("Connected to socket server");
	//tell server to create a new player on connecting
	socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY(), shapeid: localPlayer.getShapeID(), name: localPlayer.getName()});
};

//This function is called when the client disconnects from the server
function onSocketDisconnect() {
    console.log("Disconnected from socket server");
};

//This function will be called when "id info" message is sent
//The player's id will be set
function onReceiveID(data){
	console.log("received my id:"+data.id);
	//set this client's id
	localPlayer.setID(data.id);
	
};

//When a new player connects to the server, the client will receive a "new player" message 
//and a new player is added to the remotePlayers array
function onNewPlayer(data) {
    console.log("New player connected: "+data.id);
	//creating a new player based on the position data from the server
	var newPlayer = new Player(data.id,data.x, data.y, data.shapeid, data.name);
	newPlayer.setShape();
	remotePlayers.push(newPlayer);
};

//When a remote player moves, "move player" is sent and this function is called
//Updates the remotePlayer array 
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

//When a player is removed, "remove player" is sent and this function is called,
//and the player is removed.
function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);
	//make sure that the player is found
	if(!removePlayer){
		console.log("PLayer not found: "+data.id);
		return;
	};
	//removing player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
	
};

//This function is called when "score update" message is received
//The score board is updated
function onUpdateScoreBoard(data){
	var playerUpdate = playerById(data.id);
	if(!playerUpdate){
		return;
	};
	//set a new score
	playerUpdate.setScore(data.newscore);
	
};

//This function responds to "new shape" message, and creates a shape in the flying shape array
function onAddShape(data){
	//creating a new shape based on the position data from the server
	if(!shapeById(data.id)){	//make sure doesn't already know about the existence of this particular shape
		var newShape = new FlyingShapes(data.id, data.x, data.y, data.shapeid);
		newShape.setShape();
		flyingObject.push(newShape);
	};
};

//This function responds to the "move shape" message, and move the particular shape
function onMoveShape(data){
	//search for the shape that is being moved and update it
	var moveShape = shapeById(data.id);
	if(!moveShape){
		return;
	};
	moveShape.setX(data.x);
	moveShape.setY(data.y);
};

//This function responds to "remove shape" message from server and removes the particular shape
function onRemoveShape(data) {
	//search for the shape that is being remove and remove it
	var removeShape = shapeById(data.id);
	//make sure that the removeShape is found
	if(!removeShape){
		console.log("shape not found: "+data.id);
		return;
	};
	//removing player from array
	flyingObject.splice(flyingObject.indexOf(removeShape), 1);
	
};

/**************************************************
** GAME UPDATE
** This is constantly called to update the canvas and coordinate communication
**************************************************/
function update() {
	game.clear();
	
	if(initmode){	//ask user for the username and show instructions and loading screen
	
	}else{	//if it is not initialization mode, update with game loop code
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
		checkCollision();
		
	}	
	draw();
};
function playSound(type){
	if(type=="kill"){
		soundArray[3].play();
	}else{
		var index = Math.round(Math.random()*(soundArray.length-2));
	
		soundArray[index].play();
	}

};
//Check if the player hits any flying shapes
//If so, then change score, and tell server about it
function checkCollision(){
	var i;
	for(i=0; i<flyingObject.length; i++){
		if(localPlayer.getShape().collidesWith(flyingObject[i].getShape())){
			//give points to the player
			if(flyingObject[i].getShapeID()==localPlayer.getShapeID()){	//check if the shapes are same, then give points
				playSound("win");
				localPlayer.setScore(localPlayer.getScore() + POINTS_INC);
				drawpoint(POINTS_INC, flyingObject[i].getX(), flyingObject[i].getY(), flyingObject[i].getShapeID(), flyingObject[i].getShape().width, flyingObject[i].getShape().height);
			}else{
				playSound("kill");
				localPlayer.setScore(localPlayer.getScore() + POINTS_DEC);	//else takes points off
				drawpoint(POINTS_DEC, flyingObject[i].getX(), flyingObject[i].getY(), flyingObject[i].getShapeID(), flyingObject[i].getShape().width, flyingObject[i].getShape().height);
			};
			//tell server to remove shape and update player's score
			socket.emit("remove shape", {id: localPlayer.getID(), shapeid: flyingObject[i].getID()});
			socket.emit("score update", {id: localPlayer.getID(), newscore: localPlayer.getScore()});
			//finally remove the shape
			onRemoveShape({id:flyingObject[i].getID()});
			break;
		}
	};
};
/**************************************************
** GAME DRAW
**************************************************/
function draw() {
	if(initmode){	//ask user for the username and show instructions and loading screen	
		game.context.drawImage(instructions, STANDARD_WIDTH/2 -instructions.width/2, STANDARD_HEIGHT/2 -instructions.height/2, STANDARD_WIDTH/2, STANDARD_HEIGHT/2);
		//draw the loading message
		game.context.font = ' 15pt Arial';
		game.context.fillText("Loading...", STANDARD_WIDTH/2-50, STANDARD_HEIGHT/2 +instructions.height-10);
	}else{
		// Draw the local player
		localPlayer.draw(game);
		
		//draw all remote players to canvas
		var i;
		for(i=0; i<remotePlayers.length; i++){
			remotePlayers[i].draw(game);
		};
		
		//draw the score
		game.context.font = ' 15pt Arial';
		game.context.fillText("Score: "+localPlayer.getScore(), STANDARD_WIDTH-150, 40);
		
		//draw scoreboard
		if(remotePlayers.length==0){
			game.context.font = ' 8pt Arial';
			game.context.fillText("No players online...", STANDARD_WIDTH-150, 60);
		}else{
			game.context.font = ' 8 Arial';
			game.context.fillText("Scoreboard", STANDARD_WIDTH-150, 80);
			var i;
			for(i=0; i<remotePlayers.length; i++){
				game.context.font = ' 8pt Arial';
				//console.log("score update: "+remotePlayers[i].getID()+": "+remotePlayers[i].getScore()+" "+(40+10*i));
				game.context.fillText(remotePlayers[i].getID()+": "+remotePlayers[i].getScore(), STANDARD_WIDTH-150, 80+10*(1+i));
			};
		}
	};
};

//Draws the points that the player earned or lost during collision
function drawpoint(inc, x, y, shapeid, w, h){
	var point = new CollidedObject(x, y, inc+"", game.context);
	point.draw();
	
};

//helper functions******************************************
function playerById(id){
	var i;
	for(i=0; i<remotePlayers.length; i++){
		if(remotePlayers[i].getID() == id){
			return remotePlayers[i];
		}
	};
	return false;
};
function shapeById(id){
	var i;
	for(i=0; i<flyingObject.length; i++){
		if(flyingObject[i].getID() == id){
			return flyingObject[i];
		}
	};
	return false;
};
//loading resources*************************************************
function loadSound(){
	soundArray = [];
	soundArray[0] = new Sound("js/sound/sound1.ogg");
	soundArray[1] = new Sound("js/sound/sound2.ogg");
	soundArray[2] = new Sound("js/sound/sound3.ogg");
	soundArray[3] = new Sound("js/sound/sound4.ogg");
};
function loadImg(){
	instructions = new Image();
	instructions.src = "js/images/instructions.png";
	instructions.width = STANDARD_WIDTH/2, 
	instructions.height = STANDARD_HEIGHT/2;
};