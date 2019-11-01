import calendar, time, logging, os, json, sys

from library.constants import LOG_ROOT, PROJECT_ID, DATABASE_URL
from library.helpers import log_with_process_name

from faunadb import query as q
from faunadb.client import FaunaClient

client = FaunaClient(secret="secret", domain=DATABASE_URL, scheme="http", port="8443")

logging.basicConfig(filename=LOG_ROOT + 'user_queries.log', level=logging.DEBUG,
                    format='%(levelname)s:%(asctime)s %(message)s')

def queryHeroPair(hero_id, n):
    key_list = []
    id_list = []
    for k in range(1, hero_id):
        key = format(k, '03d') + format(hero_id, '03d')
        key_list.append(key)
        id_list.append(k)
    for k in range(hero_id + 1, 130):
        key = format(hero_id, '03d') + format(k, '03d')
        key_list.append(key)
        id_list.append(k)
    try:
        hero_data_list = client.query(
            q.map_(
                q.lambda_(
                    'hero_pair',
                    q.get(q.ref(q.collection('hero_pairs'), q.var('hero_pair')))
                ),
                key_list
            )
        )

    except Exception as e:
        print(e)

    print(len(key_list), len(id_list), len(hero_data_list))

    hero_team_list = []
    for i in range(0, len(hero_data_list)):
        hero_team_dictionary = {}
        hero_team_dictionary['partner_id'] = id_list[i]
        if hero_data_list[i]['data']['games'] > 0:
            hero_team_dictionary['win_rate'] = format(
                hero_data_list[i]['data']['wins'] / hero_data_list[i]['data']['games'], '.4f')
        else:
            hero_team_dictionary['win_rate'] = '0.0000'
        hero_team_list.append(hero_team_dictionary)

    hero_team_list = sorted(hero_team_list, key=lambda i: i['win_rate'], reverse=True)

    for i in range(0, n):
        print(hero_team_list[i]['partner_id'])
        print(hero_team_list[i]['win_rate'])
        
