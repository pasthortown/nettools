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
import uuid
import datetime

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
            if (action == 'update_group'):
                group = content['group']
                respuesta = update_group(group)
            if (action == 'update_host'):
                group_id = content['group_id']
                host = content['host']
                respuesta = update_host(group_id, host)
            if (action == 'create_group'):
                group = content['group']
                respuesta = create_group(group)
            if (action == 'create_host'):
                group_id = content['group_id']
                host = content['host']
                respuesta = create_host(group_id, host)
            if (action == 'delete_group'):
                group_id = content['group_id']
                respuesta = delete_group(group_id)
            if (action == 'delete_host'):
                group_id = content['group_id']
                host_id = content['host_id']
                respuesta = delete_host(group_id, host_id)
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

def create_group(group):
    collection = db['groups']
    group['item_id'] = str(uuid.uuid4())
    group['timestamp'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    group['hosts'] = []
    collection.insert_one(group)
    return {'response':'Grupo creado', 'status':200}

def create_host(group_id, host):
    collection = db['groups']
    grupo = collection.find_one({'item_id': group_id})
    host['item_id'] = str(uuid.uuid4())
    host['timestamp'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if grupo:
        hosts = grupo['hosts']
        hosts.append(host)
        collection.update_one({'item_id': group_id}, {'$set': {'hosts': hosts}})
        return {'response':'Host creado en el grupo', 'status':200}
    else:
        return {'response':'Grupo no existe', 'status':200}

def update_group(group):
    collection = db['groups']
    group['timestamp'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    collection.update_one({'item_id': group['item_id']}, {'$set': group})
    return {'response':'Grupo actualizado', 'status':200}

def update_host(group_id, host):
    collection = db['groups']
    host_id = host['item_id']
    host['timestamp'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    result = collection.update_one(
        {'item_id': group_id, 'hosts.item_id': host_id},
        {'$set': {'hosts.$': host}}
    )
    if result.modified_count > 0:
        return {'response': 'Host actualizado', 'status': 200}
    else:
        return {'response': 'Host no encontrado en el grupo', 'status': 200}

def delete_group(group_id):
    collection = db['groups']
    result = collection.delete_one({'item_id': group_id})
    if result.deleted_count > 0:
        return {'response': 'Grupo eliminado', 'status': 200}
    else:
        return {'response': 'Grupo no encontrado', 'status': 200}

def delete_host(group_id, host_id):
    collection = db['groups']
    result = collection.update_one(
        {'item_id': group_id},
        {'$pull': {'hosts': {'item_id': host_id}}}
    )
    if result.modified_count > 0:
        return {'response': 'Host eliminado del grupo', 'status': 200}
    else:
        return {'response': 'Host no encontrado en el grupo', 'status': 200}

def get_pings(target):
    collection = db['pings']
    toReturn = json.loads(json_util.dumps(collection.find({'target':target})))
    return {'response':toReturn, 'status':200}

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