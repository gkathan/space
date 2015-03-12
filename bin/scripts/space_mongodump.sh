#!/bin/bash
/opt/mongodb/bin/mongodump  --db space --out mongodump_spacePROD
tar -cvf mongodump_spacePROD.tar mongodump_spacePROD
rm -Rf mongodump_spacePROD

