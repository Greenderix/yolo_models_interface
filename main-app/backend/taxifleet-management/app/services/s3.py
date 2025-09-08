import os
from urllib.parse import urlparse, urlunparse

import boto3
from dotenv import load_dotenv

load_dotenv()

s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("S3_ENDPOINT"),
    aws_access_key_id=os.getenv("S3_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("S3_SECRET_KEY"),
)
PUBLIC_HOST = os.getenv("S3_PUBLIC_HOST", "http://localhost:9000")
BUCKET_NAME = os.getenv("S3_BUCKET")

def generate_presigned_url(filename: str, expires_in: int = 3600) -> str:
    url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": BUCKET_NAME, "Key": filename},
        ExpiresIn=expires_in,
    )
    if PUBLIC_HOST:
        parts = list(urlparse(url))
        # заменяем только схему+хост (parts[0:2])
        pub = urlparse(PUBLIC_HOST)
        parts[0] = pub.scheme
        parts[1] = pub.netloc
        return urlunparse(parts)
    return url
