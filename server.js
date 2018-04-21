var http = require('http');

http.createServer(function (req, res) {
	console.log(req);
	console.log(res);
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World!');
}).listen(1024);