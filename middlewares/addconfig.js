/** cactus first custom middleware
 * adds config object to res.locals
 */

var config = require('config');

// the middleware function
module.exports = function() {
    
    return function(req, res, next) {
        res.locals.config=config;
        next();
    }
    
};
