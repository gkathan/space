#!/bin/bash
. ~/.bash_profile

echo "[s p a c e - mongodump] says: dumping... mongodump_space${NODE_ENV}.zip"

mongodump  --db space --out mongodump_space${NODE_ENV}
zip mongodump_space${NODE_ENV}.zip mongodump_space${NODE_ENV} -r
rm -Rf mongodump_space${NODE_ENV}
