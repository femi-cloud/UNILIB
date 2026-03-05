from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from resources.views import ResourceViewSet, CoursPratiqueViewSet, EmploiDuTempsViewSet, ai_chat

# Router pour les ViewSets
router = DefaultRouter()
router.register('resources', ResourceViewSet, basename='resource')
router.register('cours-pratiques', CoursPratiqueViewSet, basename='cours-pratique')
router.register('emploi-temps', EmploiDuTempsViewSet, basename='emploi-temps')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/', include(router.urls)),  
    path('api/ai/chat/', ai_chat, name='ai_chat'),
]

# Servir les fichiers media en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)