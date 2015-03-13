
var gulp = require('gulp');
var rename = require('gulp-rename');

var zip = require('gulp-zip');
var gulpSSH = require('gulp-ssh')({
  ignoreErrors: false,
  sshConfig: {
    host: 'space.bwinparty.corp',
    port: 22,
    username: 'gkathan',
    password : 'bwin123'
    //privateKey: require('fs').readFileSync('/Users/zensh/.ssh/id_rsa')
  }
});

var runSequence = require('run-sequence');

var moment = require('moment');
var config = require('config');



var src=".";
var dist = "C:/Users/gkathan/Dropbox/_work/space/dist";
var mongodb_dev="c:\mongodb";

var version = config.version;
var timestamp = moment(new Date()).format("YYYYMMDD_HHmmss");

var PACKAGE = dist+"/zip/space_v"+version+"_build_"+timestamp+".zip";
var TRANSFER = dist+"/zip/space.zip";



//build number
require('fs').writeFile('./space.build', '{"build":"'+timestamp+'"}');

gulp.task('space_package', function () {
    console.log("...PACKAGE: "+PACKAGE);
    
    return gulp.src(['**','!logs','!git','!public/files'])
        .pipe(zip(PACKAGE))
        .pipe(gulp.dest(dist+"/zip"));
});

gulp.task('space_copy',function(){
	 console.log("PACKAGE: "+PACKAGE);
	 return gulp.src(PACKAGE)
        .pipe(rename(TRANSFER))
        .pipe(gulp.dest(dist+"/zip"));
});


gulp.task('space_transfer', function () {
  return gulp.src(TRANSFER)
    .pipe(gulpSSH.sftp('write', './space.zip'));
});


	
gulp.task('space_remotedeploy', function () {
   return gulpSSH
    .exec(['./space_deploy.sh'], {filePath: 'space_remotedeploy.log'})
    .pipe(gulp.dest('logs'));
});

gulp.task('space_remotestart', function () {
   return gulpSSH
    .exec(['./space_start.sh'], {filePath: 'space_remotestart.log'})
    .pipe(gulp.dest('logs'));
});

gulp.task('space_deploy',function(callback){
	runSequence('space_package','space_copy','space_transfer','space_remotedeploy','space_remotestart',callback);
});
	






// execute commands 
gulp.task('exec', function () {
  return gulpSSH
    .exec(['uptime', 'ls -a', 'pwd'], {filePath: 'commands.log'})
    .pipe(gulp.dest('logs'));
});
 
// get file from server and write to local 
gulp.task('sftp-read', function () {
  return gulpSSH.sftp('read', 'z')
    .pipe(gulp.dest(''));
});
 
// put local file to server 
gulp.task('sftp-write', function () {
  return gulp.src('index.js')
    .pipe(gulpSSH.sftp('write', 'test.js'));
});
 
// execute commands in shell 
gulp.task('shell', function () {
  return gulpSSH
    .shell(['cd /home/thunks', 'git pull', 'npm install', 'npm update', 'npm test'], {filePath: 'shell.log'})
    .pipe(gulp.dest('logs'));
});


gulp.task('default', function() {
  console.log("hello gulp :-)");
});
