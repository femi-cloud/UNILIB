from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Resource, CoursPratique, EmploiDuTemps
from .serializers import ResourceSerializer, CoursPratiqueSerializer, EmploiDuTempsSerializer
import traceback


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
        print("=" * 60)
        print(f"📝 Création cours pratique par {request.user.email}")
        print(f"📦 Données reçues:")
        for key, value in request.data.items():
            if hasattr(value, 'size'):
                print(f"  {key}: {value.name} ({value.size / 1024 / 1024:.2f} MB)")
            else:
                print(f"  {key}: {value}")
        print("=" * 60)
        
        try:
            serializer = self.get_serializer(data=request.data)
            
            if not serializer.is_valid():
                print(f"❌ Erreurs validation: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            print("✅ Validation réussie")
            self.perform_create(serializer)
            
            print(f"✅ Cours créé: {serializer.instance.titre}")
            if serializer.instance.fichier_zip:
                print(f"📎 Fichier uploadé: {serializer.instance.fichier_zip.url}")
            
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except Exception as e:
            print(f"❌ ERREUR CRÉATION COURS:")
            print(f"   Type: {type(e).__name__}")
            print(f"   Message: {str(e)}")
            print(f"   Traceback:")
            traceback.print_exc()
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