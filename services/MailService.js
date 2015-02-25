/**
 * mailing service
 */



var email = require('emailjs');
var config = require('config');


var signatureHtml="<style>html {position: relative;min-height: 100%;}body {background-color: #f9f9f9;font-family: RobotoDraft,  Helvetica, Arial;-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;-webkit-tap-highlight-color: rgba(0,0,0,0);-webkit-touch-callout: none; overflow: auto; argin-bottom: 20px;}</style>"

var signatureText="\n________________________________\n:: this is an automatically generated mail - please do not reply to this email - in case of questions please contact gerold.kathan@bwinparty.com\n\n:: bpty   s t u d i o s | commercial management";
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









