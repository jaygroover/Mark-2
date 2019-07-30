require("dotenv").config();
var db = require("./models");
var express = require("express");
var app = express();
var server=require("http").createServer(app);
const mongo = require('mongodb').MongoClient;
// const client = require('socket.io').listen(4000).sockets;
const client = require('socket.io').listen(server).sockets;
var mongoose = require('mongoose');

// Set up the express app
var PORT = process.env.PORT || 8080;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.text({ type: "text/html" }));
app.use(express.static("app"));

// Routes
// =============================================================
require("./routes/supplier-routes.js")(app);
require("./routes/htmlRoutes.js")(app);
// require("./routes/account-routes.js")(app);

app.get("/livechat", function(req, res) {
    console.log("livechat");
    res.sendFile(__dirname + "/livechat.html");
  });
// ensures that data in server does not get cleared
var syncOptions = { force: false };

//If running a test, set syncOptions.force to true so that our data in server is cleared
if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/
// db.sequelize.sync(syncOptions).then(function() {
//   app.listen(PORT, function() {
    server.listen(PORT, function() {
    console.log(
      "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
      PORT,
      PORT
    );
  });

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongochat";

// mongoose.connect(MONGODB_URI);
mongoose.connect(MONGODB_URI, { useNewUrlParser: true },function(err, db){
         if(err){
            throw err;
         }

console.log('MongoDB connected...');

    // Connect to Socket.io
    client.on('connection', function(socket){
        let chat = db.collection('chats');

        // Create function to send status
        sendStatus = function(s){
            socket.emit('status', s);
        }

        // Get chats from mongo collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
            if(err){
                throw err;
            }

            // Emit the messages
            socket.emit('output', res);
        });

        // Handle input events
        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;

            // Check for name and message
            if(name == '' || message == ''){
                // Send error status
                sendStatus('Please enter a name and message');
            } else {
                // Insert message
                chat.insertOne({name: name, message: message}, function(){
                    client.emit('output', [data]);

                    // Send status object
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });

        // Handle clear
        socket.on('clear', function(data){
            // Remove all chats from collection
            chat.deleteMany({}, function(){
                // Emit cleared
                socket.emit('cleared');
            });
        });
    });
        }
    );

  // Connect to mongo
// mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db){
//     if(err){
//         throw err;
//     }

    // console.log('MongoDB connected...');

    // // Connect to Socket.io
    // client.on('connection', function(socket){
    //     let chat = db.collection('chats');

    //     // Create function to send status
    //     sendStatus = function(s){
    //         socket.emit('status', s);
    //     }

    //     // Get chats from mongo collection
    //     chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
    //         if(err){
    //             throw err;
    //         }

    //         // Emit the messages
    //         socket.emit('output', res);
    //     });

    //     // Handle input events
    //     socket.on('input', function(data){
    //         let name = data.name;
    //         let message = data.message;

    //         // Check for name and message
    //         if(name == '' || message == ''){
    //             // Send error status
    //             sendStatus('Please enter a name and message');
    //         } else {
    //             // Insert message
    //             chat.insert({name: name, message: message}, function(){
    //                 client.emit('output', [data]);

    //                 // Send status object
    //                 sendStatus({
    //                     message: 'Message sent',
    //                     clear: true
    //                 });
    //             });
    //         }
    //     });

    //     // Handle clear
    //     socket.on('clear', function(data){
    //         // Remove all chats from collection
    //         chat.remove({}, function(){
    //             // Emit cleared
    //             socket.emit('cleared');
    //         });
    //     });
    // });
// });
// });

module.exports = app;
