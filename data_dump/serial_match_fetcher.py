import requests, time, logging
from constants.constants import KEY_4, DATA_ROOT, LOG_ROOT, GET_MATCH_HISTORY_BY_SEQ_NUM

logging.basicConfig(filename=LOG_ROOT+'serial_match_fetcher.log', level=logging.DEBUG, format='%(levelname)s:%(asctime)s %(message)s')
last_match_sequence = 4137617145
params = {'key': KEY_4, 'skill': 3, 'min_players': 10, 'start_at_match_seq_num': last_match_sequence}

while True:
    logging.info(f'Getting match history')
    try:
        response = requests.get(GET_MATCH_HISTORY_BY_SEQ_NUM, params=params)
        if response.status_code == 200:
            try:
                response_json = response.json()
                matches = response_json['result']['matches']
                match_ids = [match['match_id'] for match in matches]
                sequence_ids = [match['match_seq_num'] for match in matches]
                sequence_ids.sort()
                last_match_sequence = sequence_ids[-1]
                params['start_at_match_seq_num'] = last_match_sequence
                f = open(DATA_ROOT+'serial_matches.log', 'a+')
                f.write("\n")
                f.write("\n".join(map(lambda t: str(t), match_ids)))
                f.close()
                logging.info(f'Successfully written {len(matches)} records')
            except ValueError as v:
                logging.error(f'Decoding JSON has failed: {str(v)}')
            except Exception as e:
                logging.error(f'Error occured but with response {response_json}')
        else:
            logging.error(f'Response status code: {response.status_code}')
    except Exception as e:
        logging.error(f'Error occurred {str(e)}, retrying')
    time.sleep(2)