from rest_framework import serializers
from .models import Resource, CoursPratique, EmploiDuTemps

class ResourceSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()
    fichier_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Resource
        fields = '__all__'
        read_only_fields = ['id', 'uploaded_by', 'created_at', 'updated_at']
    
    def get_uploaded_by_name(self, obj):
        return f"{obj.uploaded_by.prenom} {obj.uploaded_by.nom}"
    
    def get_fichier_url(self, obj):
        if obj.fichier:
            return obj.fichier.url
        return None
    
    
class CoursPratiqueSerializer(serializers.ModelSerializer):
    fichier_zip_url = serializers.SerializerMethodField()
    uploaded_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CoursPratique
        fields = '__all__'
        read_only_fields = ['id', 'uploaded_by', 'created_at', 'updated_at']
    
    def get_fichier_zip_url(self, obj):
        if obj.fichier_zip:
            try:
                # En production avec Cloudinary
                if hasattr(obj.fichier_zip, 'url'):
                    return obj.fichier_zip.url
            except Exception as e:
                print(f"⚠️ Erreur récupération URL: {e}")
        return None
    
    def get_uploaded_by_name(self, obj):
        return f"{obj.uploaded_by.prenom} {obj.uploaded_by.nom}"


class EmploiDuTempsSerializer(serializers.ModelSerializer):
    fichier_pdf_url = serializers.SerializerMethodField()
    uploaded_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = EmploiDuTemps
        fields = '__all__'
        read_only_fields = ['id', 'uploaded_by', 'created_at']
    
    def get_fichier_pdf_url(self, obj):
        if obj.fichier_pdf:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.fichier_pdf.url)
        return None
    
    def get_uploaded_by_name(self, obj):
        return f"{obj.uploaded_by.prenom} {obj.uploaded_by.nom}"