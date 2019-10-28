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