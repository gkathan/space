#!/bin/bash
. ~/.bash_profile

PACKAGE='public.bpty.zip'
SPACE_HOME='/home/gkathan/space'

# first check whether we have a deploy package..
if [ -a $PACKAGE ]; then
	mv $PACKAGE $SPACE_HOME/app/public/
	cd $SPACE_HOME/app/public
	unzip -o ./$PACKAGE

else
	echo "[s p a c e - deploy] says: SORRY but there is NO $PACKAGE around .... "
fi
