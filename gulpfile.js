var gulp = require('gulp');
var copy = require('gulp-copy');
var tar = require('gulp-tar');
var untar = require('gulp-untar');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');
var zip = require('gulp-zip');
var unzip = require('gulp-unzip');
var mocha = require('gulp-mocha');
var git = require('gulp-git');
var mongojs = require('mongojs');

var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

var config = require('config');



var fs = require('fs');
var moment = require('moment');
var minimist = require('minimist');

var secret = require('./config/secret.json');

var SERVER={};
SERVER.host=config.gulp.deployTarget;
SERVER.port=config.gulp.deployTargetPort;
SERVER.username=secret.deployTargetUser;
SERVER.password=secret.deployTargetPassword;
SERVER.env=config.gulp.deployTargetEnv;

var gulpSSH = require('gulp-ssh')({
  ignoreErrors: false,
  sshConfig: {
    host: SERVER.host,
    port: SERVER.port,
    username: SERVER.username,
    password : SERVER.password
    //privateKey: require('fs').readFileSync('/Users/zensh/.ssh/id_rsa')
  }
});

var src=".";
var mongodb_dev="c:\mongodb";

var version = config.version;
var timestamp = moment(new Date()).format("YYYYMMDD_HHmmss");

var VERSION = require('./package.json').version;
var BASE = config.gulp.baseDir;
var REMOTE_BASE = config.gulp.remoteBaseDir;
var DIST = BASE+"dist/package/";
var DUMP = BASE+"dist/dump/";
var DROPBOX = "Dropbox/_work/space/";
var RESTORE = "./";
var PACKAGE = "space_v"+version+"_build_"+timestamp;
var PACKAGE_EXTENSION = ".zip";
var TRANSFER = DIST+"space.zip";
var INSTALL = "./bin/scripts/*.sh";
var TARGET = './space.zip';
var SCRIPT_TARGET = './space_scripts.zip';

var TRANSFERCONFIG = "./config/production.json";
var TARGETCONFIG = "./space/app/config/production.json";


var REMOTE_SETUP = ['./space_setup.sh'];
var REMOTE_DEPLOY = ['./space/scripts/space_deploy.sh'];
var REMOTE_START = ['./space/scripts/space_start.sh'];
var REMOTE_MONGODUMP = ['./space/scripts/space_mongodump.sh'];
var REMOTE_FILESDUMP = ['./space/scripts/space_filesdump.sh'];
var REMOTE_MONGORESTORE = ['./space/scripts/space_mongorestore.sh'];

var MONGODUMP = 'mongodump_space'+SERVER.env+".zip";
var FILESDUMP = 'filesdump_space.zip';

var MONGORESTORE = DUMP + 'mongodump_space'+SERVER.env+".zip";
var MONGORESTORE_TARGET = './mongorestore_space'+SERVER.env+".zip";



var knownOptions = {
  string: 'target',
  default: { target: 'production' }
};
var options = minimist(process.argv.slice(2),knownOptions);

gutil.log("knownoptions: "+JSON.stringify(knownOptions));

gulp.task('minorrelease', function () {
	gutil.log("current version: "+VERSION);
	gutil.log("increment maintenance: "+incrementVersion("maintenance",VERSION));
	gutil.log("increment minor: "+incrementVersion("minor",VERSION));
	gutil.log("increment major: "+incrementVersion("major",VERSION));

});

gulp.task('installscripts', function () {
  return gulp.src(INSTALL)
    .pipe(gulpSSH.sftp('write', './'));
});


gulp.task('buildfile', function () {
	gutil.log(gutil.colors.magenta('[s p a c e -deploy] create space.build file - '), 'build: '+timestamp);
    return fs.writeFile('./space.build', '{"build":"'+timestamp+'"}');
});


gulp.task('package', function () {
    var _src = ['./**','!logs/**','!.git','!public/files/**','!temp/**','!Dockerfile'];
    gutil.log('[s p a c e - package] package stuff together - ', '_src:'+_src.join(","));
    gutil.log('[s p a c e - package] package name: ', PACKAGE+PACKAGE_EXTENSION);
    gutil.log('[s p a c e - package] destination: ', DIST);

    return gulp.src(_src)
    .pipe(zip(PACKAGE+PACKAGE_EXTENSION))
    .pipe(gulp.dest(DIST));
});

gulp.task('copy',function(){
	 gutil.log("[s p a c e - copy] copy and rename - source: "+DIST+PACKAGE+PACKAGE_EXTENSION);
	 gutil.log("[s p a c e - copy] target: "+TRANSFER);


	 return gulp.src(DIST+PACKAGE+PACKAGE_EXTENSION)
        .pipe(rename(TARGET))
        .pipe(gulp.dest(DIST));

});


gulp.task('transfer', function () {
  gutil.log("[s p a c e - transfer] scp stuff - source: "+TRANSFER,"target: "+TARGET);
  gutil.log("[s p a c e - transfer] ssh config: host: "+SERVER.host+" ,port: "+SERVER.port+" ,username: "+SERVER.username+" , password : "+SERVER.password);

  return gulp.src(TRANSFER)
    .pipe(gulpSSH.sftp('write', TARGET));
});


