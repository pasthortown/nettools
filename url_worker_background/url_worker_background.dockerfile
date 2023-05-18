FROM python:3.8

WORKDIR /usr/src/app

COPY url_worker_background/requirements.txt ./
RUN pip install -r requirements.txt
RUN echo "America/Bogota" > /etc/timezone
COPY url_worker_background/url_worker_background.py .

EXPOSE 5050

CMD [ "python", "url_worker_background.py" ]