'use strict';
var http = require('http');
var portno;

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
	console.log(req);
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World!');
}).listen(portno);

console.log('Server running on port ' + portno);