import os
from tornado.ioloop import IOLoop
from tornado.web import Application, RequestHandler
from tornado.escape import json_decode
from pymongo import MongoClient, DESCENDING
import json
from bson import json_util
import uuid
import datetime
import jwt
from dateutil import parser
import logging

mongo_bdd = os.getenv('mongo_bdd')
mongo_bdd_server = os.getenv('mongo_bdd_server')
mongo_user = os.getenv('mongo_user')
mongo_password = os.getenv('mongo_password')

app_secret = os.getenv('app_secret')
allowed_app_name = os.getenv('allowed_app_name')

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
        headers = self.request.headers
        token = headers['token']
        auth = validate_token(token)
        if auth == False:
            self.write({'response':'Acceso Denegado', 'status':'500'})
            return
        try:
            if (action == 'update_profile'):
                profile = content['profile']
                respuesta = update_profile(profile)
            if (action == 'create_profile'):
                profile = content['profile']
                respuesta = create_profile(profile)
            if (action == 'delete_profile'):
                profile_id = content['profile_id']
                respuesta = delete_profile(profile_id)
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
            if (action == 'get_pings'):
                target = content['target']
                since = content['since']
                to = content['to']
                respuesta = get_pings(target, since, to)
            if (action == 'get_last_ping'):
                target = content['target']
                respuesta = get_last_ping(target)
            if (action == 'get_groups'):
                respuesta = get_groups()
            if (action == 'get_profiles'):
                respuesta = get_profiles()
        except Exception as e:
            write_log(e)
            respuesta = {'response':'Solicitud Incorrecta', 'status':'500'}
        self.write(respuesta)
        return

def get_profiles():
    collection = db['profiles']
    toReturn = json.loads(json_util.dumps(collection.find({})))
    return {'response':toReturn, 'status':200} 

def update_profile(profile):
    collection = db['profiles']
    profile['timestamp'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    collection.update_one({'item_id': profile['item_id']}, {'$set': profile})
    return {'response':'Grupo actualizado', 'status':200}

def create_profile(profile):
    collection = db['profiles']
    profile['item_id'] = str(uuid.uuid4())
    profile['timestamp'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    collection.insert_one(profile)
    return {'response':'Perfil creado', 'status':200}

def delete_profile(profile_id):
    collection = db['profiles']
    result = collection.delete_one({'item_id': profile_id})
    if result.deleted_count > 0:
        return {'response': 'Perfil eliminado', 'status': 200}
    else:
        return {'response': 'Perfil no encontrado', 'status': 200}
    
def get_groups():
    collection = db['groups']
    toReturn = json.loads(json_util.dumps(collection.find({})))
    return {'response':toReturn, 'status':200} 

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

def get_last_ping(target):
    collection = db['pings']
    toReturn = json.loads(json_util.dumps(collection.find({
        'target': target
    }).sort('_id', DESCENDING).limit(1)))
    return {'response':toReturn, 'status':200}

def get_pings(target, since, to):
    collection = db['pings']
    if (since == to):
        toReturn = json.loads(json_util.dumps(collection.find({
            'target': target
        }).sort('_id', DESCENDING)))
    else:
        toReturn = json.loads(json_util.dumps(collection.find({
            'target': target,
            'timestamp': {
                '$gte': since,
                '$lte': to
            }
        }).sort('_id', DESCENDING)))
    return {'response':toReturn, 'status':200}

def validate_token(token):
    try:
        response = jwt.decode(token, app_secret, algorithms=['HS256'])
        exp_time = parser.parse(response['valid_until'])
        app_name = response['app_name']
        if (app_name == allowed_app_name and datetime.datetime.now() < exp_time):
            return True
        else:
            return False
    except:
        return False

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