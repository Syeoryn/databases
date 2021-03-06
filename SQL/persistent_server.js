var mysql = require('mysql');
/* If the node mysql module is not found on your system, you may
 * need to do an "sudo npm install -g mysql". */

/* You'll need to fill the following out with your mysql username and password.
 * database: "chat" specifies that we're using the database called
 * "chat", which we created by running schema.sql.*/
var dbConnection = mysql.createConnection({
  user: "root",
  password: "",
  database: "chat"
});

dbConnection.connect();
/* Now you can make queries to the Mysql database using the
 * dbConnection.query() method.
 * See https://github.com/felixge/node-mysql for more details about
 * using this module.*/

/* You already know how to create an http server from the previous
 * assignment; you can re-use most of that code here. */


exports.getUserId = function(username,success){
  dbConnection.query('SELECT userId from chat.users where username = "' + username + '"', function(err, rows){
    if (err) {
      console.error('Error at getUserId ' + err);
    } else {
      if(rows[0] === undefined){
        console.log('Creating user.');
        exports.insertUser(username,success);
      } else {
        success(rows[0].userId);
      }
    }
  });
};

exports.getRoomId = function(roomname, success) {
  dbConnection.query('SELECT roomId from chat.rooms where roomname = "' + roomname + '"', function(err, rows){
    if (err) {
      console.error('Error at getRoomId ' + err);
    } else {
      success(rows[0].roomId);
    }
  });
};

exports.insertUser = function(username, success) {
  dbConnection.query('INSERT into chat.users values ("' + username + '", null)', function(err, rows){
    if (err) {
      console.error('Error at insert user ' + err);
    } else {
      // rows.insertId is the inserted id !!
      console.log(rows);
      console.log('User added.');
      success(rows.insertId.userId);
    }
  });
};

exports.insertMessage = function(message, userId, roomId, success) {
  var createdAt = (new Date()).toISOString();

  // createdAt /= 10000;
  var query = 'INSERT into chat.messages values("' + message + '",null,"' + createdAt + '","' + userId + '","' + roomId + '");';
  console.log(query);
  dbConnection.query(query,function(err,rows){
    if(err){
      console.error(err);
    } else {
      console.log(rows);
      success(rows);
    }
  });
};

exports.insertRoom = function(roomname, callback){
  dbConnection.query('INSERT into chat.rooms values ("' + roomname + '", null);',function(err,rows){
    if(err){
      console.error(err);
    } else {
      callback(rows.insertId);
    }
  });
};

exports.getUserName = function(userId, callback){
  console.log('getting user name');
  dbConnection.query('SELECT username from chat.users where userId = ' + userId + ';', function(err,rows){
    if (err){
      console.error(err);
    } else {
      // rows[0].username is a specific username
      callback(rows[0].username);
    }
  });
};

exports.getRooms = function(callback){
  dbConnection.query('SELECT * from chat.rooms;', function(err,rows){
    if (err){
      console.error(err);
    } else {
      // Rows is array of objects with roomname and roomId
      callback(rows);
    }
  });
};

exports.getMessages = function(callback){
  dbConnection.query('SELECT * from chat.messages;', function(err,rows){
    if (err) {
      console.error(err);
    } else {
      // Rows is array of objects with all message properties
      callback(rows);
    }
  });
};