gulp.task('remotedeploy', function () {
   gutil.log("[s p a c e - remotedeploy] remote deploy - execute: "+REMOTE_DEPLOY.join(','));

   return gulpSSH
    .exec(REMOTE_DEPLOY, {filePath: 'space_remotedeploy.log'})
    .pipe(gulp.dest('logs'));
});

gulp.task('remotestart', function () {
   gutil.log("[s p a c e - remotestart] remote start - execute: "+REMOTE_START.join(','));
   return gulpSSH
    .exec(REMOTE_START, {filePath: 'space_remotestart.log'})
    .pipe(gulp.dest('logs'));
});

gulp.task('done', function () {
  gutil.log("[s p a c e - done] ****** S U C C E S S F U L *******");
  gutil.beep();
  gutil.beep();
  gutil.beep();
  
   return;
});



/**
 * deploys a space version, setup scripts and dumps current server
 */
gulp.task('fullmonty',function(callback){
    gutil.log("[s p a c e -fullmonty] ******");

	runSequence('setup','dump','deploy',callback);
});



/**
 * deploys a space version
 */
gulp.task('deploy',function(callback){
    gutil.beep();
    gutil.log("[s p a c e -deploy] ************************************************************");
    gutil.log("[s p a c e -deploy] ****** going to deploy to: "+SERVER.host+" -> "+SERVER.env);
	runSequence('changelog','setup','buildfile','package','copy','transfer','remotedeploy','remotestart','done',callback);
});

/**
 * deploys a space version
 */
gulp.task('deployconfig',function(callback){
    gutil.beep();
    gutil.log("[s p a c e -deployconfig] ************************************************************");
    gutil.log("[s p a c e -deployconfig] ****** going to deploy new config to: "+SERVER.host+" -> "+SERVER.env);


	runSequence('transferconfig','remotestart','done',callback);

});

gulp.task('transferconfig', function () {
  gutil.log("[s p a c e - transferconfig] scp stuff - source: "+TRANSFERCONFIG,"target: "+TARGETCONFIG);
  gutil.log("[s p a c e - transferconfig] ssh config: host: "+SERVER.host+" ,port: "+SERVER.port+" ,username: "+SERVER.username+" , password : "+SERVER.password);

  return gulp.src(TRANSFERCONFIG)
    .pipe(gulpSSH.sftp('write', TARGETCONFIG));
});


/**
 * dumps all data from mongoDB into a tar file
 * and the stuf in files/directory (uploads)
 */
gulp.task('dump',function(callback){
	runSequence('remotemongodump','remotefilesdump','transfermongodump','transferfilesdump','transfermongodumptodropbox',callback);
});

gulp.task('remotemongodump', function () {
   gutil.log("[s p a c e - remotemongodump] remote monodump - execute: "+REMOTE_MONGODUMP.join(','));

   return gulpSSH
    .exec(REMOTE_MONGODUMP, {filePath: 'space_remotedeploy.log'})
    .pipe(gulp.dest('logs'));
});


gulp.task('remotefilesdump', function () {
   gutil.log("[s p a c e - remotefilesdump] remote files dump - execute: "+REMOTE_FILESDUMP.join(','));

   return gulpSSH
    .exec(REMOTE_FILESDUMP, {filePath: 'space_remotedeploy.log'})
    .pipe(gulp.dest('logs'));
});


// get file from server and write to local
gulp.task('transfermongodump', function () {
  gutil.log("[s p a c e - transfermongodump] transfer mongodump from remote: "+MONGODUMP);
  gutil.log("[s p a c e - transfermongodump] destination: "+DUMP);

	return gulpSSH.sftp('read','./'+MONGODUMP)
    .pipe(gulp.dest(DUMP))
    //.pipe(unzip())
    .pipe(gulp.dest(DUMP+'mongodump_space'+SERVER.env+'_'+timestamp));
});

// get file from server and write to local
gulp.task('transferfilesdump', function () {
  gutil.log("[s p a c e - transferfilesdump] transfer filesdump from remote: "+FILESDUMP);
  gutil.log("[s p a c e - transferfilesdump] destination: "+DUMP);

	return gulpSSH.sftp('read','./'+FILESDUMP)
    .pipe(gulp.dest(DUMP))
    //.pipe(unzip())
    .pipe(gulp.dest(DUMP+'files_space'+SERVER.env+'_'+timestamp));
});

gulp.task('transfermongodumptodropbox',function(){

  var _time = moment().format("YYYYMMDD_HHmmss");
  var _target = BASE+DROPBOX+'dist/data/mongo/'+MONGODUMP+"-"+_time;
  var _source = DUMP+MONGODUMP;

	 gutil.log("[s p a c e - transfermongodumptodropbox] copy the mongozip to dropbox - source:"+_source);
	 gutil.log("[s p a c e - transfermongodumptodropbox] target: "+_target);
	 return gulp.src(_source)
        .pipe(gulp.dest(_target));

});



