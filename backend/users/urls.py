from django.urls import path
from .views import (
    register, login, logout, verify_email, forgot_password, reset_password,
    get_current_user, user_profile, store_profile, restaurant_profile,
    change_password, admin_dashboard, user_dashboard
)

urlpatterns = [
    # Authentication
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('verify-email/', verify_email, name='verify_email'),
    path('forgot-password/', forgot_password, name='forgot_password'),
    path('reset-password/', reset_password, name='reset_password'),
    
    # User endpoints
    path('me/', get_current_user, name='current_user'),
    path('profile/', user_profile, name='user_profile'),
    path('store-profile/', store_profile, name='store_profile'),
    path('restaurant-profile/', restaurant_profile, name='restaurant_profile'),
    path('change-password/', change_password, name='change_password'),
    
    # Dashboard endpoints
    path('admin-dashboard/', admin_dashboard, name='admin_dashboard'),
    path('user-dashboard/', user_dashboard, name='user_dashboard'),
]