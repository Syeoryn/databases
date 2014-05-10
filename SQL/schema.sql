DROP DATABASE chat;
CREATE DATABASE chat;

USE chat;

CREATE TABLE messages (
  text VARCHAR (140),
  messageId INT NOT NULL AUTO_INCREMENT,
  createdAt VARCHAR (26),
  userId INT,
  roomId INT,
  PRIMARY KEY (messageId)
);

CREATE TABLE rooms (
  roomname VARCHAR (20),
  roomId INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (roomId),
  UNIQUE KEY (roomname)
);

CREATE TABLE users (
  username VARCHAR (20),
  userId INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (userId),
  UNIQUE KEY (username)
);

/*  Execute this file from the command line by typing:
 *    mysql < schema.sql
 *  to create the database and the tables.*/
