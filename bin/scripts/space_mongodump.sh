#!/bin/bash

mongodump  --db space --out mongodump_space${NODE_ENV}
tar -cvf mongodump_space${NODE_ENV}.tar mongodump_space${NODE_ENV}
rm -Rf mongodump_space${NODE_ENV}

