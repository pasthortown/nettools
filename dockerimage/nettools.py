import os
from tornado.ioloop import IOLoop
from tornado.web import Application, RequestHandler
from tornado.escape import json_decode
from pythonping import ping
from scapy.all import traceroute
import logging

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
        try:
            if (action == 'ping'):
                target = content['target']
                respuesta = ping(target)
            if (action == 'tracert'):
                target = content['target']
                respuesta = tracert(target)
        except:
            respuesta = {'response':'Solicitud Incorrecta', 'status':'500'}
        self.write(respuesta)
        return

def ping(target):
    try:
        toReturn = str(ping(target))
    except Exception as e:
        toReturn = "No se pudo hacer ping a " + str(target)
        write_log(str(e))
    return {'response':toReturn, 'status':200}

def tracert(target):
    try:
        respuesta, no_respuesta = traceroute(target)
        toReturn = str(respuesta)
        write_log(str(respuesta))
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