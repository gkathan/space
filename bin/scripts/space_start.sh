#!/bin/bash

#Find the Process ID for www running instance
echo "....killng running s p a c e  instance"
PID1=`ps -eaf | grep 'forever ./bin/www' | grep -v grep | awk '{print $2}'`
if [[ "" !=  "$PID" ]]; then
  echo "[s p a c e]killing: forever ./bin/www: PID =  $PID1"
  kill -9 $PID1
fi

PID2=`ps -eaf | grep 'space/app/bin/www' | grep -v grep | awk '{print $2}'`
if [[ "" !=  "$PID2" ]]; then
  echo "[s p a c e ] killing space/bin/www: PID = $PID2"
  kill -9 $PID2
fi
. ~/.bash_profile
#nohup npm start > /dev/null 2>&1 &
cd ~/space/app
echo "[s p a c e] init:  run-script startPROD ..."
nohup npm run-script startPROD > /dev/null 2>&1 &
sleep 1
echo "[s p a c e] starting .."
sleep 1
echo "[s p a c e] starting ..."
sleep 1
echo "[s p a c e] starting ...."
sleep 1
echo "[s p a c e] starting ....."
sleep 1
echo "[s p a c e] starting ......"

PIDNEW=`ps -eaf | grep 'space/app/bin/www' | grep -v grep | awk '{print $2}'`
echo "[s p a c e ] new instance RUNNING PID = $PIDNEW"
