import boto3
import os
import boto3
from botocore.config import Config

S3_ENDPOINT   = os.getenv("S3_ENDPOINT", "http://minio:9000")
S3_ACCESS_KEY = os.getenv("S3_ACCESS_KEY", "minioadmin")
S3_SECRET_KEY = os.getenv("S3_SECRET_KEY", "minioadmin")
S3_BUCKET     = os.getenv("S3_BUCKET", "violations")

s3 = boto3.client(
    "s3",
    endpoint_url=S3_ENDPOINT,
    aws_access_key_id=S3_ACCESS_KEY,
    aws_secret_access_key=S3_SECRET_KEY,
    config=Config(s3={"addressing_style": "path"})  # для MinIO стабильнее
)

def upload_photo_to_s3(filename: str, content: bytes) -> str:
    bucket = "violations"
    s3.put_object(Bucket=bucket, Key=filename, Body=content, ContentType="image/jpeg")
    return f"{filename}"
