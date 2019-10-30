import logging

from faunadb import query as q
from faunadb.client import FaunaClient

from library.constants import DATA_ROOT, LOG_ROOT, DATABASE_URL, PROJECT_ID, DATA_TOPIC_NAME
from google.cloud import pubsub_v1

logging.basicConfig(filename=LOG_ROOT+'match_process_enqueuer.log', level=logging.DEBUG, format='%(levelname)s:%(asctime)s %(message)s')

publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(PROJECT_ID, DATA_TOPIC_NAME)

client = FaunaClient(secret="secret", domain=DATABASE_URL, scheme="http", port="8443")


def enqueue_match_ids(match_ids):
    for match_id in match_ids:
        try:
            data = match_id
            publisher.publish(topic_path, data=data.encode('utf-8'))
        except Exception as e:
            logging.error(f'Error occurred {str(e)}')
            with open(DATA_ROOT + 'match_process_enqueue_failed.log', 'a') as t:
                t.write("%s\n" % match_id)
            logging.debug(f'Added match id = {match_id} to the match_process_enqueue_failed.log')


def fetch_matches_from_db(afterPtr, isFirstPage):
    try:
        all_matches = []
        if isFirstPage:
            all_matches = client.query(
                q.paginate(
                    q.match(q.index("all_raw_matches")),
                    size=100
                )
            )
        else:
            all_matches = client.query(
                q.paginate(
                    q.match(q.index("all_raw_matches")),
                    size=100,
                    after=afterPtr
                )
            )

        all_matches_data = all_matches['data']
        match_ids = []

        for match in all_matches_data:
            match_id = match.value['id']
            match_ids.append(match_id)

        enqueue_match_ids(match_ids)

        all_matches_after = all_matches['after']
        if all_matches_after:
            fetch_matches_from_db(all_matches_after, False)
    except Exception as e:
        logging.error(f'Error occurred {str(e)}')


fetch_matches_from_db(True, True)
