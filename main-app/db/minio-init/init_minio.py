import boto3
import time
import json

print("⏳ Waiting for MinIO to be available...")
for _ in range(20):
    try:
        s3 = boto3.client(
            "s3",
            endpoint_url="http://minio:9000",
            aws_access_key_id="minioadmin",
            aws_secret_access_key="minioadmin"
        )
        s3.list_buckets()
        print("✅ MinIO is ready.")
        break
    except Exception:
        print("...still waiting")
        time.sleep(3)
else:
    raise Exception("❌ MinIO not available after waiting.")

# Create bucket if needed
bucket_name = "violations"
buckets = s3.list_buckets()["Buckets"]
if not any(b["Name"] == bucket_name for b in buckets):
    s3.create_bucket(Bucket=bucket_name)
    print(f"✅ Bucket '{bucket_name}' created.")
else:
    print(f"ℹ️ Bucket '{bucket_name}' already exists.")

# Add public read-only policy
policy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowPublicRead",
            "Effect": "Allow",
            "Principal": "*",
            "Action": ["s3:GetObject"],
            "Resource": [f"arn:aws:s3:::{bucket_name}/*"]
        }
    ]
}

s3.put_bucket_policy(Bucket=bucket_name, Policy=json.dumps(policy))
print(f"🔓 Public read access granted to bucket '{bucket_name}'")
