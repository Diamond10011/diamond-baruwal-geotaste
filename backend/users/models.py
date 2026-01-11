from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.validators import validate_email, URLValidator
from django.core.exceptions import ValidationError
import random
from django.utils import timezone
import uuid

# Create your models here.
def validate_email_domain(email):
    # Allow any email domain
    pass

def generate_otp_code():
    return str(random.randint(100000, 999999))

def get_otp_expiry():
    return timezone.now() + timezone.timedelta(minutes=10)

class CustomUser(AbstractUser):
    # User role choices
    ROLE_CHOICES = [
        ('normal', 'Normal User'),
        ('store', 'Store User'),
        ('restaurant', 'Restaurant User'),
        ('admin', 'Admin'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, validators=[validate_email])
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='normal')
    is_email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='custom_user_groups',
        related_query_name='user',
    )

    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='custom_user_permissions',
        related_query_name='user',
    )

    @property
    def is_admin(self):
        return self.role == 'admin'
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
    
class UserProfile(models.Model):
    """Extended user profile with common fields for all roles"""
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=255, blank=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    bio = models.TextField(blank=True)
    dark_mode = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Profile of {self.user.email}"

class StoreUserProfile(models.Model):
    """Store user specific profile"""
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='store_profile')
    store_name = models.CharField(max_length=255)
    store_description = models.TextField(blank=True)
    store_address = models.CharField(max_length=255)
    business_license = models.FileField(upload_to='store_licenses/', blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Store: {self.store_name}"

class RestaurantUserProfile(models.Model):
    """Restaurant user specific profile"""
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='restaurant_profile')
    restaurant_name = models.CharField(max_length=255)
    restaurant_description = models.TextField(blank=True)
    restaurant_address = models.CharField(max_length=255)
    cuisine_type = models.CharField(max_length=100, blank=True)
    business_license = models.FileField(upload_to='restaurant_licenses/', blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Restaurant: {self.restaurant_name}"

class OTP(models.Model):
    """OTP model for email verification and password reset"""
    OTP_TYPE_CHOICES = [
        ('email_verification', 'Email Verification'),
        ('password_reset', 'Password Reset'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='otps')
    code = models.CharField(max_length=6, default=generate_otp_code)
    otp_type = models.CharField(max_length=20, choices=OTP_TYPE_CHOICES, default='email_verification')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=get_otp_expiry)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        return timezone.now() < self.expires_at and not self.is_used
    
    def __str__(self):
        return f"{self.otp_type} - {self.user.email}"

class PasswordResetToken(models.Model):
    """Token for password reset"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reset_tokens')
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=get_otp_expiry)
    is_used = models.BooleanField(default=False)
    
    def is_valid(self):
        return timezone.now() < self.expires_at and not self.is_used

