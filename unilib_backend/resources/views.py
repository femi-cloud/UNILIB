from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Resource, CoursPratique, EmploiDuTemps
from .serializers import ResourceSerializer, CoursPratiqueSerializer, EmploiDuTempsSerializer
from django.core.files.storage import default_storage 
import traceback
import logging

logger = logging.getLogger(__name__)


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

from rest_framework import serializers
from .models import Resource, CoursPratique, EmploiDuTemps
import os
from datetime import timedelta

class CoursPratiqueViewSet(viewsets.ModelViewSet):
    queryset = CoursPratique.objects.all()
    serializer_class = CoursPratiqueSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Seuls les cours de l'utilisateur connecté
        return CoursPratique.objects.filter(uploaded_by=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
    
    @action(detail=True, methods=['get'], url_path='download-url')
    def get_download_url(self, request, pk=None):
        """
        Génère une URL signée temporaire pour télécharger le ZIP
        Valable 24h - bucket privé Backblaze
        """
        try:
            course = self.get_object()
            
            if not course.fichier_zip:
                return Response(
                    {'error': 'Aucun fichier ZIP associé à ce cours'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Générer URL signée via django-storages (automatique avec AWS_QUERYSTRING_AUTH=True)
            file_path = course.fichier_zip.name
            signed_url = default_storage.url(file_path)
            
            # Extraire le nom de fichier propre
            filename = os.path.basename(file_path)
            
            return Response({
                'download_url': signed_url,
                'filename': filename,
                'expires_in': 86400,  # 24 heures en secondes
                'content_type': 'application/zip'
            })
            
        except Exception as e:
            logger.error(f"Erreur génération URL téléchargement {pk}: {str(e)}")
            return Response(
                {'error': 'Impossible de générer l\'URL de téléchargement'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    
class EmploiDuTempsViewSet(viewsets.ModelViewSet):
    queryset = EmploiDuTemps.objects.all()
    serializer_class = EmploiDuTempsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def actif(self, request):
        emploi = EmploiDuTemps.objects.filter(is_active=True).first()
        if emploi:
            serializer = self.get_serializer(emploi)
            return Response(serializer.data)
        return Response(None)
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)