'use strict';

// load modules
var http = require('http');
var fs   = require('fs');
var path = require('path');

// runtime variables
var portno;
const httpDocs = "http_docs"

switch(process.argv.length) {
	case 2:
		portno = 1024;
		break;
		
	case 3:
		portno = +process.argv[2];
		break;
		
	default:
		console.log("Usage: node server.js [port number]");
		process.exit();
}

http.createServer(function (req, res) {
	if (req.url === '/') req.url += 'index.html';
	console.log(req.url);

	var filePath = path.join(__dirname, httpDocs + req.url);
	var stat;
	try {
		stat = fs.statSync(filePath);
	} catch(err) {
		console.log("   not found");
		res.writeHead(404, {'Connection': 'close'});
		return;
	}
	var ct = getContentType(req.url);
	
	res.writeHead(200, {
		'Content-Type': ct,
		'Content-Length': stat.size
	});
	
	var iStream = fs.createReadStream(filePath);
	iStream.pipe(res);
}).listen(portno);

function getContentType(url) {
	var ext = url.substr(url.lastIndexOf('.') + 1, url.length);
	
	switch (ext) {
		case 'css':
		case 'html':
			return 'text/' + ext;
			
		case 'js':
			return 'application/javascript';
			
		default:
			console.log("Unknown extension: " + ext);
			return null;
	}
}

console.log('Server running on port ' + portno);