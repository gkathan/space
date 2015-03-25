#!/bin/bash
echo '[s p a c e - deploy] says: rolling back old version'
mv space/app space/app_rollforward
mv space/app_rollback space/app
