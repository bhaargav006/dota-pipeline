#!/bin/sh

/home/ec2-user/.nvm/versions/node/v12.13.0/bin/node /home/ec2-user/dota-pipeline/dashboard/alert_processor.js

dbError=`cat /home/ec2-user/dota-pipeline/log/dbDownError.txt`
if [ "$dbError" = true ]
then
    echo "FaunaDB failed to respond to the HealthCheck ping at `date`" | mailx -s "Urgent: FaunaDB is DOWN\!" suresh.siddharth@gmail.com srira048@umn.edu prabhjotsinghrai1@gmail.com mishr167@umn.edu
fi

provError=`cat /home/ec2-user/dota-pipeline/log/provenanceError.txt`
if [ "$provError" = true ]
then
    echo "Steam APIs are showing higher response time than normal" | mailx -s "Urgent: API response time spike\!" suresh.siddharth@gmail.com srira048@umn.edu prabhjotsinghrai1@gmail.com mishr167@umn.edu
fi