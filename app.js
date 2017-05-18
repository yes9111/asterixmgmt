#!/usr/bin/env nodemon
'use strict'

var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

http.createServer(function(request, response){
	var STATIC_PREFIX = '/static/';

	if(request.url === '/'){
		fs.createReadStream('static/index.html').pipe(response);
	}
	else if(request.url.substring(0, STATIC_PREFIX.length) === STATIC_PREFIX){
		// set correct mime type
		response.setHeader('Content-Type', mime.lookup(request.url));
		var staticUrl = request.url.substring(STATIC_PREFIX.length);
		var staticPath = path.join('static/', staticUrl);
		fs.createReadStream(staticPath).pipe(response);
	}
	else if(request.url == '/favicon.ico'){
    return;
  }
	else{
		//console.log(url.format(reqUrl));
		http.get({
			path: request.url,
			port: 19002,
			hostname: '192.168.0.16',
			headers: {
				'Content-Type': 'application/json'
			}
		}, function(asterixResponse){
			asterixResponse.pipe(response);
		});
	}
}).listen(3000, function(){
  console.log('Server is listening on port 3000.');
});
