from rest_framework import serializers
from .models import User, ResponsableCode
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.utils import timezone

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'nom', 'prenom', 'filiere', 'promotion', 'semestre', 'role', 'avatar']
        read_only_fields = ['id']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    verification_code = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role = serializers.CharField(write_only=True, default='etudiant')

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'nom', 'prenom', 'filiere', 'promotion', 'semestre', 'role', 'verification_code']

    def validate(self, data):
        role = data.get('role', 'etudiant')
        
        # Si responsable, vérifier le code dans la base de données
        if role == 'responsable':
            code = data.get('verification_code')
            if not code:
                raise serializers.ValidationError({'verification_code': 'Un code de vérification est requis pour les responsables'})
            
            try:
                code_obj = ResponsableCode.objects.get(code=code.upper(), used=False)
                data['_code_obj'] = code_obj  # Stocker pour utilisation dans create()
            except ResponsableCode.DoesNotExist:
                raise serializers.ValidationError({'verification_code': 'Code invalide ou déjà utilisé'})
        
        return data

    def create(self, validated_data):
        role = validated_data.pop('role', 'etudiant')
        validated_data.pop('verification_code', None)
        code_obj = validated_data.pop('_code_obj', None)
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            nom=validated_data['nom'],
            prenom=validated_data['prenom'],
            filiere=validated_data.get('filiere', ''),
            promotion=validated_data.get('promotion', ''),
            semestre=validated_data.get('semestre', ''),
            role=role
        )
        
        # Marquer le code comme utilisé
        if code_obj:
            code_obj.used = True
            code_obj.used_by = user
            code_obj.used_at = timezone.now()
            code_obj.save()
        
        return user

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Redéfinir les champs pour accepter email au lieu de username
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Supprimer le champ username
        if 'username' in self.fields:
            del self.fields['username']
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        print(f"Login attempt: {email}")
        
        # Chercher l'utilisateur par email
        try:
            user = User.objects.get(email=email)
            print(f"User found: {user.username}")
        except User.DoesNotExist:
            print(f" No user with email: {email}")
            raise serializers.ValidationError('Aucun compte actif n\'a été trouvé avec les identifiants fournis')
        
        # Vérifier le mot de passe
        if not user.check_password(password):
            print(f"Wrong password for: {email}")
            raise serializers.ValidationError('Aucun compte actif n\'a été trouvé avec les identifiants fournis')
        
        # Vérifier que le compte est actif
        if not user.is_active:
            print(f"Inactive user: {email}")
            raise serializers.ValidationError('Ce compte est désactivé')
        
        print(f"Authentication successful for: {email}")
        
        # Générer les tokens en passant le username au parent
        # Le parent attend 'username' et 'password'
        refresh = self.get_token(user)
        
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        

from .models import User, ResponsableCode, Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'titre', 'message', 'type', 'read', 'created_at']
        read_only_fields = ['id', 'created_at']