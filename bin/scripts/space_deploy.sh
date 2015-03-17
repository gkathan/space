#!/bin/bash
. ~/.bash_profile

<<<<<<< Updated upstream
PACKAGE='space.tar.gz'
PACKAGE_TAR='space.tar'

# first check whether we have a deploy package..
if [ -a $PACKAGE ]; then
	rm -Rf space/app_rollback
	echo '[s p a c e - deploy] says: parking old version in "space_rollback" folder...'
	mv  space/app space/app_rollback
	echo "[s p a c e - deploy] says: going to unpack and deploy from: $PACKAGE"
	mkdir space/app -p
	mv $PACKAGE space/app/
	# transfer the files directory from roll_back (all the uploads,..)
	mkdir -p space/app/public/files
	if [ -d "space/app_rollback/public/files" ]; then
	  cp -a space/app_rollback/public/files space/app/public/files 
	fi
	cd space/app
	gunzip ./$PACKAGE
	tar -xvf ./$PACKAGE_TAR
else
	echo "[s p a c e - deploy] says: SORRY but there is NO $PACKAGE around .... "
fi
=======
rm -Rf space_rollback
echo '[space_deploy] says: parking old version in space_rollback folder...'
mv  space space_rollback
echo '[space_deploy] says: going to create and unzip new version...'
mkdir space
mv space.zip space/
# transfer the files directory from roll_back (all the uploads,..)
mkdir -p space/public/files
cp -a space_rollback/public/files space/public/files 
cd space
unzip ./space.zip
rm space.zip
>>>>>>> Stashed changes
