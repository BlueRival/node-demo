
module.exports.exec = function(request, response) {

	response.writeHead(200, {'Content-Type': 'text/html'});

	response.end('<!DOCTYPE html>' +
		'<html>' +
		'  <head>' +
		'    <title>Hello World Controller</title>' +
		'    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' +
		'  </head>' +
		'  <body>' +
		'	  Hello World, ' + request.scriptPath + '!' +
		'  </body>' +
		'</html>');
};