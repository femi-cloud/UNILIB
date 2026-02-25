from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Resource, CoursPratique, EmploiDuTemps
from .serializers import ResourceSerializer, CoursPratiqueSerializer, EmploiDuTempsSerializer
import traceback
import traceback
import logging

logger = logging.getLogger(__name__)


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

class CoursPratiqueViewSet(viewsets.ModelViewSet):
    queryset = CoursPratique.objects.all()
    serializer_class = CoursPratiqueSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = CoursPratique.objects.all()
        difficulte = self.request.query_params.get('difficulte')
        if difficulte:
            queryset = queryset.filter(difficulte=difficulte)
        return queryset
    
    def create(self, request, *args, **kwargs):
        print("=" * 80)
        print(f"🚀 DÉBUT CRÉATION COURS PRATIQUE")
        print(f"👤 User: {request.user.email}")
        print(f"📊 Content-Type: {request.content_type}")
        print(f"📦 Taille totale: {request.META.get('CONTENT_LENGTH', 'inconnu')} bytes")
        print("=" * 80)
        
        # Log tous les champs reçus
        print("\n📝 DONNÉES REÇUES:")
        for key, value in request.data.items():
            if hasattr(value, 'size'):
                size_mb = value.size / 1024 / 1024
                print(f"  ✅ {key}: {value.name} ({size_mb:.2f} MB)")
            else:
                print(f"  ✅ {key}: {value}")
        
        try:
            # Validation
            serializer = self.get_serializer(data=request.data)
            
            if not serializer.is_valid():
                print("\n❌ ERREURS DE VALIDATION:")
                for field, errors in serializer.errors.items():
                    print(f"  - {field}: {errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            print("\n✅ VALIDATION RÉUSSIE")
            
            # Sauvegarde
            print("💾 Sauvegarde en cours...")
            self.perform_create(serializer)
            
            print(f"✅ COURS CRÉÉ: {serializer.instance.titre}")
            
            if serializer.instance.fichier_zip:
                print(f"📎 Fichier ZIP uploadé: {serializer.instance.fichier_zip.url}")
            else:
                print("⚠️ Aucun fichier ZIP uploadé")
            
            print("=" * 80)
            
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except Exception as e:
            print("\n" + "=" * 80)
            print("❌ ERREUR CRITIQUE LORS DE LA CRÉATION")
            print(f"Type: {type(e).__name__}")
            print(f"Message: {str(e)}")
            print("\n📋 TRACEBACK COMPLET:")
            traceback.print_exc()
            print("=" * 80)
            
            return Response(
                {'detail': f'Erreur serveur: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

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