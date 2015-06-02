var incidentService = require('./services/IncidentService');
incidentService.rebuildTracker(["openedAt","resolvedAt","closedAt"],function(err,success){
  console.log("++ OK done");
});

/*


    incidentService.rebuildTracker("resolvedAt",function(err,success){
      console.log("++++ "+success);
      incidentService.rebuildTracker("closedAt",function(err,success){
        console.log("+++++++++ "+success);
      });
    });
})
*/
