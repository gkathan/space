var spaceServices = require('space.services');

var imgservice = require('../services/ImageService');
var orgservice = spaceServices.OrganizationService;
var fs = require('graceful-fs');
//var lwip =require('lwip');
var _ = require('lodash');

var async = require('async');

//var _out = _org[0];
var _out ="out";

convertToCircle();


function convertToCircle(){
  var _dir = "D:/TEMP/pic/bwin.party/";
  console.log("_dir: "+_dir);
  //var _dir = "./temp/testimages/";
  orgservice.findEmployees(function(err,employees){
    var _overall=[];
    fs.readdir(_dir,function(err,files){
    	async.eachSeries(files,
        function(f, done){
          console.log("file: "+f);

          var _split=f.split(".");
          var _first = _split[0];
          var _last = _split[1];

          var _e = _.where(employees,{"Last Name":_.capitalize(_last)});

          var _hit;
          if (_e){
           _hit = _.findWhere(_e,{"First Name":_.capitalize(_first)})

         }

          if (_hit){
            console.log("XXXXXXXXXXXXXXX HIT _employee: "+_hit["Employee Number"]);
            _overall.push(_hit);

            fs.rename(_dir+f, _dir+_hit["Employee Number"], function (err) {
              if (err){
                console.log("error...");
                done();
              }
              else{
                imgservice.convertToCirclePng( _dir+_hit["Employee Number"],100,function(err,result){
                  console.log("done: "+result);
                  done();
                });
              }
            });
          }
          else
            done();
          // ok we need to extract now people data from filename and check against current org

          /*

          if (_.startsWith(f,"E")||_.startsWith(f,"C")){
            imgservice.convertToCirclePng(_dir+f,100,function(err,result){
              console.log("done: "+result);
              done();
            })
          }
          else{
            done();
          }
          */
        },
        function(err){
          if(err){
              console.log('Got an error')
          }
          else{
              console.log('All tasks are done now...');
              console.log("hits: "+_overall.length);
          }
        });
      })
  })

}
