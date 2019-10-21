import requests, time, logging, datetime, sys
from library.constants import KEY_4, DATA_ROOT, LOG_ROOT, GET_MATCH_HISTORY_BY_SEQ_NUM
from library.helpers import is_truthy

# first argument: live run, second arg: sleep time, third: last_match_sequence
logging.basicConfig(filename=LOG_ROOT+'serial_match_fetcher.log', level=logging.DEBUG, format='%(levelname)s:%(asctime)s %(message)s')
LIVE_RUN = is_truthy(sys.argv[1])
SLEEP_TIME = float(sys.argv[2])
last_match_sequence = int(sys.argv[3])
params = {'key': KEY_4, 'skill': 3, 'min_players': 10, 'start_at_match_seq_num': last_match_sequence}


MODE = 'LIVE MODE' if LIVE_RUN else 'DRY MODE'
RUN_INFO = f'SERIAL MATCH FETCHER RUNNING IN {MODE}, WITH SLEEP TIME AS {SLEEP_TIME} AND MATCH SEQUENCE {last_match_sequence}'
logging.info(RUN_INFO)
print(RUN_INFO)
while True:
    logging.info(f'Getting match history')
    t1 = datetime.datetime.now()
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
                if LIVE_RUN:
                    f = open(DATA_ROOT+'serial_matches.log', 'a+')
                    f.write("\n")
                    f.write("\n".join(map(lambda t: str(t), match_ids)))
                    f.close()
                    logging.info(f'Successfully written {len(matches)} records')
                else:
                    print(" ".join(map(lambda t: str(t), match_ids)))
            except ValueError as v:
                logging.error(f'Decoding JSON has failed: {str(v)}')
            except Exception as e:
                logging.error(f'Error occured but with response {response_json}')
        else:
            logging.error(f'Response status code: {response.status_code}')
    except Exception as e:
        logging.error(f'Error occurred {str(e)}, retrying')
    t2 = datetime.datetime.now()
    logging.info(f'Time taken for the loop: {t2 - t1}')
    time.sleep(SLEEP_TIME)