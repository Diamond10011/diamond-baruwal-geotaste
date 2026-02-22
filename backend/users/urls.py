from django.urls import path
from .views import (
    # Auth endpoints
    register, login, logout, verify_email, resend_verification_otp, 
    forgot_password, verify_password_reset_otp, reset_password,
    get_current_user, user_profile, store_profile, restaurant_profile,
    change_password, admin_dashboard, user_dashboard,
    # Recipe endpoints
    recipe_list, recipe_detail, recipe_like, recipe_rating, user_recipes,
    # Restaurant endpoints
    restaurant_list, restaurant_detail, restaurant_nearby, restaurant_menu, restaurant_rating,
    # Store product endpoints
    store_products, store_product_detail,
    # Order endpoints
    orders, order_detail,
    # Payment endpoints
    process_payment, payment_detail
)

urlpatterns = [
    # ==================== AUTHENTICATION ====================
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    
    # Email Verification
    path('verify-email/', verify_email, name='verify_email'),
    path('resend-verification-otp/', resend_verification_otp, name='resend_verification_otp'),
    
    # Password Reset (Two-Step)
    path('forgot-password/', forgot_password, name='forgot_password'),
    path('verify-password-reset-otp/', verify_password_reset_otp, name='verify_password_reset_otp'),
    path('reset-password/', reset_password, name='reset_password'),
    
    # ==================== USER PROFILE ====================
    path('me/', get_current_user, name='current_user'),
    path('profile/', user_profile, name='user_profile'),
    path('store-profile/', store_profile, name='store_profile'),
    path('restaurant-profile/', restaurant_profile, name='restaurant_profile'),
    path('change-password/', change_password, name='change_password'),
    
    # ==================== DASHBOARDS ====================
    path('admin-dashboard/', admin_dashboard, name='admin_dashboard'),
    path('user-dashboard/', user_dashboard, name='user_dashboard'),
    
    # ==================== RECIPES ====================
    path('recipes/', recipe_list, name='recipe_list'),
    path('recipes/<str:recipe_id>/', recipe_detail, name='recipe_detail'),
    path('recipes/<str:recipe_id>/like/', recipe_like, name='recipe_like'),
    path('recipes/<str:recipe_id>/rating/', recipe_rating, name='recipe_rating'),
    path('my-recipes/', user_recipes, name='user_recipes'),
    
    # ==================== RESTAURANTS ====================
    path('restaurants/', restaurant_list, name='restaurant_list'),
    path('restaurants/<str:restaurant_id>/', restaurant_detail, name='restaurant_detail'),
    path('restaurants/nearby/', restaurant_nearby, name='restaurant_nearby'),
    path('restaurants/<str:restaurant_id>/menu/', restaurant_menu, name='restaurant_menu'),
    path('restaurants/<str:restaurant_id>/rating/', restaurant_rating, name='restaurant_rating'),
    
    # ==================== STORE PRODUCTS ====================
    path('store-products/', store_products, name='store_products'),
    path('store-products/<int:product_id>/', store_product_detail, name='store_product_detail'),
    
    # ==================== ORDERS ====================
    path('orders/', orders, name='orders'),
    path('orders/<str:order_id>/', order_detail, name='order_detail'),
    
    # ==================== PAYMENTS ====================
    path('payments/process/', process_payment, name='process_payment'),
    path('payments/<str:payment_id>/', payment_detail, name='payment_detail'),
]