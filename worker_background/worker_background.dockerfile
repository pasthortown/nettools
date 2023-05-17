FROM python:3.8

WORKDIR /usr/src/app

COPY worker_background/requirements.txt ./
RUN apt-get update
RUN apt-get install -y libpcap-dev traceroute
RUN pip install -r requirements.txt
RUN echo "America/Bogota" > /etc/timezone
COPY worker_background/worker_background.py .

CMD [ "python", "worker_background.py" ]