FROM python:3.10-slim

RUN pip install boto3

COPY init_minio.py /init_minio.py

CMD ["python", "/init_minio.py"]
