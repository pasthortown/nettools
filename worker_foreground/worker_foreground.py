import os
from tornado.ioloop import IOLoop
from tornado.web import Application, RequestHandler
from tornado.escape import json_decode
from ping3 import ping
import logging
import subprocess
import socket
import datetime
import jwt
from dateutil import parser

app_secret = os.getenv('app_secret')
allowed_app_name = os.getenv('allowed_app_name')

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
        write_log(token)
        auth = validate_token(token)
        if auth == False:
            self.write({'response':'Acceso Denegado', 'status':'500'})
            return
        try:
            if (action == 'ping'):
                target = content['target']
                respuesta = do_ping(target)
            if (action == 'tracert'):
                target = content['target']
                respuesta = tracert(target)
            if (action == 'telnet'):
                target = content['target']
                port = content['port']
                respuesta = telnet(target, port)
        except Exception as e:
            write_log(e)
            respuesta = {'response':'Solicitud Incorrecta', 'status':'500'}
        self.write(respuesta)
        return

def telnet(target, port):
    pass

def do_ping(target):
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
    return {'target':target, 'ip':ip, 'response':toReturn, 'status':200}

def tracert(target):
    try:
        command = ['traceroute', '-n', target]
        output = subprocess.run(command, capture_output=True, text=True)
        toReturn = output.stdout.strip()
    except Exception as e:
        toReturn = "No se pudo realizar el trazado de ruta a " + str(target)
        write_log(e)
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