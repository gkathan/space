#!/bin/bash
. ~/.bash_profile

PACKAGE='space.zip'

# first check whether we have a deploy package..
if [ -a $PACKAGE ]; then
	rm -Rf space/app_rollback_old

	if  [ -d "space/app_rollback" ]; then
		mv space/app_rollback space/app_rollback_old
	fi

	echo '[s p a c e - deploy] says: parking old version in "space_rollback" folder...'
	mv  space/app space/app_rollback
	echo "[s p a c e - deploy] says: going to unpack and deploy from: $PACKAGE"
	mkdir space/app -p


	mv $PACKAGE space/app/
	# transfer the files directory from roll_back (all the uploads,..)

	if [ -d "space/app_rollback/public/files" ]; then
		echo "handle firereports"
		mkdir space/app/public/files/firereports -p
		cp -r space/app_rollback/public/files/firereports/* space/app/public/files/firereports/
	fi

	cd space/app
	unzip ./$PACKAGE

else
	echo "[s p a c e - deploy] says: SORRY but there is NO $PACKAGE around .... "
fi
