import calendar, time, logging, os

from google.cloud import pubsub_v1

logging.basicConfig(filename='unique_extractor.log', level=logging.DEBUG, format='%(levelname)s:%(asctime)s %(message)s')
logging.info(f'Extracting unique values')

matchSet = set()

project_id = 'big-data-arch-and-engineering'
topic_name = 'match-queue'

publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(project_id, topic_name)

futures = dict()

try:
    ts = calendar.timegm(time.gmtime())
    os.rename('matches-new.log', 'matches-new-' + str(ts) + '.log') 

    matchList = []
    with open('matches-new-' + str(ts) + '.log') as f:
        matchList = f.readlines()

    matchSet = set(matchList)

    with open("unique-matches.txt","a") as f:
        for item in matchSet:
            f.write("%s\n" % item)

            data = item
            publisher.publish(topic_path, data=data.encode('utf-8'))
            logging.info(f'Published message ' + str(item) + ' to queue')
    
except Exception as e:
    logging.error(f'Error occurred {str(e)}, retrying')
    with open("matches-new.log","a") as f:
        for item in matchSet:
            f.write("%s\n" % item)
    logging.error(f'Added match ids to original file')