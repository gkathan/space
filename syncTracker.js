/**
* rebuilds the full dailytracker collection
*/

var prios=["P01","P08","P16","P120"];
var incidentTrackerService = require('./services/IncidentTrackerService');
incidentTrackerService.rebuildTracker(["openedAt","resolvedAt","closedAt"],prios,function(err,success){
  console.log("++ OK done");
});
