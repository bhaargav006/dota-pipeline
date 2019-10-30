import calendar, time, logging, os, json, sys, pytz
from typing import List, Dict, Any, Union

from library.constants import LOG_ROOT, NUM_MESSAGES, PROJECT_ID, DATA_SUBSCRIPTION_NAME, ITEM_SIZE, HERO_SIZE, \
    DATABASE_URL
from library.helpers import log_with_process_name, getIntValue, getDataFromRef

from datetime import datetime
from google.cloud import pubsub_v1
from faunadb import query as q
from faunadb.objects import Ref
from faunadb.client import FaunaClient

# System Argument ProcesName is needed - Name of process for provenance
PROCESS_NAME = sys.argv[1]
# PROCESS_NAME = 'test-sid'

# System Argument Collection is needed - To decide which collection to persist to
COLLECTION_NAME = sys.argv[2]
# COLLECTION_NAME = 'matches_raw'

logging.basicConfig(filename=LOG_ROOT + 'data_processor.log', level=logging.DEBUG,
                    format='%(levelname)s:%(asctime)s %(message)s')
logging.info(log_with_process_name(PROCESS_NAME, 'Started'))

subscriber = pubsub_v1.SubscriberClient()
subscription_path = subscriber.subscription_path(PROJECT_ID, DATA_SUBSCRIPTION_NAME)

client = FaunaClient(secret="secret", domain=DATABASE_URL, scheme="http", port="8443")


def processMatchId(match_id):
    stage_start_time = pytz.utc.localize(datetime.now())

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
    processHeroInformation(match_data)
    processTemporalHeroInformation(match_data)
    # Under Review
    # hero = getHeroData(match_data) 

    processMatchPredictor(match_data)

    addProvenance(match, match_data, stage_start_time)

    client.query(
        q.replace(
            q.ref(
                q.collection('matches'), match_data['result']['match_id']
            ),
            {"data": match}
        )
    )


def createMatchDocument(match_data):
    match = {}

    match['abandoned_status'] = checkMatchAbandoned(match_data)
    match['radiant_win'] = match_data['result']['radiant_win']
    match['start_time'] = pytz.utc.localize(datetime.utcfromtimestamp(match_data['result']['start_time']))
    match['match_id'] = match_data['result']['match_id']
    if 'picks_bans' in match_data['result']:
        match['number_of_bans'] = len(match_data['result']['picks_bans'])

    return match


def addProvenance(match, match_data, stage_start_time):
    match['provenance'] = match_data['provenance']
    match['provenance']['dataProcessStage'] = {}

    stage_end_time = pytz.utc.localize(datetime.now())

    match['provenance']['dataProcessStage']['startTime'] = stage_start_time
    match['provenance']['dataProcessStage']['processDuration'] = (stage_end_time - stage_start_time).microseconds
    match['provenance']['dataProcessStage']['processName'] = PROCESS_NAME


def processMatchPredictor(match_data):
    players = match_data['result']['players']
    radiant_win = match_data['result']['radiant_win']

    feature_vector = []
    for i in range(0, HERO_SIZE * 2):
        feature_vector.append(0)

    for player in players:
        if player['player_slot'] <= 4:
            feature_vector[player['hero_id']] = 1
        else:
            feature_vector[HERO_SIZE + player['hero_id']] = 1

    feature_vector.append(1 if radiant_win else 0)

    match_feature_data = {}
    match_feature_data['start_time'] = pytz.utc.localize(datetime.utcfromtimestamp(match_data['result']['start_time']))
    match_feature_data['vector'] = feature_vector

    client.query(q.create(q.collection('match_prediction'), {"data": match_feature_data}))


def processTemporalHeroInformation(match_data):
    radiant_win = match_data['result']['radiant_win']

    players = match_data['result']['players']
    for player in players:
        win_flag = False
        if player['player_slot'] <= 4 and radiant_win:
            win_flag = True
        elif player['player_slot'] > 4 and not radiant_win:
            win_flag = True

        temporal_hero = {}
        temporal_hero['id'] = player['hero_id']
        temporal_hero['win'] = win_flag
        temporal_hero['match_start_time'] = pytz.utc.localize(
            datetime.utcfromtimestamp(match_data['result']['start_time']))

        client.query(q.create(q.collection('heroes_temporal'), {"data": temporal_hero}))


def processHeroInformation(match_data):
    radiant_win = match_data['result']['radiant_win']

    players = match_data['result']['players']
    for player in players:
        win_flag = getWinFlag(player, radiant_win)

        hero_data = client.query(
            q.get(
                q.ref(
                    q.collection('heroes'),
                    player['hero_id']
                )
            )
        )
        hero_data = hero_data['data']
        if win_flag:
            hero_data['wins'] += 1
            hero_data['games'] += 1
        else:
            hero_data['games'] += 1
        getItemsData(player, hero_data)

        hero_data = client.query(
            q.update(
                q.ref(
                    q.collection('heroes'),
                    player['hero_id']
                ),
                { 'data': hero_data }
            )
        )


