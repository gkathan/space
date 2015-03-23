var gulp = require('gulp');
var copy = require('gulp-copy');
var tar = require('gulp-tar');
var untar = require('gulp-untar');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var runSequence = require('run-sequence');
var zip = require('gulp-zip');
var tar = require('gulp-tar');

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
var RESTORE = "./";
var PACKAGE = "space_v"+version+"_build_"+timestamp;
var PACKAGE_EXTENSION = ".zip";
var TRANSFER = DIST+"space.zip";
var INSTALL = "./bin/scripts/*.sh";
var TARGET = './space.zip';
var SCRIPT_TARGET = './space_scripts.zip';


var REMOTE_SETUP = ['./space_setup.sh'];
var REMOTE_DEPLOY = ['./space/scripts/space_deploy.sh'];
var REMOTE_START = ['./space/scripts/space_start.sh'];
var REMOTE_MONGODUMP = ['./space/scripts/space_mongodump.sh'];
var REMOTE_FILESDUMP = ['./space/scripts/space_filesdump.sh'];
var REMOTE_MONGORESTORE = ['./space/scripts/space_mongorestore.sh'];

var MONGODUMP = './mongodump_space'+SERVER.env+".tar";
var FILESDUMP = './filesdump_space'+SERVER.env+".tar";

var MONGORESTORE = DUMP + 'mongodump_space'+SERVER.env+".tar";
var MONGORESTORE_TARGET = './mongorestore_space'+SERVER.env+".tar";

gutil.beep();

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
    var _src = ['./**','!logs','!.git','!public/files','!temp','!Dockerfile'];
    gutil.log('[s p a c e -deploy] package stuff together - ', '_src:'+_src.join(","));
    gutil.log('[s p a c e -deploy] package name: ', PACKAGE+PACKAGE_EXTENSION);
    return gulp.src(_src)
    .pipe(zip(PACKAGE+PACKAGE_EXTENSION))
    .pipe(gulp.dest(DIST));
});

gulp.task('copy',function(){
	 gutil.log("[s p a c e -deploy] copy and rename - source: "+DIST+PACKAGE+PACKAGE_EXTENSION);
	 gutil.log("[s p a c e -deploy] target: "+TRANSFER);


	 return gulp.src(DIST+PACKAGE+PACKAGE_EXTENSION)
        .pipe(rename(TARGET))
        .pipe(gulp.dest(DIST));

});


gulp.task('transfer', function () {
  gutil.log("[s p a c e -deploy] scp stuff - source: "+TRANSFER,"target: "+TARGET);
  gutil.log("[s p a c e -deploy] ssh config: host: "+SERVER.host+" ,port: "+SERVER.port+" ,username: "+SERVER.username+" , password : "+SERVER.password);

  return gulp.src(TRANSFER)
    .pipe(gulpSSH.sftp('write', TARGET));
});


gulp.task('remotedeploy', function () {
   gutil.log("[s p a c e -deploy] remote deploy - execute: "+REMOTE_DEPLOY.join(','));

   return gulpSSH
    .exec(REMOTE_DEPLOY, {filePath: 'space_remotedeploy.log'})
    .pipe(gulp.dest('logs'));
});

gulp.task('remotestart', function () {
   gutil.log("[s p a c e -deploy] remote start - execute: "+REMOTE_START.join(','));
   return gulpSSH
    .exec(REMOTE_START, {filePath: 'space_remotestart.log'})
    .pipe(gulp.dest('logs'));
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
    gutil.log("[s p a c e -deploy] ****** going to deploy to: "+SERVER.host+" -> "+SERVER.env);

	runSequence('setup','buildfile','package','copy','transfer','remotedeploy','remotestart',callback);
});


/**
 * dumps all data from mongoDB into a tar file
 * and the stuf in files/directory (uploads)
 */
gulp.task('dump',function(callback){
	runSequence('remotemongodump','remotefilesdump','transfermongodump','transferfilesdump',callback);
});

gulp.task('remotemongodump', function () {
   gutil.log("[s p a c e -deploy] remote monodump - execute: "+REMOTE_MONGODUMP.join(','));

   return gulpSSH
    .exec(REMOTE_MONGODUMP, {filePath: 'space_remotedeploy.log'})
    .pipe(gulp.dest('logs'));
});


gulp.task('remotefilesdump', function () {
   gutil.log("[s p a c e -deploy] remote files dump - execute: "+REMOTE_FILESDUMP.join(','));

   return gulpSSH
    .exec(REMOTE_FILESDUMP, {filePath: 'space_remotedeploy.log'})
    .pipe(gulp.dest('logs'));
});


// get file from server and write to local
gulp.task('transfermongodump', function () {
  gutil.log("[s p a c e -deploy] transfer mongodump from remote: "+MONGODUMP);
  gutil.log("[s p a c e -deploy] destination: "+DUMP);

	return gulpSSH.sftp('read',MONGODUMP)
    .pipe(gulp.dest(DUMP))
    .pipe(untar())
    .pipe(gulp.dest(DUMP+'mongodump_space'+SERVER.env+'_'+timestamp));
});

// get file from server and write to local
gulp.task('transferfilesdump', function () {
  gutil.log("[s p a c e -deploy] transfer filesdump from remote: "+FILESDUMP);
  gutil.log("[s p a c e -deploy] destination: "+DUMP);

	return gulpSSH.sftp('read',FILESDUMP)
    .pipe(gulp.dest(DUMP))
    .pipe(untar())
    .pipe(gulp.dest(DUMP+'files_space'+SERVER.env+'_'+timestamp));
});


gulp.task('remotemongorestore', function () {
   gutil.log("[s p a c e -deploy] remote monorestore - execute: "+REMOTE_MONGORESTORE.join(','));

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