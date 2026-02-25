from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage

class BackblazeB2Storage(S3Boto3Storage):
    """Storage backend pour Backblaze B2"""
    bucket_name = settings.AWS_STORAGE_BUCKET_NAME
    endpoint_url = settings.AWS_S3_ENDPOINT_URL
    access_key = settings.AWS_ACCESS_KEY_ID
    secret_key = settings.AWS_SECRET_ACCESS_KEY
    region_name = settings.AWS_S3_REGION_NAME
    file_overwrite = False
    default_acl = 'public-read'
    
    def __init__(self, **kwargs):
        kwargs['bucket_name'] = self.bucket_name
        kwargs['custom_domain'] = None
        super().__init__(**kwargs)