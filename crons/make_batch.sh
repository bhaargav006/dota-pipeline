#!/bin/bash

PROJECT_ROOT="$HOME/dota-pipeline"

cd "$PROJECT_ROOT/data_dump" || return
PROCESS_NAME=$(date +%s)
LOG_FILE="$PROJECT_ROOT/log/make_batch.log"
MATCH_FILE="$PROJECT_ROOT/data/serial_matches.log"
DESTINATION_MATCH_FILE="$PROJECT_ROOT/data/serial_matches_$PROCESS_NAME.log"
if [ -f $MATCH_FILE ]
then
  echo "Info: Process: $PROCESS_NAME: File serial_matches.log found, renaming the file to serial_matches_$PROCESS_NAME" >> $LOG_FILE
  mv "$MATCH_FILE" "$DESTINATION_MATCH_FILE"
  # activating the virtual environment
  source "$HOME/env/bin/activate"
  # running the script
  PYTHONPATH="$PROJECT_ROOT" GOOGLE_APPLICATION_CREDENTIALS=big-data-arch-and-engineering-331470f88904.json python "unique_extractor.py" "$PROCESS_NAME"
else
  echo "Error: Process: $PROCESS_NAME: File not found!" >> $LOG_FILE
fi