from django.db import models
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Resource, CoursPratique, EmploiDuTemps
from .serializers import ResourceSerializer, CoursPratiqueSerializer, EmploiDuTempsSerializer
import traceback
from authentication.models import User, Notification
import requests
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


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
        
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_chat(request):
    """
    Endpoint IA avec contexte des ressources Unilib + historique
    """
    user_message = request.data.get('message', '')
    include_resources = request.data.get('include_resources', True)
    conversation_history = request.data.get('history', [])  # ✅ Récupérer l'historique
    
    if not user_message:
        return Response({'error': 'Message requis'}, status=400)
    
    # Récupérer la clé API Gemini
    api_key = getattr(settings, 'VITE_GEMINI_API_KEY', None)
    if not api_key:
        return Response({'error': 'API Gemini non configurée'}, status=500)
    
    try:
        # ✅ Construire le contexte des ressources
        context = build_resources_context(request.user) if include_resources else ""
        
        # ✅ Vérifier si c'est le premier message
        is_first_message = len(conversation_history) == 0
        
        if is_first_message:
            # Premier message : prompt complet avec contexte
            prompt = build_ai_prompt(user_message, context, request.user)
            response = call_gemini_api(api_key, prompt)
        else:
            # Messages suivants : utiliser l'historique
            response = call_gemini_api_with_history(
                api_key, 
                user_message, 
                context, 
                request.user, 
                conversation_history
            )
        
        return Response({
            'response': response,
            'context_used': bool(context)
        })
        
    except Exception as e:
        logger.error(f"Erreur AI Chat: {str(e)}")
        return Response({'error': str(e)}, status=500)


def build_resources_context(user):
    """
    Construit un contexte textuel des ressources disponibles avec leurs IDs
    """
    context_parts = []
    
    # 📚 Ressources
    resources = Resource.objects.all().order_by('-created_at')[:50]
    
    if resources.exists():
        context_parts.append("📚 RESSOURCES DISPONIBLES SUR UNILIB :")
        
        matieres = {}
        for r in resources:
            if r.matiere not in matieres:
                matieres[r.matiere] = []
            matieres[r.matiere].append({
                'id': str(r.id),
                'titre': r.titre,
                'type': r.get_type_ressource_display(),
                'filiere': r.get_filiere_display(),
                'promotion': r.get_promotion_display(),
                'semestre': r.semestre,
            })
        
        for matiere, items in matieres.items():
            context_parts.append(f"\n  📖 {matiere}:")
            for item in items[:5]:
                context_parts.append(
                    f"    - [{item['titre']}](resource:{item['id']}) ({item['type']}) - {item['filiere']} {item['promotion']} S{item['semestre']}"
                )
    
    # 🎯 Cours pratiques
    cours_pratiques = CoursPratique.objects.all().order_by('-created_at')[:20]
    
    if cours_pratiques.exists():
        context_parts.append("\n\n🎯 COURS PRATIQUES DISPONIBLES :")
        for cp in cours_pratiques:
            stack = ', '.join(cp.stack) if isinstance(cp.stack, list) else str(cp.stack)
            context_parts.append(
                f"  - [{cp.titre}](cours:{cp.id}) ({cp.get_difficulte_display()}) - Technologies: {stack}"
            )
    
    # 📊 Statistiques
    stats = {
        'total_resources': Resource.objects.count(),
        'total_cours_pratiques': CoursPratique.objects.count(),
        'matieres': Resource.objects.values_list('matiere', flat=True).distinct().count(),
    }
    
    context_parts.append(f"\n\n📊 STATISTIQUES UNILIB :")
    context_parts.append(f"  - {stats['total_resources']} ressources disponibles")
    context_parts.append(f"  - {stats['total_cours_pratiques']} cours pratiques")
    context_parts.append(f"  - {stats['matieres']} matières couvertes")
    
    return '\n'.join(context_parts)


