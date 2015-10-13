var imgservice =require('../services/ImageService');
var spaceServices = require('space.services');
var organizationService = spaceServices.OrganizationService;

var fs = require('fs');
//var lwip =require('lwip');
var _ = require('lodash');

var _org = ["E517","E1159","E6928","E7713","E7975","E7996","E8116"];
var _url = "http://localhost:3000/images/employees/";


//var _in = _url+_org[0]+".png";
//var _in = "in.png";
var _in = "http://localhost:3000/images/employees/E517.png";


//var _out = _org[0];
var _out ="out";

//convertToCircle();
convertToSquare();

/*
orgservice.syncEmployeeImages({"Function":"Social Gaming Ukraine"},function(err,result){
//orgservice.syncEmployeeImages({"Employee Number":"E2988"},function(err,result){
  console.log("OK");

})
*/

/*
pngservice.detectType("http://localhost:3000/images/employees/E8116.png",function(err,result){
//orgservice.syncEmployeeImages({"Employee Number":"E2988"},function(err,result){
  console.log("magicNumber: "+result);

})
*/

function convertToSquare(){
  //var _dir = "./temp/employees/";
  var _dir = "./temp/testimages/";
  fs.readdir(_dir,function(err,files){
    for (var f in files){
        console.log("file: "+files[f]);
        //imgservice.squarifyAndCircleCrop(_dir+files[f],function(err,result){
        if (_.startsWith(files[f],"E")){
          imgservice.convertToSquarePng(_dir+files[f],100,function(err,result){
            console.log(": "+result);
          })
        }

    }
  })
}
//

function convertToCircle(){
  var _dir = "./temp/employees/squared/";
  //var _dir = "./temp/testimages/";
  fs.readdir(_dir,function(err,files){
    for (var f in files){
        console.log("file: "+files[f]);
        //imgservice.squarifyAndCircleCrop(_dir+files[f],function(err,result){
        if (_.startsWith(files[f],"E")){
          imgservice.circleCrop(_dir+files[f],function(err,result){
            console.log(": "+result);
          })
        }

    }
  })
}



/*
for (var i in _org){
  console.log("+ "+_url+_org[i]+".png");
  pngservice.squarifyAndCircleCrop(_url+_org[i]+".png",_org[i],function(err,result){
    console.log(_org[i]+": "+result);
  })
}
*/
