#!/bin/bash


echo 'mongorestore_space${NODE_ENV}'
# check if we have a restore file...
if [ -d mongodump_space${NODE_ENV} ]; then
	# do a dump before restore
	echo "[s p a c e - mongorestore] says: let's do first a dump..."

	mongodump  --db space --out mongodump_space_backup${NODE_ENV}
	tar -cvf mongodump_space_backup${NODE_ENV}.tar mongodump_space_backup${NODE_ENV}
	rm -Rf mongodump_space_backup${NODE_ENV}

	echo "[s p a c e - mongorestore] says: fine dump successfully done: mongodump_space${NODE_ENV}.tar"

	echo "[s p a c e - mongorestore] says: now we can restore from: "
	mongorestore  --drop mongodump_space${NODE_ENV}
	echo "[s p a c e - mongorestore] says: all good :o)"
else
	echo "[s p a c e - mongorestore] says: SORRY but there is NO directory mongorestore_space${NODE_ENV} around .... "

fi


