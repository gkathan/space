exports = module.exports = sendTest;

var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var config = require('config');


function sendTest () {
	// create reusable transporter object using SMTP transport
	var transporter = nodemailer.createTransport(smtpTransport({
		host: config.mailer.host,
		port: config.mailer.port,
		auth: {
			user: config.mailer.auth.user,
			pass: config.mailer.auth.pass
		}	
	}));

	// NB! No need to recreate the transporter object. You can use
	// the same transporter object for all e-mails

	// setup e-mail data with unicode symbols
	var mailOptions = {
		from: 'kanbanv2mailer ✔ <gerold.kathan@bwinparty.com>', // sender address
		to: 'gerold.kathan@bwinparty.com', // list of receivers
		subject: 'Hello from kanbanv2 ✔', // Subject line
		text: '...started✔', // plaintext body
		html: '<b>kanbanv2 ✔</b> just started ' // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
		if(error){
			//console.log("nodemailer says: "+error+" on trying to send via "+JSON.stringify(mailOptions));
			console.log(error);
		}else{
			console.log('Message sent: ' + info.response);
		}
	});
}




