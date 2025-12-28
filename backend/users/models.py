from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import random
from django.utils import timezone

# Create your models here.
def validate_email_domain(email):
    if not (email.endswith('@gmail.com') or email.endswith('@admin.com')):
        raise ValidationError("Email must end with @gmail.com or @admin.com")

def generate_otp_code():
    return str(random.randint(100000, 999999))

def get_otp_expiry():
    return timezone.now() + timezone.timedelta(minutes=10)
    
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True, validators=[validate_email, validate_email_domain])
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name='custom_user_groups',  # Unique related_name to avoid clash
        related_query_name='user',
    )

    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='custom_user_permissions',  # Unique related_name to avoid clash
        related_query_name='user',
    )

    @property
    def is_admin(self):
        return self.email.endswith('@admin.com')
    
class OTP(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    code = models.CharField(max_length=6, default=generate_otp_code)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=get_otp_expiry)

    def is_valid(self):
        return timezone.now() < self.expires_at
    

