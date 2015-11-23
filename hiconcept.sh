#!/bin/bash

APPHOME=.

case "$1" in
  start)
    forever start --minUptime 100000 --spinSleepTime 3000 ${APPHOME}/index.js
    ;;  
  stop)
    forever stop ${APPHOME}/index.js
    ;;  
  list)
    forever list
    ;;  
  *)  
    echo "Usage: $0 {start|stop|list}"
    exit 1
esac
exit 0
