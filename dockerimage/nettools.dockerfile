FROM python:3.8

WORKDIR /usr/src/app

COPY dockerimage/requirements.txt ./
RUN apt-get update
RUN apt-get install -y libpcap-dev
RUN pip install -r requirements.txt
RUN echo "America/Bogota" > /etc/timezone
COPY dockerimage/nettools.py .

EXPOSE 5050

CMD [ "python", "nettools.py" ]