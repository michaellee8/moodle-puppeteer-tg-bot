#!/usr/bin/env bash
echo "Executing Moodle monitor bot's bootstrap script"
echo "Starting ssdb instances"
docker-compose up -d ssdb-credentials ssdb-users ssdb-status
echo "3 ssdb instances started"
echo "Running credential setup script"
docker-compose run cred
echo "Credentials are setup"
if [[ $1 != "-y" ]]; then
    echo "Please add the bot's token here"
    nano docker-compose.yml
    echo "Bot token added"
fi
echo "Starting bot instance"
docker-compose up -d bot
echo "Bot instance started"
echo "Starting worker instance"
docker-compose up -d worker
echo "Worker instance started"
echo "The app is running now, happy skipping lessons!"