/**
 * Main类
 * @author lufy
 * @blog http://blog.csdn.net/lufy_Legend
 * @email lufy.legend@gmail.com
 **/
LGlobal.setDebug(false);

LGlobal.align = LStageAlign.TOP_MIDDLE;
LGlobal.stageScale = LStageScaleMode.SHOW_ALL;
LSystem.screen(LStage.FULL_SCREEN);

function doScroll() {
	if(window.pageYOffset === 0) {
		window.scrollTo(0, 1);
	}
}
window.onload = function() {
	setTimeout(doScroll, 100);
	init(50,"legend",480,600,main,LEvent.INIT);
};
window.onorientationchange = function() {
	setTimeout(doScroll, 100);
};
window.onresize = function() {
	setTimeout(doScroll, 100);
};
var loadingLayer;
var stageLayer;
var backLayer;
var gemLayer;
var bulletLayer;
var getLayer;
var rankingLayer;
var loadData = [
{path:"./static/js/share.js",type:"js"},
{path:"./static/js/Social.js",type:"js"},
{path:"./static/js/GameRanking.js",type:"js"},
{path:"./static/js/GameLogo.js",type:"js"},
{path:"./static/js/GameClear.js",type:"js"},
{path:"./static/js/Gem.js",type:"js"},
{path:"./static/js/Stage.js",type:"js"},
{path:"./static/js/Clock.js",type:"js"},
{path:"./static/js/Point.js",type:"js"},
{path:"./static/js/GetPoint.js",type:"js"},
{path:"./static/js/Bullet.js",type:"js"},
{path:"./static/js/Event.js",type:"js"},
{path:"./static/js/function.js",type:"js"},
{path:"./static/js/GameBody.js",type:"js"},
{name:"num.+",path:"./static/img/plus.png"},
{name:"num.0",path:"./static/img/0.png"},
{name:"num.1",path:"./static/img/1.png"},
{name:"num.2",path:"./static/img/2.png"},
{name:"num.3",path:"./static/img/3.png"},
{name:"num.4",path:"./static/img/4.png"},
{name:"num.5",path:"./static/img/5.png"},
{name:"num.6",path:"./static/img/6.png"},
{name:"num.7",path:"./static/img/7.png"},
{name:"num.8",path:"./static/img/8.png"},
{name:"num.9",path:"./static/img/9.png"},
{name:"back",path:"./static/img/back.png"},
{name:"line",path:"./static/img/line.png"},
{name:"clear",path:"./static/img/clear.png"},
{name:"gem01",path:"./static/img/gem01.png"},
{name:"gem02",path:"./static/img/gem02.png"},
{name:"gem03",path:"./static/img/gem03.png"},
{name:"gem04",path:"./static/img/gem04.jpg"},
{name:"gem05",path:"./static/img/gem05.png"},
{name:"gem06",path:"./static/img/gem06.png"},
{name:"gem07",path:"./static/img/gem07.png"},
{name:"gem08",path:"./static/img/gem08.png"},
{name:"gem09",path:"./static/img/gem09.png"},
{name:"ico_sina",path:"./static/img/ico_sina.gif"},
{name:"ico_qq",path:"./static/img/ico_qq.gif"},
{name:"ico_facebook",path:"./static/img/ico_facebook.png"},
{name:"ico_twitter",path:"./static/img/ico_twitter.png"}
];
var list = [],clearList,datalist;
var mouse_down_obj = {x:0,y:0,isMouseDown:false,time:0,cx:0,cy:0};
var hiddenObj;
var direction;
var preMove;
var point;
var continuous;
var clock;
var stage;

function main(){
	loadingLayer = new LoadingSample3();
	addChild(loadingLayer);
	LLoadManage.load(
		loadData,
		function(progress){
			loadingLayer.setProgress(progress);
		},
		function(result){
			datalist = result;
			removeChild(loadingLayer);
			loadingLayer = null;
			gameInit();
		}
	);
}
