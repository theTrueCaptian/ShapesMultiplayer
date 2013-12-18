//Maeda Hanafi
//server version of player

var Player = function(startX, startY, inshapeid, inname){
	var x = startX,
	y = startY,
	shapeid = inshapeid, //the shape of the player, 0 = square, 1 = circle, 2 = triangle	
	id,	//unique id of a player
	name = inname, 
	score=0;	//score of the user
	
	var getX = function(){
		return x;
	};
	
	var getY = function(){
		return y;
	};
	var getShapeID = function(){
		return shapeid;
	};
	var getName = function(){
		return name;
	};
	var getScore = function(){
		return score;
	};
	var setX = function(newX){
		x = newX;
	};
	
	var setY = function(newY){
		y = newY;
	};
	var setScore = function(newScore){
		score = newScore;
	};
	var setShapeID = function(newShapeID){
		shapeid = newShapeID;
	};
	var setName = function(newName){
		name=newName;
	};
	return  {
		getX: getX,
		getY: getY,
		getShapeID: getShapeID,
		getName:getName,
		getScore: getScore,
		setScore: setScore,
		setX: setX,
		setY: setY,
		setShapeID: setShapeID,
		setName: setName,
		id: id
		}
};
//allow access for other files to access this
exports.Player = Player;


