var incidentService = require('./services/IncidentService');

var args = process.argv.slice(2);
console.log("arguments: "+JSON.stringify(args));
var _priority = args[0];
if (_priority =="P01") _priority = 1;
else if (_priority =="P08") _priority = 2;
else if (_priority =="P16") _priority = 3;
else if (_priority =="P120") _priority = 4;
else _priority = null;



incidentService.flushAll(_priority,function(err,success){
  if (err) console.log("error: "+err.message);
  else console.log("++ OK done: "+success.length+" incidents flushed");
});
