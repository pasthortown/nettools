import os
from pymongo import MongoClient
import requests
import datetime
import time

mongo_bdd = os.getenv('mongo_bdd')
mongo_bdd_server = os.getenv('mongo_bdd_server')
mongo_user = os.getenv('mongo_user')
mongo_password = os.getenv('mongo_password')

database_uri='mongodb://'+mongo_user+':'+mongo_password+'@'+ mongo_bdd_server +'/'
client = MongoClient(database_uri)
db = client[mongo_bdd]

def do_http_request(target):
    collection = db['url_health']
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    status_code = 404
    try:
        response = requests.get(target)
        status_code = response.status_code
        if status_code == 200:
            toReturn = 1
        else:
            toReturn = 0
        toReturn = str(response)
    except Exception as e:
        response = 0
        toReturn = str(response)
    collection.insert_one({'timestamp': timestamp, 'target':target, 'status_code': status_code, 'result':toReturn})

def do_http_requests():
    collection = db['groups']
    groups = collection.find({})
    for group in groups:
        hosts = group['hosts']
        for host in hosts:
            if (host['is_url']):
                target = host['target']
                do_http_request(target)

while(True):
    do_http_requests()
    time.sleep(5)
