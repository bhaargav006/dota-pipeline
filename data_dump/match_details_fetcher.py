import logging, requests, json, pytz

from library.constants import GET_MATCH_DETAILS, DATABASE_URL, PROJECT_ID, TOPIC_NAME, DATA_TOPIC_NAME, LOG_ROOT, DATA_ROOT
from library.helpers import log_with_process_name

from google.cloud import pubsub_v1

from datetime import datetime
from faunadb import query as q
from faunadb.objects import Ref
from faunadb.client import FaunaClient

logging.basicConfig(filename=LOG_ROOT+'match_details_fetcher.log', level=logging.DEBUG, format='%(levelname)s:%(asctime)s %(message)s')

client = FaunaClient(secret="secret", domain=DATABASE_URL, scheme="http", port="8443")
publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(PROJECT_ID, TOPIC_NAME)
data_topic_path = publisher.topic_path(PROJECT_ID, DATA_TOPIC_NAME)

def getMatchDetails(matchID, process_name, key, collection_name, stage_start_time):
    try:
        startTime = pytz.utc.localize(datetime.now()) 
        response = requests.get(GET_MATCH_DETAILS, params={'match_id': matchID, 'key': key})
        endTime = pytz.utc.localize(datetime.now()) 

        if response.status_code == 200:
            try:
                responseJson = response.json()

                writeDataToFile(responseJson)
                addProvenance(responseJson, startTime, endTime, process_name, stage_start_time)
                writeDataToDatabase(responseJson, matchID, process_name, collection_name)

                publishMatchIdToQueue(process_name, matchID)

                logging.info(log_with_process_name(process_name, f'Successfully written match details for match {matchID}'))

            except ValueError as v:
                logging.error(log_with_process_name(process_name, f'Decoding JSON has failed: {str(v)}'))
        else:
            logging.error(log_with_process_name(process_name, f'Response status code: {response.status_code} for matchID: {matchID}'))

            data = matchID
            publisher.publish(topic_path, data=data.encode('utf-8'))

        return response.status_code
    except Exception as e:
        logging.error(log_with_process_name(process_name, f'Error occurred {str(e)}'))
    return


def publishMatchIdToQueue(process_name, matchID):
    data = matchID
    publisher.publish(data_topic_path, data=data.encode('utf-8'))
    logging.info(log_with_process_name(process_name, f'Published match: {data} to data process queue'))

def writeDataToDatabase(responseJson, matchID, process_name, collection_name):
    try:
        client.query(
            q.create(
                q.ref(q.collection(collection_name), matchID),
                { "data" : responseJson }
            )
        )
    except Exception as e:
        if str(e) != 'Document already exists':
            data = matchID
            publisher.publish(topic_path, data=data.encode('utf-8'))
    logging.debug(log_with_process_name(process_name, f'Added matchID {matchID} to database'))


def addProvenance(responseJson, start_time, end_time, process_name, stage_start_time):
    responseJson['provenance'] = {}
    responseJson['provenance']['dataFetchStage'] = {}

    responseJson['provenance']['dataFetchStage']['stageStartTime'] = stage_start_time
    responseJson['provenance']['dataFetchStage']['stageEndTime'] = pytz.utc.localize(datetime.now()) 
    responseJson['provenance']['dataFetchStage']['startTime'] = start_time
    responseJson['provenance']['dataFetchStage']['apiCallDuration'] = (end_time - start_time).microseconds
    responseJson['provenance']['dataFetchStage']['processedBy'] = process_name


def writeDataToFile(responseJson):
    f = open(DATA_ROOT+'match_details_new.log', 'a+')
    f.write("\n")
    f.write(json.dumps(responseJson))
    f.close()
