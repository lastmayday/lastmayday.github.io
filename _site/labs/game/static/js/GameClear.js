function GameClear(){
	base(this,LSprite,[]);
	var self = this;
	var bitmap,layer;

	layer = new LSprite();
	layer.alpha = 0.7;
	layer.graphics.drawRect(6,"#096",[50,50,LGlobal.width-100,LGlobal.height-90]);
	self.addChild(layer);

	layer = new LSprite();
	labelText = new LTextField();
	labelText.color = "#072";
	labelText.font = "Helvetica";
	labelText.size = 20;
    labelText.x = LGlobal.width * 0.2;
	labelText.y = LGlobal.height * 0.2;
	labelText.weight = "bolder";
	labelText.text = "Point:"+point.num;
	layer.addChild(labelText);
	layer.x = 100;
	layer.y = 70;
	self.addChild(layer);

	var rank = new GameRanking();
	self.addChild(rank);

	var btn_up = new LSprite();
	labelText = new LTextField();
	labelText.color = "#000";
	labelText.font = "Helvetica";
	labelText.size = 16;
	labelText.x = 65;
	labelText.y = 8;
	labelText.text = "restart";
	btn_up.addChild(labelText);
	btn_up.graphics.drawRect(4,"#006400",[0,0,200,40]);
	var btn_down = new LSprite();
	labelText = new LTextField();
	labelText.color = "#000";
	labelText.font = "Helvetica";
	labelText.size = 16;
	labelText.x = 65;
	labelText.y = 8;
	labelText.text = "restart";
	btn_down.addChild(labelText);
	btn_down.graphics.drawRect(4,"#096",[0,0,200,40]);
	btnReturn = new LButton(btn_up,btn_down);
	self.addChild(btnReturn);
	btnReturn.x = 140;
	btnReturn.y = 300;
	btnReturn.addEventListener(LMouseEvent.MOUSE_UP,function(event){
		gameStart();
	});
};
