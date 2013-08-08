// utilities
var child_process = require('child_process');
var url = require('url');
var fs = require("fs");
var formidable = require('formidable');

// load a controller and exec it on a request and response
function serveScript(scriptFile, request, response) {

	// pass the request off the the controller in the script for further processing
	require('./' + scriptFile).exec(request, response);

}

// serve up a static file
function serveFile(staticFile, response) {

	// read in the file
	fs.readFile(staticFile, function (err, data) {

		// check for errors of course
		if (err) {

			response.writeHead(500, {
				'Content-Type': 'text/plain'
			});
			response.end(err);

		} else {

			// spawn a bash process to get the mime type of the requested file
			var fileCmd = shild_process.spawn('/usr/bin/file', ['-b', '--mime-type', staticFile], {
				cw: process.cwd()
				});
			var mimeType = "";

			// this is how the child process knows it can exit
			fileCmd.stdin.end();

			// capture the mime type
			fileCmd.stdout.on('data', function(data) {
				mimeType += data;
			});

			// when the command finally exits, send the response
			fileCmd.on('exit', function(code) {
				response.writeHead(200, {
					'Content-Type': (!code && mimeType) ? mimeType.trim() : 'text/plain'
					});
				response.end(data);
			});

		}
	});
}

// web server request processer for handling requests once they are fully parsed
function processWebRequest(request, response) {

	// generate a potential static file
	var staticFile = "public/" + request.url.pathname;

	// see if the static file exists
	fs.stat(staticFile, function(err, stats) {
		
		if (stats && stats.isFile()) {

			// serve the static file directly
			serveFile(staticFile, response);

		} else {

			// set default controller
			if (request.url.pathname === '/') {
				request.url.pathname = '/index';
			}

			// split the path into an array so we can extract a controller from the URI path
			var urlParts = request.url.pathname.split('/');

			// use the first segment of the url as a controller name
			var scriptFile = 'bin/' + urlParts[1] + '.js';

			// use the rest of the url after the controller as a path, the semantics of what to do with that path are determined by the controller
			request.scriptPath = '/' + urlParts.slice(2).join('/');

			// see if the controller exists
			fs.stat(scriptFile, function(err, stats) {

				if (stats && stats.isFile()) {

					// controller exists, load and run it
					serveScript(scriptFile, request, response);

				} else {
					response.writeHead(404, {
						'Content-Type': 'text/plain'
					});
					response.end('Path not found: ' + url.format(request.url));
				}

			});

		}

	});

}

// general web server request handler
function webRequest(request, response) {

	// pre-processing
	request.url = url.parse(request.url);

	// see if a properly formatted form was submitted, if so, parse it
	if (request.headers['content-type'] && (request.headers['content-type'].indexOf('application/x-www-form-urlencoded') > -1 || request.headers['content-type'].indexOf('multipart/form-data') > -1)) {

		// parse the form
		(new formidable.IncomingForm()).parse(request, function(err, fields, files) {

			// append the form info to the request
			request.form = {
				err: err,
				fields: fields,
				files: files
			};

			// parsing complete, move on to post-parsing
			processWebRequest(request, response);

		});

	} else {

		// no parsing to do, move on to post-parsing
		processWebRequest(request, response);

	}

}

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/, '');
};

// HTTP
var http = require('http');
var httpServer = http.createServer(webRequest);
httpServer.listen(8080); // start the HTTP server

// HTTP over SSL
var https = require('https');
var key = fs.readFileSync('etc/privatekey.pem');
var cert = fs.readFileSync('etc/certificate.pem');
var httpsServer = https.createServer({
	key: key, 
	cert: cert
}, webRequest);
httpsServer.listen(8443); // start the HTTPS server
