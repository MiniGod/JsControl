var Manialink = function(id) {
	this.front = '<manialink id="'+id+'">';
	this.back = '</manialink>';
	this.children = [];
	this.getText = function() {
		var out = this.front;
		for (i in this.children)
			out += this.children[i].getText();
		return out+this.back;
	}
	this.addItem = function(item) {
		this.children.push(item);
	}
}

var Frame = function(pos3) {
	this.front = '<frame posn="'+pos3+'">';
	this.back = '</frame>';
	this.children = [];
	this.getText = function() {
		var out = this.front;
		for (i in this.children)
			out += this.children[i].getText();
		return out+this.back;
	}
	this.addItem = function(item) {
		this.children.push(item);
	}
}

var Quad = function(pos3, size2, style, substyle) {
	this.pos3 = pos3;
	this.size2 = size2;
	this.style = style;
	this.substyle = substyle;
	this.url = '';
	this.action = '';
	this.getText = function() {
		return '<quad posn="'+this.pos3+'" sizen="'+this.size2+'" url="'+this.url+'" style="'+this.style+'" substyle="'+this.substyle+'" action="'+this.action+'" />';
	}
}

var Label = function(pos3, text) {
	this.pos3 = pos3;
	this.size2 = '0 0';
	this.halign = '';
	this.valign = '';
	this.text = text;
	this.scale = 1;
	this.getText = function() {
		return '<label posn="'+this.pos3+'" sizen="'+this.size2+'" halign="'+this.halign+'" valign="'+this.valign+'" text="'+this.text+'" scale="'+this.scale +'" />';
	}
}

module.exports = 	{Manialink: Manialink, Frame: Frame, Quad: Quad, Label: Label, 
					getEmpty: function(id){return '<manialink id="'+id+'"></manialink>'}}