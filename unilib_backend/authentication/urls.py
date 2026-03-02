from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, UserDetailView, EmailTokenObtainPairView, get_dashboard_stats, profile_view, change_password, delete_account, get_notifications, mark_notification_read

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserDetailView.as_view(), name='user_detail'),
    path('dashboard-stats/', get_dashboard_stats, name='dashboard_stats'),
    
    # Profile endpoints
    path('profile/', profile_view, name='profile'),
    path('change-password/', change_password, name='change_password'),
    path('delete-account/', delete_account, name='delete_account'),
    
    path('notifications/', get_notifications, name='notifications'),
    path('notifications/<int:notification_id>/read/', mark_notification_read, name='mark_notification_read'),

]
