module.exports.exec = function(request, response) {
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.end('<!DOCTYPE html>' +
		'<html>' +
		'  <head>' +
		'    <title>Default Controller</title>' +
		'    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' +
		'  </head>' +
		'  <body>' +
		'	  This is the default controller' +
		'  </body>' +
		'</html>');
};