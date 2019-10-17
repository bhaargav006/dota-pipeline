import requests, time, logging
from constants.constants import GET_MATCH_HISTORY, KEY

logging.basicConfig(filename='match_fetcher-new.log', level=logging.DEBUG, format='%(levelname)s:%(asctime)s %(message)s')

logging.info(f'Getting match history')
try:
    response = requests.get(GET_MATCH_HISTORY, params={'key': KEY, 'skill': 3, 'min_players': 10})

    if response.status_code == 200:
        response_json = response.json()
        f = open('matches-new.log', 'a+')
        matches = response_json['result']['matches']
        
        match_ids_map = map(lambda t: str(t['match_id']), matches)
        f.write("\n".join(match_ids_map))
        f.close()

        match_ids = list(match_ids_map)
        match_ids.sort()
        last_match_id = match_ids[-1]

        logging.info(f'Successfully written {len(matches)} records')

        while True:
            response = requests.get(GET_MATCH_HISTORY, params={'key': KEY, 'start_at_match_id': str(last_match_id), 'skill': 3, 'min_players': 10})
            if response.status_code == 200:
                try:
                    response_json = response.json()
                    f = open('matches=new.log', 'a+')
                    f.write("\n")
                    matches = response_json['result']['matches']
                    
                    match_ids_map = map(lambda t: str(t['match_id']), matches)
                    f.write("\n".join(match_ids_map))
                    f.close()

                    match_ids = list(match_ids_map)
                    match_ids.sort()
                    last_match_id = match_ids[0]

                    logging.info(f'Successfully written {len(matches)} records')
                except ValueError as v:
                    logging.error(f'Decoding JSON has failed: {str(v)}')
            else:
                logging.error(f'Response status code: {response.status_code}')
            time.sleep(2)
    else:
        logging.error(f'Response status code: {response.status_code}')
except Exception as e:
    logging.error(f'Error occurred {str(e)}, retrying')
