#!/bin/bash
. ~/.bash_profile

rm -Rf space_rollback
echo '[space-deploy] says: parking old version in space_rollback folder...'
mv  space space_rollback
echo '[space-deploy] says: going to create and unzip new version...'
mkdir space
mv space.tar.gz space/
# transfer the files directory from roll_back (all the uploads,..)
mkdir -p space/public/files
if [ -d "space_rollback/public/files" ]; then
  cp -a space_rollback/public/files space/public/files 
fi
cd space
gunzip ./space.tar.gz
tar -xvf ./space.tar

