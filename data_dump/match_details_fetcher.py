import logging, requests, datetime, json

from library.constants import GET_MATCH_DETAILS, DATABASE_URL, PROJECT_ID, TOPIC_NAME, LOG_ROOT, DATA_ROOT
from library.helpers import log_with_process_name

from google.cloud import pubsub_v1

from faunadb import query as q
from faunadb.objects import Ref
from faunadb.client import FaunaClient

logging.basicConfig(filename=LOG_ROOT+'match_details_fetcher.log', level=logging.DEBUG, format='%(levelname)s:%(asctime)s %(message)s')

client = FaunaClient(secret="secret", domain=DATABASE_URL, scheme="http", port="8443")
publisher = pubsub_v1.PublisherClient()
topic_path = publisher.topic_path(PROJECT_ID, TOPIC_NAME)


def getMatchDetails(matchID, processName, key, collection_name):
    try:
        startTime = datetime.datetime.now()
        response = requests.get(GET_MATCH_DETAILS, params={'match_id': matchID, 'key': key})
        endTime = datetime.datetime.now()

        if response.status_code == 200:
            try:
                responseJson = response.json()

                writeDataToFile(responseJson)
                addProvenance(responseJson, startTime, endTime, processName)
                writeDataToDatabase(responseJson, matchID, processName, collection_name)

                logging.info(log_with_process_name(processName, f'Successfully written match details for match {matchID}'))

            except ValueError as v:
                logging.error(log_with_process_name(processName, f'Decoding JSON has failed: {str(v)}'))
        else:
            logging.error(log_with_process_name(processName, f'Response status code: {response.status_code} for matchID: {matchID}'))

            data = matchID
            publisher.publish(topic_path, data=data.encode('utf-8'))

        return response.status_code
    except Exception as e:
        logging.error(log_with_process_name(processName, f'Error occurred {str(e)}'))
    return


def writeDataToDatabase(responseJson, matchID, processName, collection_name):
    logging.debug(log_with_process_name(processName, f'Persisting {responseJson} to database'))
    client.query(
        q.create(
            q.ref(q.collection(collection_name), matchID),
            { "data" : responseJson }
        )
    )
    logging.debug(log_with_process_name(processName, f'Added matchID {matchID} to database'))


def addProvenance(responseJson, startTime, endTime, processName):
    responseJson['provenance'] = {}
    responseJson['provenance']['dataFetchStage'] = {}

    responseJson['provenance']['dataFetchStage']['startTime'] = str(startTime)
    responseJson['provenance']['dataFetchStage']['apiCallDuration'] = str(endTime - startTime)
    responseJson['provenance']['dataFetchStage']['processedBy'] = processName


def writeDataToFile(responseJson):
    f = open(DATA_ROOT+'match_details_new.log', 'a+')
    f.write("\n")
    f.write(json.dumps(responseJson))
    f.close()
