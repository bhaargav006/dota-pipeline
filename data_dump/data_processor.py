import calendar, time, logging, os, json, sys, pytz
from typing import List, Dict, Any, Union

from library.constants import LOG_ROOT, NUM_MESSAGES, PROJECT_ID, DATA_SUBSCRIPTION_NAME, ITEM_SIZE, HERO_SIZE, DATABASE_URL
from library.helpers import log_with_process_name, getIntValue, getDataFromRef

from datetime import datetime
from google.cloud import pubsub_v1
from faunadb import query as q
from faunadb.objects import Ref
from faunadb.client import FaunaClient

# System Argument ProcesName is needed - Name of process for provenance
# PROCESS_NAME = sys.argv[1]
PROCESS_NAME = 'test-sid'

# System Argument Collection is needed - To decide which collection to persist to
# COLLECTION_NAME = sys.argv[2]
COLLECTION_NAME = 'matches_raw' 

logging.basicConfig(filename='data_processor.log', level=logging.DEBUG, format='%(levelname)s:%(asctime)s %(message)s')
logging.info(log_with_process_name(PROCESS_NAME, 'Started'))

# subscriber = pubsub_v1.SubscriberClient()
# subscription_path = subscriber.subscription_path(PROJECT_ID, DATA_SUBSCRIPTION_NAME)

client = FaunaClient(secret="secret", domain=DATABASE_URL, scheme="http", port="8443")

# while True:
#     try:
#         logging.info(log_with_process_name(PROCESS_NAME, 'Fetching unique match details'))
#         response = subscriber.pull(subscription_path, max_messages=NUM_MESSAGES)

#         for message in response.received_messages:
#             match_id = message.message.data.decode("utf-8")
#             logging.debug(log_with_process_name(PROCESS_NAME, f'Processing data record for matchID: {match_id}'))

#             processMatchId(match_id)

#             ack_list = []
#             ack_list.append(message.ack_id)
#             subscriber.acknowledge(subscription_path, ack_list)
#             logging.info(log_with_process_name(PROCESS_NAME, f'Acknowledged: {message.ack_id}'))

#     except Exception as e:
#         logging.error('Exception: ', e)

def getItemsData(player_info):
    items: List[int]=[]
    for i in range(0,ITEM_SIZE):
        items.append(0)
    items[player_info['item_0']]+=1
    items[player_info['item_1']]+=1
    items[player_info['item_2']]+=1
    items[player_info['item_3']]+=1
    items[player_info['item_4']]+=1
    items[player_info['item_5']]+=1
    items[player_info['backpack_0']]+=1
    items[player_info['backpack_1']]+=1
    items[player_info['backpack_2']]+=1
    return items


def getHeroData(match_data):
    heroes: List[Dict[str, Union[List[int], Any]]] = []
    player_info = match_data['result']['players']

    winningteam = []
    losingteam = []
    emptyarray = []

    for i in range(0, HERO_SIZE):
        winningteam.append(0)
        losingteam.append(0)
        emptyarray.append(0)

    winner = match_data['result']['radiant_win']

    for player in player_info:
        if (player['player_slot'] < 5 and winner) or (player['player_slot'] > 5 and winner is False):
            winningteam[player['hero_id']] += 1
        else:
            losingteam[player['hero_id']] += 1

    for player in player_info:
        hero = {}
        hero['hero_id'] = player['hero_id']
        hero['items_bought'] = getItemsData(player)

        if (player['player_slot'] < 5 and winner) or (player['player_slot'] > 5 and winner is False):
            hero['team_when_won'] = winningteam[:]
            hero['team_when_lost'] = emptyarray[:]
            hero['opponent_when_won'] = losingteam[:]
            hero['opponent_when_lost'] = emptyarray[:]
            hero['team_when_won'][player['hero_id']] -= 1

        else:
            hero['team_when_won'] = emptyarray[:]
            hero['team_when_lost'] = losingteam[:]
            hero['opponent_when_won'] = emptyarray[:]
            hero['opponent_when_lost'] = winningteam[:]
            hero['team_when_lost'][player['hero_id']] -= 1

        heroes.append(hero)
    return heroes

