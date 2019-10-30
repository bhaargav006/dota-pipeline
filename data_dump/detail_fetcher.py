import calendar, time, logging, os, json, sys, pytz

from data_dump.match_details_fetcher import getMatchDetails
from library.constants import LOG_ROOT, NUM_MESSAGES, PROJECT_ID, SUBSCRIPTION_NAME
from library.helpers import log_with_process_name

from datetime import datetime
from google.cloud import pubsub_v1

# System Argument ProcesName is needed - Name of process for provenance
PROCESS_NAME = sys.argv[1]
# System Argument Key is needed - To decide which key to use
KEY = sys.argv[2]

# System Argument Collection is needed - To decide which collection to persist to
collection_name = sys.argv[3]

logging.basicConfig(filename=LOG_ROOT + 'detail_fetcher.log', level=logging.DEBUG, format='%(levelname)s:%(asctime)s %(message)s')
logging.info(log_with_process_name(PROCESS_NAME, 'Started'))

subscriber = pubsub_v1.SubscriberClient()
subscription_path = subscriber.subscription_path(PROJECT_ID, SUBSCRIPTION_NAME + '-new')

while True:
    try:
        logging.info(log_with_process_name(PROCESS_NAME, 'Fetching unique match details'))
        response = subscriber.pull(subscription_path, max_messages=NUM_MESSAGES)

        for message in response.received_messages:
            match_id = message.message.data.decode("utf-8")
            logging.debug(log_with_process_name(PROCESS_NAME, f'Calling matchDetails with matchID: {match_id}'))
            
            stage_start_time = pytz.utc.localize(datetime.now()) 
            getMatchDetails(match_id, PROCESS_NAME, KEY, collection_name, stage_start_time)

            ack_list = []
            ack_list.append(message.ack_id)
            subscriber.acknowledge(subscription_path, ack_list)
            logging.info(log_with_process_name(PROCESS_NAME, f'Acknowledged: {message.ack_id}'))

            time.sleep(0.7)

    except Exception as e:
        logging.error('Exception: ', e)