def build_ai_prompt_system(context, user):
    """
    Construit le prompt système (instructions générales)
    Utilisé pour les messages suivants avec historique
    """
    user_info = f"""
👤 ÉTUDIANT :
- Nom : {user.prenom} {user.nom}
- Filière : {user.get_filiere_display() if hasattr(user, 'get_filiere_display') else user.filiere}
- Promotion : {user.promotion.upper() if user.promotion else 'Non spécifiée'}
"""
    
    system_prompt = f"""Tu es l'assistant pédagogique officiel de **Unilib**, la plateforme de ressources de l'**IFRI** au Bénin.

{user_info}

{context}

🎓 TON RÔLE :
Tu accompagnes cet étudiant dans son apprentissage. Tu dois **combiner** les ressources Unilib ET tes connaissances générales en informatique.

📚 RÈGLES POUR LES RESSOURCES UNILIB :
1. **Si des ressources Unilib sont pertinentes** → cite-les en utilisant EXACTEMENT le format : [Titre](resource:ID) ou [Titre](cours:ID)
2. **Copie le lien tel quel** depuis la liste ci-dessus
3. **NE FABRIQUE JAMAIS** de faux liens

💡 RÈGLES POUR LES CONNAISSANCES GÉNÉRALES :
4. **Si aucune ressource Unilib ne correspond EXACTEMENT** → utilise tes connaissances pour donner une réponse pédagogique complète
5. **Tu peux combiner** : citer une ressource Unilib proche + expliquer avec tes connaissances + aider explicitement l'apprenant

📝 FORMAT DE RÉPONSE :
- **NE TE PRÉSENTE PAS À CHAQUE MESSAGE** (la conversation est continue)
- **SOIS DIRECT ET NATUREL** comme dans une vraie conversation
- Structure ta réponse en **sections claires**
- Utilise le **markdown** : **gras**, *italique*, listes à puces
- **Personnalise** selon la filière et promotion de l'étudiant
- Réponds en **français** ou en **anglais** selon le prompt de l'utilisateur
- Sois **pédagogue** et **encourageant**

Réponds de manière **complète et utile**, en citant les ressources Unilib quand elles existent, ET en apportant tes connaissances pédagogiques quand nécessaire."""

    return system_prompt


def build_ai_prompt(user_message, context, user):
    """
    Construit le prompt complet pour le PREMIER message
    """
    system_instructions = build_ai_prompt_system(context, user)
    
    prompt = f"""{system_instructions}

❓ QUESTION DE L'ÉTUDIANT :
{user_message}

Réponds de manière **complète et utile**."""

    return prompt


def call_gemini_api(api_key, prompt):
    """
    Appelle l'API Gemini pour le premier message (sans historique)
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={api_key}"
    
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 8192,
        }
    }
    
    response = requests.post(url, json=payload, timeout=60)
    response.raise_for_status()
    
    data = response.json()
    
    if 'candidates' in data and len(data['candidates']) > 0:
        return data['candidates'][0]['content']['parts'][0]['text']
    else:
        raise Exception("Réponse invalide de Gemini")


def call_gemini_api_with_history(api_key, user_message, context, user, conversation_history):
    """
    Appelle l'API Gemini avec l'historique de conversation
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={api_key}"
    
    # ✅ Construire le prompt système
    system_instruction = build_ai_prompt_system(context, user)
    
    # ✅ Construire les messages avec historique
    contents = []
    
    # Ajouter l'historique
    for msg in conversation_history:
        contents.append({
            "role": msg['role'],
            "parts": [{"text": msg['content']}]
        })
    
    # Ajouter le nouveau message utilisateur
    contents.append({
        "role": "user",
        "parts": [{"text": user_message}]
    })
    
    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": system_instruction}]
        },
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 8192,
        }
    }
    
    response = requests.post(url, json=payload, timeout=60)
    response.raise_for_status()
    
    data = response.json()
    
    if 'candidates' in data and len(data['candidates']) > 0:
        return data['candidates'][0]['content']['parts'][0]['text']
    else:
        raise Exception("Réponse invalide de Gemini")