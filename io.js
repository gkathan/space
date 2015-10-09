// as of
//       https://github.com/expressjs/generator/issues/25
//
var config = require('config');

var io = require('socket.io')() // yes, no server arg here; it's not required
// attach stuff to io
io.sockets.on('connection', function (socket) {
    console.log('[socket.io] says: new user connected!');





    socket.on('disconnect',function(){
      console.log("[socket.io] says: someone disconnected")
    })
});

  // act as socket-client to listen to syncUpdate messages from syncer
  var _url = config.syncUpdate.url;
  var syncerClient = require('socket.io-client')(_url);
  syncerClient.on("message",function(message){
    console.log(".....got syncermessage from: "+_url+" - "+JSON.stringify(message));
    console.log("................................and going to broadcast emit");

    io.sockets.emit("space.message",message);
  });



module.exports = io
