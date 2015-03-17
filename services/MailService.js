/**
 * mailing service
 */



var email = require('emailjs');
var config = require('config');


var signatureHtml=config.mailer.signatureHtml;
var signatureText=config.mailer.signatureText;
var subjectPrefix = "";


var server  = email.server.connect({
//	user: config.mailer.auth.user,
//	password: config.mailer.auth.pass,
	host: config.mailer.host,
	port: config.mailer.port,
	ssl:     false
});




/**
 * 
 */
exports.sendText = function send (mail) {

// send the message and get a callback with an error or details of the message that was sent
server.send({
   text:    mail.text+signatureText, 
   from:    config.mailer.from, 
   to:      mail.to,
   cc:      mail.cc,
   subject: subjectPrefix+mail.subject,

	}, function(err, message) { console.log(err || message); });

}

exports.sendHtml = function send (mail) {

// send the message and get a callback with an error or details of the message that was sent
server.send({
   from:    config.mailer.from, 
   to:      mail.to,
   cc:      mail.cc,
   subject: subjectPrefix+mail.subject,
    attachment: 
   [
      {data:mail.html+signature, alternative:true}
     
   ]
	}, function(err, message) { console.log(err || message); });


}









