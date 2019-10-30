import requests, time, logging
from library.constants import GET_MATCH_HISTORY, KEY_1, DATA_ROOT, LOG_ROOT

logging.basicConfig(filename=LOG_ROOT+'match_fetcher.log', level=logging.DEBUG, format='%(levelname)s:%(asctime)s %(message)s')

while True:
    logging.info(f'Getting match history')
    try:
        response = requests.get(GET_MATCH_HISTORY, params={'key': KEY_1})
        if response.status_code == 200:
            try:
                response_json = response.json()
                f = open(DATA_ROOT+'serial_matches.log', 'a+')
                f.write("\n")
                matches = response_json['result']['matches']
                f.write("\n".join(map(lambda t: str(t['match_id']), matches)))
                f.close()
                logging.info(f'Successfully written {len(matches)} records')
            except ValueError as v:
                logging.error(f'Decoding JSON has failed: {str(v)}')
        else:
            logging.error(f'Response status code: {response.status_code}')
    except Exception as e:
        logging.error(f'Error occurred {str(e)}, retrying')
    time.sleep(2)
