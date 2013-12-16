var Player = function(startX, startY, inshapeid, inname){
	var x = startX,
	y = startY,
	shapeid = inshapeid, //the shape of the player, 0 = square, 1 = circle, 2 = triangle	
	id,
	name = inname;
	
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
	var setX = function(newX){
		x = newX;
	};
	
	var setY = function(newY){
		y = newY;
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
		setX: setX,
		setY: setY,
		setShapeID: setShapeID,
		setName: setName,
		id: id
		}
};

exports.Player = Player;


