#!/bin/bash
. ~/.bash_profile

PACKAGE='space.tar.gz'
PACKAGE_TAR='space.tar'

# first check whether we have a deploy package..
if [ -a $PACKAGE ]; then
	rm -Rf space/app_rollback
	echo '[s p a c e - deploy] says: parking old version in "space_rollback" folder...'
	sudo mv  space/app space/app_rollback
	echo "[s p a c e - deploy] says: going to unpack and deploy from: $PACKAGE"
	mkdir space/app -p
	

	sudo mv $PACKAGE space/app/
	# transfer the files directory from roll_back (all the uploads,..)
	
	if [ -d "space/app_rollback/public/files" ]; then
	  mkdir -p space/app/public/files
	  cp -a space/app_rollback/public/files space/app/public/files 
	fi
	
	cd space/app
	gunzip ./$PACKAGE
	tar -xvf ./$PACKAGE_TAR
else
	echo "[s p a c e - deploy] says: SORRY but there is NO $PACKAGE around .... "
fi
