var sax           = require('sax')
var dateFormatter = require('./date_formatter')
/*
var cb = null;
var out = {methodName: '', params: []};
var reading = '';
var reading_type = '';
*/
function Deserializer() {
	this.parser = sax.createStream(true);
	this.reading = '';
	this.reading_type = '';
	this.out = {methodName: '', params: []};
	this.out['params'].length = 0;
	this.cb = null;
	this.dropInto = [];
	this.dropIntoStructName = 'Temp';

	this.parser.on('error',  this.onError.bind(this));
	this.parser.on('text',  this.onText.bind(this));
	this.parser.on('opentag',  this.onOpenTag.bind(this));
	this.parser.on('closetag',  this.onCloseTag.bind(this));
}

Deserializer.prototype.parse = function(xml, callback) {
	this.cb = callback;
	this.parser.write(xml);
}

Deserializer.prototype.onError = function(e) {
	console.log('Error =3. (parsing XML)')
}

Deserializer.prototype.onText = function(t) {
	if (t == '')
		return;
  	if (this.reading == 'methodName')
  		this.out['methodName'] = t;
  	else if (this.reading != '' && this.reading_type != '') {
  		this.parseParam(this.reading_type, t);
  	}
}

Deserializer.prototype.onOpenTag = function(node) {
	switch (node.name) {
		case 'methodCall':
		case 'methodResponse':
			return;
			break;
		case 'array':
		case 'struct':
			this.parseParam(node.name, undefined)
			break;
		default:
			if (this.reading == '')
				this.reading = node.name;
			else
				this.reading_type = node.name;
			break;
	}
}

Deserializer.prototype.onCloseTag = function(name) {
	this.reading = '';
	this.reading_type = '';
	switch (name) {
		case 'array':
		case 'struct':
			var dropData = this.dropInto[this.dropInto.length-1];
			console.log(this.dropInto.length)
			this.dropInto.length--;
			this.add(dropData);
			break;
		case 'methodCall':
		case 'methodResponse':
			this.cb(this.out)
			break;
		default:
			break;
	}
}



Deserializer.prototype.parseParam = function(type, data) {
	switch (type.toLowerCase()) {
		case 'array':
			this.dropInto.push([]);
			console.log(this.dropInto.length);
		case 'struct':
			this.dropInto.push({});
			console.log(this.dropInto.length);
      	case 'string':
      	case 'name':
        	this.add(data);
        	break;
        case 'boolean':
        	this.add(data === "1");
        	break;
        case 'int':
        case 'i4':
			var value = parseInt(data, 10)
			if (isNaN(value)) 
				throw new Error('Invalid int: \'' + data + '\'')
			else 
				this.add(value);
			break;
		default:
			console.log('Ignored param `'+data+'`, no handler.');
			break;
	}
}

Deserializer.prototype.add = function(data) {
	if (this.dropInto.length == 0)
		this.out['params'].push(data)
	else if (Object.prototype.toString.call( this.dropInto[this.dropInto.length-1] ) === '[object Array]') // into array
		this.dropInto[this.dropInto.length-1].push(data);
	else // into struct
		this.dropInto[this.dropInto.length-1][this.dropIntoStructName] = data;
}

module.exports = Deserializer