import os
from tornado.ioloop import IOLoop
from tornado.web import Application, RequestHandler
from tornado.escape import json_decode
from ping3 import ping
import logging
import subprocess
from pymongo import MongoClient
import json
from bson import json_util
import socket

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

class DefaultHandler(RequestHandler):
    def set_default_headers(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        self.set_header('Access-Control-Allow-Headers', '*')
        self.set_header('Access-Control-Allow-Methods', '*')

    def get(self):
        self.write({'response':'Servicio de Herramientas de Red Operativo', 'status':200})


class ActionHandler(RequestHandler):
    def set_default_headers(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        self.set_header('Access-Control-Allow-Headers', '*')
        self.set_header('Access-Control-Allow-Methods', '*')
    
    def options(self, action):
        pass
    
    def post(self, action):
        content = json_decode(self.request.body)
        try:
            if (action == 'ping'):
                target = content['target']
                respuesta = do_ping(target)
            if (action == 'get_pings'):
                target = content['target']
                respuesta = get_pings(target)
            if (action == 'tracert'):
                target = content['target']
                respuesta = tracert(target)
        except:
            respuesta = {'response':'Solicitud Incorrecta', 'status':'500'}
        self.write(respuesta)
        return

def get_pings(target):
    collection = db['pings']
    toReturn = json.loads(json_util.dumps(collection.find({'target':target})))
    return {'response':toReturn, 'status':200}

def do_ping(target):
    collection = db['pings']
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
    collection.insert_one({'target':target, 'ip': ip, 'result':toReturn})
    return {'response':toReturn, 'status':200}

def tracert(target):
    try:
        command = ['traceroute', '-n', target]
        output = subprocess.run(command, capture_output=True, text=True)
        toReturn = output.stdout.strip()
    except Exception as e:
        toReturn = "No se pudo realizar el trazado de ruta a " + str(target)
        write_log(str(e))
    return {'response':toReturn, 'status':200}

def make_app():
    urls = [
        ("/", DefaultHandler),
        ("/([^/]+)", ActionHandler)
    ]
    return Application(urls, debug=True)
    
if __name__ == '__main__':
    app = make_app()
    app.listen(5050)
    IOLoop.instance().start()