exports = module.exports = sendTest;

var email = require('emailjs');
var config = require('config');

var server  = email.server.connect({
	user: config.mailer.auth.user,
	password: config.mailer.auth.pass
		host: config.mailer.host,
   ssl:     true
});




function sendTest () {

// send the message and get a callback with an error or details of the message that was sent
server.send({
   text:    "i hope this works", 
   from:    "cactus", 
   to:      "someone <someone@your-email.com>, another <another@your-email.com>",
   cc:      "else <else@your-email.com>",
   subject: "testing emailjs"
}, function(err, message) { console.log(err || message); });



}




