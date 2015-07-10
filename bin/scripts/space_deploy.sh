#!/bin/bash
. ~/.bash_profile

PACKAGE='space.zip'
SPACE_HOME='/home/gkathan/space'

# first check whether we have a deploy package..
if [ -a $PACKAGE ]; then
	rm -Rf $SPACE_HOME/app_rollback_old

	if  [ -d $SPACE_HOME/app_rollback ]; then
		mv $SPACE_HOME/app_rollback $SPACE_HOME/app_rollback_old
	fi

	echo '[s p a c e - deploy] says: parking old version in "space_rollback" folder...'
	mv  $SPACE_HOME/app $SPACE_HOME/app_rollback
	echo "[s p a c e - deploy] says: going to unpack and deploy from: $PACKAGE"
	mkdir $SPACE_HOME/app -p


	mv $PACKAGE $SPACE_HOME/app/

	# transfer the files directory from roll_back (all the uploads,..)
	if [ -d "space/app_rollback/public/files" ]; then
		echo "handle IT service reports"
		mkdir $SPACE_HOME/app/public/files/itservicereports -p
		cp -r $SPACE_HOME/app_rollback/public/files/itservicereports/* $SPACE_HOME/app/public/files/itservicereports/

		echo "handle HOWTOs"
		mkdir $SPACE_HOME/app/public/files/howto -p
		cp -r $SPACE_HOME/app_rollback/public/files/howto/* $SPACE_HOME/app/public/files/howto/
	fi

	cd $SPACE_HOME/app
	unzip ./$PACKAGE



else
	echo "[s p a c e - deploy] says: SORRY but there is NO $PACKAGE around .... "
fi
