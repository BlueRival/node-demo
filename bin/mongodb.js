// only need one of these for the entire controller
var mongodb = require('mongodb');
var server = new mongodb.Server("127.0.0.1", 27017, {});
var client = new mongodb.Db('test', server);
var var_dump = function (data) { require('util').debug(require('util').inspect(data)); };

module.exports.exec = function(request, response) {

	function process(err, collection) {

		// if there is post data, insert into mongo first
		if (!err && request.form) {
			
			collection.insert(request.form.fields, function(err, docs) {
				sendResponse(response, collection);
			});
		} else {
			sendResponse(response, collection);
		}

	}

	// open the db before we start processing the request
	client.open(function(err, p_client) {
		client.collection('nodejs_demo', process);
	});

};



function sendResponse(response, collection) {

	// Locate all the entries using find
	collection.find().toArray(function(err, results) {

		if (err) {
			response.writeHead(500, {
				'Content-Type': 'text/html'
			});

			response.end('<!DOCTYPE html>' +
				'<html>' +
				'  <head>' +
				'    <title>MongoDB Error</title>' +
				'    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' +
				'  </head>' +
				'  <body>' +
				'    ' + err +
				'  </body>' +
				'</html>');
		} else {
			response.writeHead(200, {
				'Content-Type': 'text/html'
			});

			response.end('<!DOCTYPE html>' +
				'<html>' +
				'  <head>' +
				'    <title>MongoDB</title>' +
				'    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' +
				'  </head>' +
				'  <body>' +
				'    <form enctype="multipart/form-data" method="post">' +
				'      <input type="text" name="one">' +
				'      <input type="text" name="two">' +
				'      <input type="text" name="three">' +
				'      <input type="text" name="four">' +
				'      <input type="file" name="file" multiple="multiple">' +
				'     <input type="submit" value="Submit">' +
				'    </form>' +
				'    <br/>' +
				'    MongoDB Entries:<br/>' +
				'    <pre>' + require('util').inspect(results) + '</pre>' +
				'  </body>' +
				'</html>');
		}
		// Let's close the db
		client.close();
	});
}