from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    filiere = models.CharField(max_length=100, blank=True, null=True)
    promotion = models.CharField(max_length=20, blank=True, null=True)
    semestre = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    role = models.CharField(max_length=20, choices=[('etudiant', 'Etudiant'),('responsable', 'Responsable'), ('admin', 'Admin')], default='etudiant')

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.email})"

class ResponsableCode(models.Model):
    code = models.CharField(max_length=20, unique=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_codes')
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)
    used_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='used_code')
    used_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'responsable_codes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.code} ({'Utilisé' if self.used else 'Disponible'})"
    
    
class Notification(models.Model):
    TYPE_CHOICES = [
        ('success', 'Succès'),
        ('warning', 'Avertissement'),
        ('info', 'Information'),
        ('error', 'Erreur'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    titre = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info')
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.titre} - {self.user.email}"