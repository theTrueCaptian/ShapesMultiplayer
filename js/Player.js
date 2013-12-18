//Maeda HAnafi
//client version of player class

/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(setid,startX, startY, inshapeid, inname) {
	var x = startX,
		y = startY,
		name = inname,
		moveAmount = 5,
		id=setid,
		shape,//sprite object
		shapeid=inshapeid,//the shape of the player, 0 = square, 1 = circle, 2 = triangle	
		score=0;
		
	var getX = function(){
		return x;
	};
	var getY = function(){
		return y;
	};
	var getShape = function(){
		return shape;
	};
	var getShapeID = function(){
		return shapeid;
	};
	var getScore = function(){
		return score;
	};
	var getName = function(){
		return name;
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
	var setScore = function(newScore){
		score = newScore;
	};
	var setShape = function(){
		//the shape of the player, 0 = square, 1 = circle, 2 = triangle
		console.log("Player shape "+shapeid);
		if(shapeid==0){
			shape = new Sprite(game, "js/images/rect.png", 50, 50);
		}else if(shapeid==1){
			shape = new Sprite(game, "js/images/circle.png", 50, 50);
			
		}else{
			shape = new Sprite(game, "js/images/triangle.png", 50, 50);
		}
		shape.setSpeed(0);
		
	};
	var setShapeID = function(newShapeID){
		shapeid = newShapeID;
	};
	var setID = function(newID){
		id = newID;
	};
	var update = function(width, height) {
		var prevX = x,
			prevY = y;
		
		//check keys
		if(keysDown[K_LEFT]){			
			x -= moveAmount;
		}
		if(keysDown[K_RIGHT]){
			x += moveAmount;
		}
		if(keysDown[K_UP]){
			y -= moveAmount;
		}
		if(keysDown[K_DOWN]){
			y += moveAmount;
		}
		
		if(x>width)	x=width;
		if(y>height) y=height;
		if(x<0) x= 0;
		if(y<0)	y=0;
		shape.setPosition(x,y);
		
		
		//return true or false if the position is changed
		return (prevX!=x || prevY!=y) ? true : false;
	};

	var draw = function(scene) {
		if(shape!=null){ //check if drawing something that is undefined
			
			shape.setPosition(x, y);
			scene.context.font = ' 10pt Arial';
			scene.context.fillText(name+" "+id, x-(shape.width), y+shape.height);
			//update the sprite
			shape.update();
		}else{//if it is undefined, then define it
			setShape();
		}
			
		//console.log("Player drawn "+x+" "+y);
	};

	
	return {
		getX: getX,
		getY: getY,
		getShape: getShape,
		getShapeID: getShapeID,
		getName:getName,
		setID:setID,
		getScore: getScore,
		setScore: setScore,
		setX: setX,
		setY: setY,
		setShape: setShape,
		setShapeID: setShapeID,
		getID: getID,
		update: update,
		draw: draw
	}
};