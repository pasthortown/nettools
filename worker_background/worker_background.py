import os
from ping3 import ping
from pymongo import MongoClient
import socket
import datetime
import time

mongo_bdd = os.getenv('mongo_bdd')
mongo_bdd_server = os.getenv('mongo_bdd_server')
mongo_user = os.getenv('mongo_user')
mongo_password = os.getenv('mongo_password')

database_uri='mongodb://'+mongo_user+':'+mongo_password+'@'+ mongo_bdd_server +'/'
client = MongoClient(database_uri)
db = client[mongo_bdd]

def db_clean_history():
    current_time = datetime.datetime.now().time()
    start_time = datetime.time(23, 58)
    end_time = datetime.time(23, 59, 59)
    if start_time <= current_time <= end_time:
        collection = db['pings']
        from_date = datetime.datetime.now() - datetime.timedelta(days=5)
        from_date_str = from_date.strftime('%Y-%m-%d %H:%M:%S')
        query = {'timestamp': {'$lt': from_date_str}}
        result = collection.delete_many(query)
        time.sleep(120)
    
def do_ping(target):
    collection = db['pings']
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ip = ''
    try:
        ip = socket.gethostbyname(target)
        response = ping(target, timeout=2)
        if response is None or response == False:
            response = 0
        toReturn = str(response)
    except Exception as e:
        response = 0
        toReturn = str(response)
    collection.insert_one({'timestamp': timestamp, 'target':target, 'ip': ip, 'result':toReturn})

def do_pings():
    collection = db['groups']
    groups = collection.find({})
    for group in groups:
        hosts = group['hosts']
        for host in hosts:
            target = host['target']
            do_ping(target)

while(True):
    db_clean_history()
    do_pings()
    time.sleep(5)
