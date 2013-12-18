//Maeda Hanafi
//Object to hold the text that animates after a collision

var CollidedObject = function(startX, startY, intext, incontex){
	var x = startX,
		y = startY,
		timelimit = 500,
		text = intext,
		context =incontex;
	//Draws the text to the scene
	var draw = function() {
		
		//setting animation for the collided object
		setInterval(function(){
			context.font = '15pt Arial';
			context.fillText(" "+text, x, y);	
			y=y-10;
			if(y==0){
				//stop timer when it reaches the top
			};
		},50);
			
	};
	return  {
		draw:draw
	}
};