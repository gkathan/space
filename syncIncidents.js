var incidentService = require('./services/IncidentService');
incidentService.flushAll(function(err,success){

  if (err) console.log("error: "+err.message);
  else console.log("++ OK done: "+success.length+" incidents flushed");
});
