var spaceServices = require('space.services');

var imgservice = require('../services/ImageService');
var orgservice = spaceServices.OrganizationService;
var fs = require('graceful-fs');
//var lwip =require('lwip');
var _ = require('lodash');

var async = require('async');

var _org = ["E517","E1159","E6928","E7713","E7975","E7996","E8116"];
var _url = "http://localhost:3000/images/employees/";


//var _in = _url+_org[0]+".png";
//var _in = "in.png";
var _in = "http://localhost:3000/images/employees/E517.png";


//var _out = _org[0];
var _out ="out";


convertToCircle();


function convertToCircle(){
  var _dir = "./temp/imagesync/";
  console.log("_dir: "+_dir);
  //var _dir = "./temp/testimages/";
  fs.readdir(_dir,function(err,files){
  	async.eachSeries(files,
      function(f, done){
        console.log("file: "+f);
        if (_.startsWith(f,"E")||_.startsWith(f,"C")){
          imgservice.convertToCirclePng(_dir+f,100,function(err,result){
            console.log("done: "+result);
            done();
          })
        }
        else{
          done();
        }
      },
      function(err){
        if(err){
            console.log('Got an error')
        }
        else{
            console.log('All tasks are done now...');
        }
      });
    })
}
