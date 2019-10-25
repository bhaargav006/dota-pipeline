def is_truthy(value):
    return value in [True, 'True', 'true']


def log_with_process_name(process_name, message):
    return f'PROCESS {process_name}: {message}'
