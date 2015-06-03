/**
* rebuilds the full dailytracker collection
*/
var incidentTrackerService = require('./services/IncidentTrackerService');
incidentTrackerService.rebuildTracker(["openedAt","resolvedAt","closedAt"],function(err,success){
  console.log("++ OK done");
});
