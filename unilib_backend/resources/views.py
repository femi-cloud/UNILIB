from django.db import models
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Resource, CoursPratique, EmploiDuTemps
from .serializers import ResourceSerializer, CoursPratiqueSerializer, EmploiDuTempsSerializer
import traceback
from authentication.models import User, Notification


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Resource.objects.all()
        
        # FILTRES
        filiere = self.request.query_params.get('filiere')
        promotion = self.request.query_params.get('promotion')
        semestre = self.request.query_params.get('semestre')
        type_ressource = self.request.query_params.get('type_ressource')
        search = self.request.query_params.get('search')
        
        if filiere and filiere != 'toutes':
            queryset = queryset.filter(filiere=filiere)
        if promotion:
            queryset = queryset.filter(promotion=promotion)
        if semestre:
            queryset = queryset.filter(semestre=semestre)
        if type_ressource:
            queryset = queryset.filter(type_ressource=type_ressource)
        if search:
            queryset = queryset.filter(
                models.Q(titre__icontains=search) | 
                models.Q(matiere__icontains=search) |
                models.Q(description__icontains=search)
            )
        
        return queryset
        
    def perform_create(self, serializer):
        resource = serializer.save(uploaded_by=self.request.user)
        
        # ✅ CRÉER NOTIFICATION POUR TOUS LES USERS
        users = User.objects.exclude(id=self.request.user.id)
        notifications = [
            Notification(
                user=user,
                titre='Nouvelle ressource disponible',
                message=f"📚 {resource.titre} ({resource.matiere}) a été ajouté",
                type='success'
            )
            for user in users
        ]
        Notification.objects.bulk_create(notifications)


class CoursPratiqueViewSet(viewsets.ModelViewSet):
    queryset = CoursPratique.objects.all()
    serializer_class = CoursPratiqueSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        else:
            return [permissions.IsAdminUser()]
    
    def get_queryset(self):
        queryset = CoursPratique.objects.all()
        difficulte = self.request.query_params.get('difficulte')
        if difficulte:
            queryset = queryset.filter(difficulte=difficulte)
        return queryset
    
    def create(self, request, *args, **kwargs):
        print("=" * 60)
        print(f" Création cours pratique par {request.user.email}")
        print(f" Données reçues:")
        for key, value in request.data.items():
            if hasattr(value, 'size'):
                print(f"  {key}: {value.name} ({value.size / 1024 / 1024:.2f} MB)")
            else:
                print(f"  {key}: {value}")
        print("=" * 60)
        
        try:
            serializer = self.get_serializer(data=request.data)
            
            if not serializer.is_valid():
                print(f" Erreurs validation: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            print(" Validation réussie")
            self.perform_create(serializer)
            
            print(f"Cours créé: {serializer.instance.titre}")
            if serializer.instance.fichier_zip:
                print(f"Fichier uploadé: {serializer.instance.fichier_zip.url}")
            
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except Exception as e:
            print(f"ERREUR CRÉATION COURS:")
            print(f"   Type: {type(e).__name__}")
            print(f"   Message: {str(e)}")
            traceback.print_exc()
            return Response(
                {'detail': f'Erreur serveur: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    # AJOUT DELETE
    def destroy(self, request, *args, **kwargs):
        print(f"Suppression cours pratique par {request.user.email}")
        instance = self.get_object()
        print(f"   Cours: {instance.titre}")
        
        # Supprimer le fichier ZIP de Backblaze/local
        if instance.fichier_zip:
            try:
                instance.fichier_zip.delete(save=False)
                print(f"Fichier ZIP supprimé")
            except Exception as e:
                print(f"Erreur suppression fichier: {e}")
        
        self.perform_destroy(instance)
        print(f"Cours supprimé de la BDD")
        return Response(status=status.HTTP_204_NO_CONTENT)
        
    def perform_create(self, serializer):
        cours = serializer.save(uploaded_by=self.request.user)
        
        # ✅ CRÉER NOTIFICATION
        users = User.objects.exclude(id=self.request.user.id)
        notifications = [
            Notification(
                user=user,
                titre='Nouveau cours pratique disponible',
                message=f"🎯 {cours.titre} ({cours.difficulte}) est disponible",
                type='info'
            )
            for user in users
        ]
        Notification.objects.bulk_create(notifications)


class EmploiDuTempsViewSet(viewsets.ModelViewSet):
    queryset = EmploiDuTemps.objects.all()
    serializer_class = EmploiDuTempsSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'actif']:
            return [permissions.IsAuthenticated()]
        else:
            return [permissions.IsAdminUser()]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=False, methods=['get'])
    def actif(self, request):
        """Récupérer l'emploi du temps actif"""
        emploi = EmploiDuTemps.objects.filter(is_active=True).first()
        if emploi:
            serializer = self.get_serializer(emploi)
            return Response(serializer.data)
        return Response(None)
    
    def create(self, request, *args, **kwargs):
        print("=" * 60)
        print(f"Création emploi du temps par {request.user.email}")
        print(f"Données reçues:")
        for key, value in request.data.items():
            if hasattr(value, 'size'):
                print(f"  {key}: {value.name} ({value.size / 1024 / 1024:.2f} MB)")
            else:
                print(f"  {key}: {value}")
        print("=" * 60)
        
        try:
            serializer = self.get_serializer(data=request.data)
            
            if not serializer.is_valid():
                print(f"Erreurs validation: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            print("Validation réussie")
            self.perform_create(serializer)
            
            print(f"Emploi du temps créé: {serializer.instance.titre}")
            if serializer.instance.fichier_pdf:
                print(f"Fichier uploadé: {serializer.instance.fichier_pdf.url}")
            
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except Exception as e:
            print(f" ERREUR CRÉATION EMPLOI DU TEMPS:")
            print(f"   Type: {type(e).__name__}")
            print(f"   Message: {str(e)}")
            traceback.print_exc()
            return Response(
                {'detail': f'Erreur serveur: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        """Désactiver l'emploi du temps au lieu de le supprimer"""
        instance = self.get_object()
        print(f"🔄 Désactivation emploi du temps: {instance.titre}")
        
        instance.is_active = False
        instance.save()
        
        print(f"Emploi du temps désactivé (conservé en BDD)")
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def perform_create(self, serializer):
        emploi = serializer.save(uploaded_by=self.request.user)
        
        # ✅ CRÉER NOTIFICATION
        users = User.objects.exclude(id=self.request.user.id)
        notifications = [
            Notification(
                user=user,
                titre='Emploi du temps mis à jour',
                message=f"📅 L'emploi du temps a été mis à jour",
                type='warning'
            )
            for user in users
        ]
        Notification.objects.bulk_create(notifications)