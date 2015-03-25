#!/bin/bash
. ~/.bash_profile

PACKAGE='space_scripts.zip'

# first check whether we have a deploy package..
if [ -a $PACKAGE ]; then
	rm -Rf space/scripts
	mkdir space/scripts -p
	mkdir space/app -p
	mkdir space/dump -p
	unzip -u ./space_scripts.zip -d space/scripts/
	chmod 755 ./space/scripts/*.sh
	rm $PACKAGE


else
	echo "[s p a c e - deploy] says: SORRY but there is NO $PACKAGE around .... "
fi
