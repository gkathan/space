/**
 * authentication service
 */
var _ = require('lodash');

// logger
var winston = require('winston');
var logger = winston.loggers.get('space_log');

exports.ensureAuthenticated = _ensureAuthenticated;

function _ensureAuthenticated(req, res, allow) {
	logger.debug("[CHECK AUTHENTICATED]");
  if (req.session.AUTH && allow.indexOf(req.session.AUTH)>-1 ){
		console.log("ensureAuth: OK");
		return true;
	}
	else {
	  logger.debug("[*** NOT AUTHENTICATED **]");
    req.session.ORIGINAL_URL = req.originalUrl;
		//req.session.destroy();
	  //res.redirect("/login");
    return false
	}
}
