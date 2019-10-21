import calendar, time, logging, os, json, sys
from match_details_fetcher import getMatchDetails
from constants.constants import LOG_ROOT, NUM_MESSAGES

from google.cloud import pubsub_v1

# System Argument is needed - Name of process for provenance
PROCESS_NAME = sys.argv[1]

logging.basicConfig(filename=LOG_ROOT + 'unique_fetcher.log', level=logging.DEBUG, format='%(levelname)s:%(asctime)s %(message)s')
logging.info(f'Fetching unique match details')

project_id = 'big-data-arch-and-engineering'
subscription_name = 'sub-one'

subscriber = pubsub_v1.SubscriberClient()
subscription_path = subscriber.subscription_path(project_id, subscription_name)

while True:
    try:
        response = subscriber.pull(subscription_path, max_messages=NUM_MESSAGES)
        
        for message in response.received_messages:
            print('calling matchDetails with matchID: ', response.received_messages.message.data)
            getMatchDetails(response.message.data, PROCESS_NAME)
            time.sleep(1)

            ack_list = []
            ack_list.append(message.ack_id)

        subscriber.acknowledge(subscription_path, ack_list)
        logging.info("{}: Acknowledged {}")

    except Exception as e:
        logging.error('Exception: ', e)