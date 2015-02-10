// list of banned IPs
var banned = [
'::ffff:127.0.0.1',
'localhost',
'192.168.2.12'
];

// the middleware function
module.exports = function() {
    
    return function(req, res, next) {
        console.log("ipban middleware called: req.connection.remoteAddress = "+req.connection.remoteAddress);
        console.log("ipban middleware called: banned.indexOf(req.connection.remoteAddress) = "+banned.indexOf(req.connection.remoteAddress));
        
        if (banned.indexOf(req.connection.remoteAddress) > -1) {
            res.end('Banned');
        }
        else { next(); }
    }
    
};
