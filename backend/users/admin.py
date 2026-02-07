from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import CustomUser, UserProfile, StoreUserProfile, RestaurantUserProfile, OTP, PasswordResetToken

@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin):
    list_display = ['email', 'role', 'is_email_verified', 'created_at']
    list_filter = ['role', 'is_email_verified', 'created_at']
    search_fields = ['email']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'is_email_verified')}),
    )

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'first_name', 'last_name', 'phone_number']
    search_fields = ['user__email', 'first_name', 'last_name']

@admin.register(StoreUserProfile)
class StoreUserProfileAdmin(admin.ModelAdmin):
    list_display = ['store_name', 'user', 'is_verified', 'created_at']
    list_filter = ['is_verified', 'created_at']
    search_fields = ['store_name', 'user__email']

@admin.register(RestaurantUserProfile)
class RestaurantUserProfileAdmin(admin.ModelAdmin):
    list_display = ['restaurant_name', 'user', 'cuisine_type', 'is_verified', 'created_at']
    list_filter = ['is_verified', 'cuisine_type', 'created_at']
    search_fields = ['restaurant_name', 'user__email']

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ['user', 'otp_type', 'is_used', 'created_at', 'expires_at']
    list_filter = ['otp_type', 'is_used', 'created_at']
    search_fields = ['user__email']

@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_used', 'created_at', 'expires_at']
    list_filter = ['is_used', 'created_at']
    search_fields = ['user__email']
