from library.constants import HERO_SIZE

def is_truthy(value):
    return value in [True, 'True', 'true']


def log_with_process_name(process_name, message):
    return f'PROCESS {process_name}: {message}'


def getIntValue(key):
    sum = 0
    for char in key:
        sum += ord(char)
    return sum


def getDataFromRef(ref):
    return ref['data']['data']


def getAllPairs():
    hero_pairs = []
    for i in range(1, HERO_SIZE):
        for j in range(i + 1, HERO_SIZE):
            hero_pair = {}
            key = format(i, '03d') + format(j, '03d')
            hero_pair['hero_pair'] = key
            hero_pair['games'] = 0
            hero_pair['wins'] = 0
            hero_pairs.append(hero_pair)
    return hero_pairs