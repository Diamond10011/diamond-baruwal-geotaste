from django.urls import path
from .views import (
    # Auth endpoints
    register, login, logout, verify_email, resend_verification_otp, 
    forgot_password, verify_password_reset_otp, reset_password,
    get_current_user, user_profile, store_profile, restaurant_profile,
    change_password, admin_dashboard, user_dashboard,
    # Recipe endpoints
    recipe_list, recipe_detail, recipe_like, recipe_rating, user_recipes,
    user_favorite_recipes, remove_favorite_recipe,
    # Restaurant endpoints
    restaurant_list, restaurant_detail, restaurant_nearby, restaurant_menu, restaurant_rating, restaurant_location,
    # Store product endpoints
    store_list, store_products, store_product_detail,
    # Order endpoints
    orders, order_detail,
    # Payment endpoints
    process_payment, payment_detail,
    # Recommendation endpoints
    recommend_recipes, popular_recipes, recommend_restaurants, popular_restaurants,
    trending_recipes, user_recommendations_summary,
    # Admin management endpoints
    admin_summary,
    admin_users, admin_user_detail, admin_user_reset_password,
    admin_recipes, admin_recipe_delete,
    admin_restaurants, admin_restaurant_detail,
    admin_stores, admin_store_detail,
    admin_orders, admin_order_update,
    admin_payments, admin_payment_update,
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

    # ==================== ADMIN MANAGEMENT ====================
    path('admin/summary/', admin_summary, name='admin_summary'),
    path('admin/users/', admin_users, name='admin_users'),
    # Accept both with/without trailing slash for non-GET requests (e.g. DELETE),
    # because Django's APPEND_SLASH does not reliably redirect unsafe methods.
    path('admin/users/<str:user_id>/', admin_user_detail, name='admin_user_detail'),
    path('admin/users/<str:user_id>', admin_user_detail, name='admin_user_detail_noslash'),
    path('admin/users/<str:user_id>/reset-password/', admin_user_reset_password, name='admin_user_reset_password'),
    path('admin/users/<str:user_id>/reset-password', admin_user_reset_password, name='admin_user_reset_password_noslash'),
    path('admin/recipes/', admin_recipes, name='admin_recipes'),
    path('admin/recipes/<str:recipe_id>/delete/', admin_recipe_delete, name='admin_recipe_delete'),
    path('admin/restaurants/', admin_restaurants, name='admin_restaurants'),
    path('admin/restaurants/<int:restaurant_id>/', admin_restaurant_detail, name='admin_restaurant_detail'),
    path('admin/stores/', admin_stores, name='admin_stores'),
    path('admin/stores/<int:store_id>/', admin_store_detail, name='admin_store_detail'),
    path('admin/orders/', admin_orders, name='admin_orders'),
    path('admin/orders/<str:order_id>/', admin_order_update, name='admin_order_update'),
    path('admin/payments/', admin_payments, name='admin_payments'),
    path('admin/payments/<str:payment_id>/', admin_payment_update, name='admin_payment_update'),
    
    # ==================== RECIPES ====================
    path('recipes/', recipe_list, name='recipe_list'),
    path('recipes/<str:recipe_id>/', recipe_detail, name='recipe_detail'),
    path('recipes/<str:recipe_id>/like/', recipe_like, name='recipe_like'),
    path('recipes/<str:recipe_id>/rating/', recipe_rating, name='recipe_rating'),
    path('my-recipes/', user_recipes, name='user_recipes'),
    path('my-favorites/', user_favorite_recipes, name='user_favorite_recipes'),
    path('my-favorites/<str:recipe_id>/', remove_favorite_recipe, name='remove_favorite_recipe'),
    
    # ==================== RESTAURANTS ====================
    path('restaurants/', restaurant_list, name='restaurant_list'),
    path('restaurants/nearby/', restaurant_nearby, name='restaurant_nearby'),
    path('restaurants/<str:restaurant_id>/', restaurant_detail, name='restaurant_detail'),
    path('restaurants/<str:restaurant_id>/menu/', restaurant_menu, name='restaurant_menu'),
    path('restaurants/<str:restaurant_id>/rating/', restaurant_rating, name='restaurant_rating'),
    path('restaurant-location/', restaurant_location, name='restaurant_location'),
    
    # ==================== STORE PRODUCTS ====================
    path('stores/', store_list, name='store_list'),
    path('store-products/', store_products, name='store_products'),
    path('store-products/<int:product_id>/', store_product_detail, name='store_product_detail'),
    
    # ==================== ORDERS ====================
    path('orders/', orders, name='orders'),
    path('orders/<str:order_id>/', order_detail, name='order_detail'),
    
    # ==================== PAYMENTS ====================
    path('payments/process/', process_payment, name='process_payment'),
    path('payments/<str:payment_id>/', payment_detail, name='payment_detail'),
    
    # ==================== RECOMMENDATIONS ====================
    path('recommendations/recipes/', recommend_recipes, name='recommend_recipes'),
    path('recommendations/recipes/popular/', popular_recipes, name='popular_recipes'),
    path('recommendations/recipes/trending/', trending_recipes, name='trending_recipes'),
    path('recommendations/restaurants/', recommend_restaurants, name='recommend_restaurants'),
    path('recommendations/restaurants/popular/', popular_restaurants, name='popular_restaurants'),
    path('recommendations/summary/', user_recommendations_summary, name='recommendations_summary'),
]
