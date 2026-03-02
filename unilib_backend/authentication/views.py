from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, UserSerializer, NotificationSerializer
from .models import User, Notification
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from resources.models import Resource, CoursPratique
from django.contrib.auth.hashers import make_password, check_password

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        print(f"Inscription reçue: {request.data.get('email')}")
        response = super().create(request, *args, **kwargs)
        print(f"Utilisateur créé: {response.data}")
        return response

class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class EmailTokenObtainPairView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        print(f"Login attempt: {email}")
        
        if not email or not password:
            return Response(
                {'detail': 'Email et mot de passe requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Chercher l'utilisateur par email
        try:
            user = User.objects.get(email=email)
            print(f"User found: {user.username}")
        except User.DoesNotExist:
            print(f"No user with email: {email}")
            return Response(
                {'detail': 'Aucun compte actif n\'a été trouvé avec les identifiants fournis'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Vérifier le mot de passe
        if not user.check_password(password):
            print(f"Wrong password for: {email}")
            return Response(
                {'detail': 'Aucun compte actif n\'a été trouvé avec les identifiants fournis'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Vérifier que le compte est actif
        if not user.is_active:
            print(f"Inactive user: {email}")
            return Response(
                {'detail': 'Ce compte est désactivé'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        print(f"Authentication successful for: {email}")
        
        # Générer les tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    user = request.user
    
    total_resources = Resource.objects.count()
    
    from datetime import datetime, timedelta
    seven_days_ago = datetime.now() - timedelta(days=7)
    recent_resources = Resource.objects.filter(created_at__gte=seven_days_ago).count()
    
    user_uploads = Resource.objects.filter(uploaded_by=user).count() if user.role in ['admin', 'responsable'] else 0
    
    # Compter les cours pratiques
    cours_count = CoursPratique.objects.count()
    
    downloads_count = 0
    
    return Response({
        'total_resources': total_resources,
        'recent_resources': recent_resources,
        'user_uploads': user_uploads,
        'downloads_count': downloads_count,
        'cours_count': cours_count,  # ← AJOUTÉ
    })
    
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    GET: Récupérer le profil de l'utilisateur connecté
    PUT: Mettre à jour le profil
    """
    user = request.user
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Mise à jour du profil
        serializer = UserSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Changer le mot de passe de l'utilisateur
    Requiert: old_password, new_password
    """
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response(
            {'detail': 'old_password et new_password requis'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Vérifier l'ancien mot de passe
    if not check_password(old_password, user.password):
        return Response(
            {'detail': 'Ancien mot de passe incorrect'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Mettre à jour le mot de passe
    user.password = make_password(new_password)
    user.save()
    
    return Response({'detail': 'Mot de passe mis à jour avec succès'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account(request):
    """
    Supprimer le compte de l'utilisateur
    """
    user = request.user
    user.delete()
    
    return Response({'detail': 'Compte supprimé avec succès'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    """Récupérer les notifications de l'utilisateur"""
    notifications = Notification.objects.filter(user=request.user, read=False)[:10]
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Marquer une notification comme lue"""
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        notification.read = True
        notification.save()
        return Response({'success': True})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=404)