gulp.task('remotemongorestore', function () {
   gutil.log("[s p a c e - remotemongorestore] remote monorestore - execute: "+REMOTE_MONGORESTORE.join(','));

   return gulpSSH
    .exec(REMOTE_MONGORESTORE, {filePath: 'space_remotedeploy.log'})
    .pipe(gulp.dest('logs'));
});



/**
 * uploads and restores db data
 */
gulp.task('restore',function(callback){
	runSequence('transfermongorestore','remote_untar_mongorestore','remotemongorestore',callback);
});

gulp.task('transfermongorestore', function () {
  gutil.log("[s p a c e -restore] transfer mongorestore to remote: "+MONGORESTORE);
  gutil.log("[s p a c e -restore] destination: "+RESTORE);

  return gulp.src(MONGORESTORE)
    .pipe(gulpSSH.sftp('write', MONGORESTORE_TARGET));
});

gulp.task('remote_untar_mongorestore', function () {
  gutil.log("[s p a c e -remoteuntarscripts] remote untar mongorestore.tar: ");
  return gulpSSH
    .shell(["tar -xvf mongorestore_space${NODE_ENV}.tar"], {filePath: 'space_remotedeploy.log'})
    .pipe(gulp.dest('logs'));
});




gulp.task('remotemongorestore', function () {
   gutil.log("[s p a c e -restore] remote monorestore - execute: "+REMOTE_MONGORESTORE.join(','));

   return gulpSSH
    .exec(REMOTE_MONGORESTORE, {filePath: 'space_remotedeploy.log'})
    .pipe(gulp.dest('logs'));
});






/**
 *  copies s p a c e  scripts to REMOTE
 */
gulp.task('setup',function(callback){
    gutil.log("[s p a c e -setup] ****** going to install latest shell scripts "+SERVER.host+" -> "+SERVER.env);

	runSequence('transferscripts','transfersetup','remoteunpackscripts',callback);
});


gulp.task('transferscripts', function () {
  gutil.log("[s p a c e -transferscripts] remote copy shell scripts - target: "+REMOTE_BASE);
  return gulp.src('bin/scripts/*.sh')
    .pipe(zip('bin/scripts/space_scripts.zip'))
    .pipe(gulpSSH.sftp('write', SCRIPT_TARGET));
});

gulp.task('transfersetup', function () {
  gutil.log("[s p a c e -transfersetup] remote copy shell setup script - target: "+REMOTE_BASE);
  return gulp.src('bin/scripts/space_setup.sh')
    .pipe(gulpSSH.sftp('write', REMOTE_BASE+'space_setup.sh'))
    .pipe(gulpSSH.shell(['chmod 755 ./space_setup.sh']));
});

gulp.task('remoteunpackscripts', function () {
  gutil.log("[s p a c e -remoteunpackscripts] remote unpack space scripts: ");
  return gulpSSH
    .exec(REMOTE_SETUP,{filePath: 'logs/space_remotesetup.log'})
    .pipe(gulp.dest('logs'));
});


gulp.task('lint', function() {
  return gulp.src(['./routes/**.js','./services/**.js','./public/javascripts/kanban/**.js',])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('concat', function() {
  return gulp.src(['./public/javascripts/**/**.js',])
    .pipe(concat('space.js'))
    .pipe(gulp.dest('.'));
});


gulp.task('mocha', function () {
    gutil.log("[s p a c e - mocha unit tests] ****** running all tests");
    return gulp.src('./test/*.js', {read: false})
        .pipe(mocha({reporter: 'nyan'}));
});

// Other actions that do not require a Vinyl
gulp.task('changelog', function(){
  gutil.log("[s p a c e - changelog] ****** creating changelog.json from git commits");
  git.exec({args : 'log --oneline --pretty=format:"%ad:: %s;;" --date=short '}, function (err, changelog) {
    if (err) throw err;
    //console.log(changelog);
      var _loglines = changelog.split(";;");
      var _logitemlist = [];
      for (var i in _loglines){
          var _logitem = {};
          var _linesplit = _loglines[i].split("::");
          _logitem.date = _linesplit[0];
          _logitem.change = _linesplit[1];
          console.log("**** "+JSON.stringify(_logitem));
          _logitemlist.push(_logitem);
      }

      //console.log(JSON.stringify(_logitemlist));

      fs.writeFile("changelog.json", JSON.stringify(_logitemlist), 'utf8', function(err,done){
        gutil.log("[s p a c e - changelog] OK ");
    });


  });
});


/**
 * @param version: type string major.minor.maintenance-build
 */
function incrementVersion(type,version){
	var _v = version.split(".");

	switch (type){
		case "major":
			_v[0] = parseInt(_v[0])+1;
		case "minor":
			_v[1] = parseInt(_v[1])+1;
		case "maintenance":
			_v[2] = parseInt(_v[2])+1;
	}
	return _v.join('.');
}
