//Maeda Hanafi
//Game server file

//some stuff for node.js
var util = require("util");
	io = require("socket.io"),
	Player = require("./Player").Player,
	gameport        = process.env.PORT || 8000,
	express         = require('express'), //express framework 
	http            = require('http'),
	app             = express(),
    server          = http.createServer(app),
	verbose         = false;
	
//core game variables
var socket, players;


function init(){
	//initializing the players variable to an empty array
	players = [];
	
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
	this.broadcast.emit("remove player", {id: this.id});
};
function onNewPlayer(data){
	//creates a new player
	var newPlayer = new Player(data.x, data.y);
	newPlayer.id = this.id;
	
	//send info to the other players
	this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()});

	//send existing players to the new player
	var i, existingPlayer;
	for(i=0; i<players.length; i++){
		existingPlayer = players[i];
		//send a message to the client we are dealing with
		this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});

	};
	players.push(newPlayer);
};
function onMovePlayer(data){
	var movePlayer = playerById(this.id);
	
	if(!movePlayer){
		util.log("Player not found: "+this.id);
		return;
	};
	
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
	
	this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()});
};
function onRemovePlayer(data) {
	
};
function playerById(id){
	var i;
	for(i=0; i<players.length; i++){
		if(players[i].id == id)
			return players[i];
	};
	return false;
};

//call the init func
init();

