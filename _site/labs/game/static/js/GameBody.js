function gameInit(){
	stageLayer = new LSprite();
	addChild(stageLayer);
	var fps = new FPS();
	addChild(fps);
	addGameLogo();
}
function addGameLogo(){
	var layer = new GameLogo();
	stageLayer.addChild(layer);
}
function addGameClear(){
	stageLayer.removeAllChild();
	stageLayer.die();
	var layer = new GameClear();
	stageLayer.addChild(layer);
}
function gameStart(){
	stageLayer.removeAllChild();
	stageLayer.die();
	var clearList,i,g,num;
	backLayer = new LSprite();
	stageLayer.addChild(backLayer);
	gemLayer = new LSprite();
	stageLayer.addChild(gemLayer);
	bulletLayer = new LSprite();
	stageLayer.addChild(bulletLayer);
	getLayer = new LSprite();
	stageLayer.addChild(getLayer);
	direction = "";
	//背景
	var bitmap = new LBitmap(new LBitmapData(datalist["back"]));
	backLayer.addChild(bitmap);

	point = new Point();
	point.x = LGlobal.width * 0.5;
	point.y = LGlobal.height * 0.1;
	backLayer.addChild(point);

	stage = new Stage();

	//添加宝石
	addGem();

	clock = new Clock();
	clock.x = LGlobal.width*0.4;
	clock.y = 640;
	backLayer.addChild(clock);

	stageLayer.addEventListener(LMouseEvent.MOUSE_DOWN,onDown);
	stageLayer.addEventListener(LMouseEvent.MOUSE_UP,onUp);
	stageLayer.addEventListener(LEvent.ENTER_FRAME,onframe);
}
function addGem(){
	stage.setStage(stage.num + 1);
	gemLayer.removeAllChild();
	list = [];
	//添加宝石
	for(i=0;i<8;i++){
		list.push([]);
		for(var j=0;j<8;j++){
			num = (Math.random()*9 >>> 0)+1;
			g = new Gem(num);
			g.x = j*60;
			g.y = i*60+120;
			gemLayer.addChild(g);
			list[i].push(g);
		}
	}
	//检验重复宝石
	do{
		clearList = checkClear();
		if(clearList.length > 0){
			for(i=0;i<clearList.length;i++){
				g = clearList[i];
				num = (Math.random()*9 >>> 0)+1;
				g.change(num);
			}
		}
	}while(clearList.length > 0);
}
function onframe(){
	clock.onframe();
	if(clock.timer >= clock.width){
		addGameClear();
	}
}
