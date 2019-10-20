import time, queue
from match_details_fetcher import getMatchDetails

matchIDs = queue.Queue()


def operateQueue():
    logfile = open("access-log", "r")
    loglines = follow(logfile)
    for line in loglines:
        matchIDs.put(line)
        yield matchIDs.get()


def follow(thefile):
    thefile.seek(0, 0)
    while True:
        line = thefile.readline()
        if not line:
            time.sleep(0.1)
            continue
        yield line


if __name__ == '__main__':
    for value in operateQueue():
        if getMatchDetails(value) != 200:
            matchIDs.put(value)
