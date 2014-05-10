/* globals require, __dirname */
var express = require("express");
var fs = require("fs");
var url = require("url");
var path = require("path");
var _  = require("underscore");
var dbhelpers = require("../SQL/persistent_server");

// Create the main express app.
var app = express();

var server = app.listen(3000, function() {
  console.log("Listening on port %d", server.address().port);
});

// Our global messages array.
var messages = [];

// Our global rooms array.
var rooms = [];

// These headers are extremely important as they allow us to
// run this file locally and get around the same origin policy.
// Without these headers our server will not work.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

// Sends data back to client
var sendData = function (res, data, statusCode) {
  res.writeHead(statusCode || 200, exports.headers);
  res.end(data);
};

// Calls callback on all messages/ rooms
var getFromCollection = function (collection, query, callback) {
  callback(JSON.stringify({results: messages}), 200);
};

// Adds message/ room to messages/rooms and calls callback to return results
var postToCollection = function (collectionName, query, callback) {
  // We take the O(n) hit here, once per message,
  // rather than reversing the list on the client
  // every time we make a GET request.
  // collection.unshift(JSON.parse(query));

  console.log('query: ',query)

  if (collectionName === 'rooms') {
    //insert the room
    console.log(JSON.parse(query).name);
    dbhelpers.insertRoom(JSON.parse(query).name,function(){
      console.log('Room added.');
    });
  } else if (collectionName === 'messages') {
    //insert the message
  }



  // Dole out the right response code.
  callback("Messages Received.", 201);
};

// Routes requests
var setupCollection = function (app, collectionName, collection) {
  var collectionURL = "/classes/" + collectionName; // Fewer allocated strings.
  app.get(collectionURL, function (req, res) {
    console.log("Serving a get request on: " + collectionURL);
    getFromCollection(collection, url.parse(req.url).query, _.partial(sendData, res));
  });

  app.post(collectionURL, function (req, res) {
    console.log("Serving a post request on: " + collectionURL);
    // Such is the power of currying.
    // _ = missing middle argument = the data from the post request
    fromPostRequest(req, _.partial(postToCollection, collectionName, _, _.partial(sendData, res)));
  });
};

// Calls callback on data from POST request
var fromPostRequest = function (req, callback) {
  var body = "";
  req.on("data", function (data) {
    body += data;
    // We do this seemingly tedious thing to protect
    // against DOS attacks, so one huge message can't
    // crash our server.
    if (body.length > 1e3) {
      req.connection.destroy();
    }
  });
  req.on("end", function () {
    callback(body);
  });
};

// Just redirect root to index.html
app.get("/", function(req, res){
  res.sendfile("./client/index.html");
});

setupCollection(app, "messages", messages);
setupCollection(app, "rooms", rooms);

app.configure(function () {
  // Some catch-all express magic to serve all of our client
  // css and js easily. This is much dirtier in vanilla node.
  app.use(express.static(path.join(__dirname, "../client")));
});
