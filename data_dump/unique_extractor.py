import calendar, time, logging, os

from library.constants import DATA_ROOT, LOG_ROOT, DATA_BACKUP_ROOT, PROJECT_ID, TOPIC_NAME
from google.cloud import pubsub_v1

logging.basicConfig(filename=LOG_ROOT+'unique_extractor.log', level=logging.DEBUG, format='%(levelname)s:%(asctime)s %(message)s')

match_list = set()

publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(PROJECT_ID, TOPIC_NAME)

futures = dict()

ts = str(calendar.timegm(time.gmtime()))

logging.info(f'Process ID: {ts}: Extracting unique values')
os.rename(DATA_ROOT + 'serial_matches.log', DATA_ROOT + 'serial_matches_' + ts + '.log')

with open(DATA_ROOT + 'serial_matches_' + ts + '.log') as f:
    match_list = f.readlines()

match_list = list(filter(None, [v.rstrip() for v in match_list]))

with open(DATA_ROOT + f'unique_serial_matches.log', "a") as f:
    for item in match_list:
        try:
            f.write("%s\n" % item)
            data = item
            publisher.publish(topic_path, data=data.encode('utf-8'))
            logging.info(f'Process ID: {ts}: Published message {str(item)} to queue')
        except Exception as e:
            logging.error(f'Error occurred {str(e)}, adding remaining match ids to original file')
            with open(DATA_ROOT + 'serial_matches_failed_transactions.log', 'a') as t:
                t.write("%s\n" % item)
            logging.debug(f'Added match id to the serial_matches_failed_transactions.log')

logging.info(f'Process ID: {ts}: Process completed successfully.')
