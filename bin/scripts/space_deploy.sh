#!/bin/bash
. ~/.bash_profile

rm -Rf space_roll_back
echo"[space_deploy] says: parking old version in space_rollback folder..."
mv  space space_rollback
echo"[space_deploy] says: going to create and unzip new version..."
mkdir space
mv space.zip space/
# transfer the files directory from roll_back (all the uploads,..)
cp space_rollback/files space/files 
cd space
unzip ./space.zip
rm space.zip