def processMatchId(match_id):
    start_time = pytz.utc.localize(datetime.now()) 

    match_data = client.query(
        q.get(
            q.ref(
                q.collection(COLLECTION_NAME), 
                match_id
            )
        )
    )

    match_data = match_data['data']

    if not preProcessData(match_data):
        return
    
    count = processMatchCounter()
    processFirstBloodTime(match_data, count)
    processMatchDuration(match_data, count)

    match = createMatchDocument(match_data)

    end_time = pytz.utc.localize(datetime.now())  
    addProvenance(match, match_data, start_time, end_time)
    
    client.query(
        q.replace(
            q.ref(
                q.collection('matches'), match_data['result']['match_id']
            ),
            { "data" : match }
        )
    )  

def createMatchDocument(match_data):
    match = {}

    match['abandoned_status'] = checkMatchAbandoned(match_data)
    match['radiant_win'] = match_data['result']['radiant_win']
    match['start_time'] = pytz.utc.localize(datetime.utcfromtimestamp(match_data['result']['start_time']))
    match['match_id'] = match_data['result']['match_id']
    match['number_of_bans'] = len(match_data['result']['picks_bans'])

    return match

def addProvenance(match, match_data, start_time, end_time):
    match['provenance'] = match_data['provenance']

    match['provenance']['dataProcessStage'] =  {}

    match['provenance']['dataProcessStage']['startTime'] = start_time
    match['provenance']['dataProcessStage']['processDuration'] = (end_time - start_time).microseconds
    match['provenance']['dataProcessStage']['processName'] = PROCESS_NAME

def preProcessData(match_data):
    match_duration = match_data['result']['duration']

    if match_duration == 0:
        return False

    if len(match_data['result']['players']) != 10:
        return False

    return True

def checkMatchAbandoned(match_data):
    players = match_data['result']['players']
    match_abandoned = False

    for player in players:
        leaver_status = player['leaver_status']

        if leaver_status in [2, 3, 4]:
            match_abandoned = True
            break

    
    return match_abandoned

def processFirstBloodTime(match_data, count):
    first_blood_time = match_data['result']['first_blood_time']
    
    client.query(
        q.if_(
            client.query(q.select(['data', 'data'], q.get(q.ref(q.collection('match_aggregate_info'), getIntValue('max_first_blood_time'))))) < first_blood_time,
            q.update(q.ref(q.collection('match_aggregate_info'), getIntValue('max_first_blood_time')), { "data": { "data": first_blood_time } }),
            'no-nothing'
        )            
    )

    client.query(
        q.update(
            q.ref(
                q.collection('match_aggregate_info'), 
                getIntValue('avg_first_blood_time')
            ),
            {
                "data": { 
                    "data": ((client.query(q.select(['data', 'data'], q.get(q.ref(q.collection('match_aggregate_info'), getIntValue('avg_first_blood_time'))))) * (count - 1) + first_blood_time) / count)
                }
            }
        )
    )

def processMatchDuration(match_data, count):
    match_duration = match_data['result']['duration']

    client.query(
        q.if_(
            q.gt(client.query(q.select(['data', 'data'], q.get(q.ref(q.collection('match_aggregate_info'), getIntValue('min_match_duration'))))), match_duration),
            q.update(q.ref(q.collection('match_aggregate_info'), getIntValue('min_match_duration')), { "data": { "data": match_duration } }),
            'no-nothing'
        )            
    ) 

    client.query(
        q.let(
            { 'currVal': q.select(['data', 'data'], q.get(q.ref(q.collection('match_aggregate_info'), getIntValue('mean_match_duration')))) },
            q.update(
                q.ref(
                    q.collection('match_aggregate_info'), 
                    getIntValue('mean_match_duration')
                ),
                {
                    "data": { 
                        "data": q.divide(q.add(q.multiply(q.var('currVal'), q.subtract(count, 1)), match_duration), count)
                    }
                }
            )
        )
    )

def processMatchCounter():    
    resp = client.query(
        q.let(
            { 'currVal': q.select(['data', 'data'], q.get(q.ref(q.collection('match_aggregate_info'), getIntValue('match_count')))) },
            q.update(
                q.ref(
                    q.collection('match_aggregate_info'), 
                    getIntValue('match_count')
                ), 
                {
                    "data": { 
                        "data": q.add(1, q.var('currVal'))
                    }
                }
            )
        )
    )

    return getDataFromRef(resp)

processMatchId(4929685690)