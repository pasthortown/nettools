FROM python:3.8

WORKDIR /usr/src/app

COPY worker_entities/requirements.txt ./
RUN pip install -r requirements.txt
RUN echo "America/Bogota" > /etc/timezone
COPY worker_entities/worker_entities.py .

EXPOSE 5050

CMD [ "python", "worker_entities.py" ]