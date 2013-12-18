//Maeda Hanafi
//server version of a flying shape object

var FlyingShapes = function(startid,startX, startY, inshapeid){
	var x = startX,
	y = startY,
	shapeid = inshapeid, //the shape of the player, 0 = square, 1 = circle, 2 = triangle	
	id = startid,
	moveAmount = Math.round(Math.random()*(15))+10,
	signx,
	signy;	
	
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
	var update = function(width, height) {
		var prevX=x, prevY=y;
		if(signx ==null || signy==null){
			signx=generateRandomSign();
			signy=generateRandomSign();
		}
		var dx = (moveAmount)*signx,
			dy = moveAmount*signy;
		x += dx;
		y += dy;
		
		if(x>width+10)	x=0;
		if(y>height+10) y=0;
		if(x<-10) x= width;
		if(y<-10)	y=height;
		
		//return true or false if the position is changed
		return (prevX!=x || prevY!=y) ? true : false;
	};
	
	var generateRandomSign = function(){
		var rand = Math.round(Math.random()*(10));
		
		if(rand%2==0){
			return 1;
		}else{
			return -1;
		}
	};
	return  {
		getX: getX,
		getY: getY,
		getShapeID: getShapeID,
		getID:getID,
		setX: setX,
		setY: setY,
		setShapeID: setShapeID,
		id: id,
		update: update
		}
};
//allow main game.js file to access this file
exports.FlyingShapes = FlyingShapes;


