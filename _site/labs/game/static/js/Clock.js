
function Clock(){
	var self = this;
	base(self,LSprite,[]);
	self.timer = 0;
	self.addTimer = 0.5;
    self.width = LGlobal.width * 0.5;
	self.graphics.drawRect(5, "#333", [0, 0, self.width, 20], true, "#333");
}
Clock.prototype.onframe = function (){
	var self = this;
	self.timer += self.addTimer;
	self.graphics.clear();
	self.graphics.drawRect(10, "#333", [0, 0, self.width, 20], true, "#333");
	self.graphics.drawRect(5, "#fff", [0, 0, self.timer, 20], true, "#fff");
};
