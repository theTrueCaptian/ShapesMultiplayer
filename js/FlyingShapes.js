//Maeda Hanafi
//client version of a flying shape object

var FlyingShapes = function(startid,startX, startY, inshapeid){
	var x = startX,
	y = startY,
	shapeid = inshapeid, //the shape of the player, 0 = square, 1 = circle, 2 = triangle	
	id = startid,
	shape//sprite object;
	
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
	
	var setX = function(newX){
		x = newX;
	};
	
	var setY = function(newY){
		y = newY;
	};
	var setShapeID = function(newShapeID){
		shapeid = newShapeID;
	};
	var setShape = function(){
		//the shape of the player, 0 = square, 1 = circle, 2 = triangle
		console.log("new shape "+shapeid);
		if(shapeid==0){
			shape = new Sprite(game, "js/images/rect.png", 50, 50);
		}else if(shapeid==1){
			shape = new Sprite(game, "js/images/circle.png", 50, 50);
			
		}else{
			shape = new Sprite(game, "js/images/triangle.png", 50, 50);
		}
		//shape.setSpeed(0);
		
	};
	var draw = function(scene) {
		if(shape!=null){ //check if drawing something that is undefined
			
			shape.setPosition(x, y);
			//update the sprite
			shape.update();
		}else{//if it is undefined, then define it
			setShape();
		}
			
	};
	return  {
		getX: getX,
		getY: getY,
		getShapeID: getShapeID,
		getShape: getShape,
		setShape:setShape,
		setX: setX,
		setY: setY,
		setShapeID: setShapeID,
		id: id,
		draw:draw
		}
};



