// as of
//       https://github.com/expressjs/generator/issues/25
//
var io = require('socket.io')() // yes, no server arg here; it's not required
// attach stuff to io
io.sockets.on('connection', function (socket) {
    console.log('[socket.io] says: new user connected!');

    socket.on('disconnect',function(){
      console.log("[socket.io] says: someone disconnected")
    })
});

module.exports = io
