function GameLogo(){
	base(this,LSprite,[]);
	var self = this;

	var logolist = [[1,1,1,1],[1,2,4,1],[1,4,2,1],[1,1,1,1]];
	var bitmap,logoLayer;

	logoLayer = new LSprite();
	logoLayer.graphics.drawRect(6,"#096",[0,0,LGlobal.width,LGlobal.height],true,"#FFF");
	self.addChild(logoLayer);

	logoLayer = new LSprite();
	logoLayer.x = 120;
	logoLayer.y = 300;
	for(var i=0;i<8;i++){
		g = new Gem(i+1);
		g.x = (i%4)*60;
		g.y = (i/4 >>> 0)*60;
		logoLayer.addChild(g);
	}
	self.addChild(logoLayer);

	labelText = new LTextField();
	labelText.color = "#072";
	labelText.font = "Helvetica";
	labelText.size = 30;
	labelText.x = 130;
	labelText.y = 550;
	labelText.lineWidth = 4;
	labelText.text = "Click to start!";
	self.addChild(labelText);

	self.addEventListener(LMouseEvent.MOUSE_UP,gameStart);
};
