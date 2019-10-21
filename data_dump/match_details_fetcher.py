import logging
import requests

from library.constants import GET_MATCH_DETAILS, KEY_2


logging.basicConfig(filename='match_details_fetcher.log', level=logging.DEBUG,
                    format='%(levelname)s:%(asctime)s %(message)s')


def getMatchDetails(matchID):
    try:
        response = requests.get(GET_MATCH_DETAILS, params={'match_id': matchID, 'key': KEY_2})
        if response.status_code == 200:
            try:
                response_json = response.json()
                f = open('match_details.log', 'a+')
                f.write("\n")
                f.write(str(response_json))
                f.close()
                logging.info(f'Successfully written match details for match {matchID}')

            except ValueError as v:
                logging.error(f'Decoding JSON has failed: {str(v)}')
        else:
            logging.error(f'Response status code: {response.status_code}')
        return response.status_code
    except Exception as e:
        logging.error(f'Error occurred {str(e)}')
    return
