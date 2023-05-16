import os
from ping3 import ping
import logging
import subprocess
from pymongo import MongoClient
import json
from bson import json_util
import socket
import uuid
import datetime
import time

mongo_bdd = os.getenv('mongo_bdd')
mongo_bdd_server = os.getenv('mongo_bdd_server')
mongo_user = os.getenv('mongo_user')
mongo_password = os.getenv('mongo_password')

database_uri='mongodb://'+mongo_user+':'+mongo_password+'@'+ mongo_bdd_server +'/'
client = MongoClient(database_uri)
db = client[mongo_bdd]

logging.basicConfig(filename='logs.txt', level=logging.DEBUG)

def write_log(content):
    logging.info(content)

def do_ping(target):
    collection = db['pings']
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ip = ''
    try:
        ip = socket.gethostbyname(target)
        response = ping(target, timeout=2)
        if response is None:
            response = False
        toReturn = str(response)
    except Exception as e:
        toReturn = "No se pudo hacer ping a " + str(target)
        write_log(str(e))
    collection.insert_one({'timestamp': timestamp, 'target':target, 'ip': ip, 'result':toReturn})

def do_pings():
    collection = db['groups']
    groups = collection.find({})
    for group in groups:
        hosts = group['hosts']
        for host in hosts:
            target = host['target']
            do_ping(target)

do_pings()
time.sleep(5)