def getItemsData(player_info, hero_data):
    hero_data['items'][player_info['item_0']] += 1
    hero_data['items'][player_info['item_1']] += 1
    hero_data['items'][player_info['item_2']] += 1
    hero_data['items'][player_info['item_3']] += 1
    hero_data['items'][player_info['item_4']] += 1
    hero_data['items'][player_info['item_5']] += 1
    hero_data['items'][player_info['backpack_0']] += 1
    hero_data['items'][player_info['backpack_1']] += 1
    hero_data['items'][player_info['backpack_2']] += 1


def processHeroPairInformation(match_data):
    players = match_data['result']['players']
    radiant_hero_ids = []
    dire_hero_ids = []
    for player in players:
        if isRadiant(player):
            radiant_hero_ids.append(player['hero_id'])
        else:
            dire_hero_ids.append(player['hero_id'])

    radiant_win = match_data['result']['radiant_win']
    updatePairInformationForTeam(radiant_hero_ids,radiant_win)
    updatePairInformationForTeam(dire_hero_ids, not radiant_win)


def updatePairInformationForTeam(hero_ids, team_win):
    for k in range(0, len(hero_ids)):
        for j in range(k + 1, len(hero_ids)):
            if hero_ids[k] < hero_ids[j]:
                key = format(hero_ids[k], '03d') + format(hero_ids[j], '03d')
            else:
                key = format(hero_ids[j], '03d') + format(hero_ids[k], '03d')
            hero_data = client.query(
                q.get(
                    q.ref(
                        q.collection('hero_pairs'),
                        key
                    )
                )
            )['data']
            hero_data['games'] += 1
            if team_win:
                hero_data['wins'] += 1

            client.query(
                q.update(
                    q.ref(
                        q.collection('hero_pairs'),
                        key
                    )
                )
            )


def isRadiant(player):
    if player['player_slot'] < 5:
        return True
    return False


def getWinFlag(player, radiant_win):
    win_flag = False
    if player['player_slot'] <= 4 and radiant_win:
        win_flag = True
    elif player['player_slot'] > 4 and not radiant_win:
        win_flag = True
    return win_flag


def preProcessData(match_data):
    if 'error' in match_data['result']:
        return False

    match_duration = match_data['result']['duration']

    if match_duration == 0:
        return False

    if len(match_data['result']['players']) != 10:
        return False

    if match_data['result']['game_mode'] not in [1, 2, 3, 4, 5, 8, 14, 16, 22]:
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
            client.query(q.select(['data', 'data'], q.get(
                q.ref(q.collection('match_aggregate_info'), getIntValue('max_first_blood_time'))))) < first_blood_time,
            q.update(q.ref(q.collection('match_aggregate_info'), getIntValue('max_first_blood_time')),
                     {"data": {"data": first_blood_time}}),
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
                    "data": ((client.query(q.select(['data', 'data'], q.get(
                        q.ref(q.collection('match_aggregate_info'), getIntValue('avg_first_blood_time'))))) * (
                                      count - 1) + first_blood_time) / count)
                }
            }
        )
    )


def processMatchDuration(match_data, count):
    match_duration = match_data['result']['duration']

    client.query(
        q.if_(
            q.gt(client.query(q.select(['data', 'data'], q.get(
                q.ref(q.collection('match_aggregate_info'), getIntValue('min_match_duration'))))), match_duration),
            q.update(q.ref(q.collection('match_aggregate_info'), getIntValue('min_match_duration')),
                     {"data": {"data": match_duration}}),
            'no-nothing'
        )
    )
    
    client.query(
        q.if_(
            q.lt(client.query(q.select(['data', 'data'], q.get(q.ref(q.collection('match_aggregate_info'), getIntValue('max_match_duration'))))), match_duration),
            q.update(q.ref(q.collection('match_aggregate_info'), getIntValue('max_match_duration')), { "data": { "data": match_duration } }),
            'no-nothing'
        )            
    )

    client.query(
        q.let(
            {'currVal': q.select(['data', 'data'], q.get(
                q.ref(q.collection('match_aggregate_info'), getIntValue('mean_match_duration'))))},
            q.update(
                q.ref(
                    q.collection('match_aggregate_info'),
                    getIntValue('mean_match_duration')
                ),
                {
                    "data": {
                        "data": q.divide(q.add(q.multiply(q.var('currVal'), q.subtract(count, 1)), match_duration),
                                         count)
                    }
                }
            )
        )
    )


def processMatchCounter():
    resp = client.query(
        q.let(
            {'currVal': q.select(['data', 'data'],
                                 q.get(q.ref(q.collection('match_aggregate_info'), getIntValue('match_count'))))},
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


while True:
    try:
        logging.info(log_with_process_name(PROCESS_NAME, 'Fetching unique match details'))
        response = subscriber.pull(subscription_path, max_messages=NUM_MESSAGES)

        for message in response.received_messages:
            match_id = message.message.data.decode("utf-8")
            logging.debug(log_with_process_name(PROCESS_NAME, f'Processing data record for matchID: {match_id}'))

            processMatchId(match_id)

            ack_list = []
            ack_list.append(message.ack_id)
            subscriber.acknowledge(subscription_path, ack_list)
            logging.info(log_with_process_name(PROCESS_NAME, f'Acknowledged: {message.ack_id}'))

    except Exception as e:
        logging.error('Exception: ', e)
