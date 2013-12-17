//Maeda Hanafi
//server version of a flying shape object

var FlyingShapes = function(startid,startX, startY, inshapeid){
	var x = startX,
	y = startY,
	shapeid = inshapeid, //the shape of the player, 0 = square, 1 = circle, 2 = triangle	
	id = startid;
	
	var getX = function(){
		return x;
	};
	
	var getY = function(){
		return y;
	};
	var getShapeID = function(){
		return shapeid;
	};
	var getID = function(){
		return id;
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
	
	return  {
		getX: getX,
		getY: getY,
		getShapeID: getShapeID,
		getID:getID,
		setX: setX,
		setY: setY,
		setShapeID: setShapeID,
		id: id
		}
};

exports.FlyingShapes = FlyingShapes;


