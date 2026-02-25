# resources/storage_backends.py
from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage


class BackblazeB2Storage(S3Boto3Storage):
    """
    Storage backend pour Backblaze B2 (bucket privé)
    Compatible S3 mais SANS ACL canned
    """
    
    def __init__(self, **settings_kwargs):
        # Configuration depuis settings.py
        settings_kwargs.setdefault('bucket_name', getattr(settings, 'AWS_STORAGE_BUCKET_NAME', ''))
        settings_kwargs.setdefault('access_key', getattr(settings, 'AWS_ACCESS_KEY_ID', ''))
        settings_kwargs.setdefault('secret_key', getattr(settings, 'AWS_SECRET_ACCESS_KEY', ''))
        settings_kwargs.setdefault('region_name', getattr(settings, 'AWS_S3_REGION_NAME', 'eu-central-003'))
        settings_kwargs.setdefault('endpoint_url', getattr(settings, 'AWS_S3_ENDPOINT_URL', ''))
        
        # ⚠️ IMPORTANT : Pas d'ACL pour Backblaze B2
        settings_kwargs.setdefault('default_acl', None)  
        settings_kwargs.setdefault('querystring_auth', True)  # URLs signées
        settings_kwargs.setdefault('signature_version', 's3v4')
        settings_kwargs.setdefault('file_overwrite', False)
        settings_kwargs.setdefault('object_parameters', {})  # Pas de ACL ici non plus
        
        super().__init__(**settings_kwargs)
    
    def get_object_parameters(self, name):
        """
        Paramètres pour chaque objet uploadé
        SANS ACL pour compatibilité Backblaze B2
        """
        params = {}
        
        # Définir le Content-Type approprié
        if name.endswith('.zip'):
            params['ContentType'] = 'application/zip'
        elif name.endswith('.pdf'):
            params['ContentType'] = 'application/pdf'
        else:
            import mimetypes
            content_type, _ = mimetypes.guess_type(name)
            if content_type:
                params['ContentType'] = content_type
        
        return params