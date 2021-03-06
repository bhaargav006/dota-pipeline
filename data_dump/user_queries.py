import logging

from library.constants import LOG_ROOT, DATABASE_URL

from faunadb import query as q
from faunadb.client import FaunaClient

client = FaunaClient(secret="secret", domain=DATABASE_URL, scheme="http", port="8443")

logging.basicConfig(filename=LOG_ROOT + 'user_queries.log', level=logging.DEBUG,
                    format='%(levelname)s:%(asctime)s %(message)s')


def getTopHeroPairs(hero_id, n):
    logging.info(f'Query: Fetching top {n} partners for hero: {hero_id}')
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
        logging.debug('Finished querying the hero_pair collection successfully')

        hero_team_list = []
        for i in range(0, len(hero_data_list)):
            hero_team_dictionary = {'partner_id': id_list[i]}
            if hero_data_list[i]['data']['games'] > 0:
                hero_team_dictionary['win_rate'] = format(
                    hero_data_list[i]['data']['wins'] / hero_data_list[i]['data']['games'], '.4f')
            else:
                hero_team_dictionary['win_rate'] = '0.0000'
            hero_team_list.append(hero_team_dictionary)

        hero_team_list = sorted(hero_team_list, key=lambda i: i['win_rate'], reverse=True)

        logging.info('Returning from the function getTopHeroPairs')
        return hero_team_list[0: n]

    except Exception as e:
        logging.error(e)
        logging.error('Could not fetch from hero_pairs collection')


def getTopItems(hero_id, n):
    logging.info(f'Query: Fetching top {n} items for hero: {hero_id}')
    try:
        item_data = client.query(
            q.get(
                q.ref(q.collection("heroes"),
                      hero_id
                      )
            )
        )

        logging.debug('Finished querying the heroes collection successfully')

        item_data = item_data['data']['items']
        item_list = []
        for i in range(1, len(item_data)):
            item_dict = {'item_id': i, 'item_count': item_data[i]}
            item_list.append(item_dict)

        item_list = sorted(item_list, key=lambda i: i['item_count'], reverse=True)

        logging.info('Returning from the function getTopItems')
        return item_list[0:n]

    except Exception as e:
        logging.error(e)
        logging.error('Could not fetch from heroes collection')

