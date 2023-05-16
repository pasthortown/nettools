FROM python:3.8

WORKDIR /usr/src/app

COPY worker_foreground/requirements.txt ./
RUN apt-get update
RUN apt-get install -y libpcap-dev traceroute
RUN pip install -r requirements.txt
RUN echo "America/Bogota" > /etc/timezone
COPY worker_foreground/worker_foreground.py .

EXPOSE 5050

CMD [ "python", "worker_foreground.py" ]