FROM python:3.10-alpine

WORKDIR /code

COPY ./app/requirements.txt ./requirements.txt

RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY ./app ./app

COPY ./static ./static

CMD ["uvicorn", "app.main:app", "--port", "5000", "--host", "0.0.0.0"]