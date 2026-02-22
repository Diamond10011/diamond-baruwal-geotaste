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
    profile_photo = models.URLField(blank=True, null=True, help_text="URL to profile photo")
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


# ============================================================================
# RECIPE MODELS
# ============================================================================

class Recipe(models.Model):
    """Recipe sharing model"""
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='recipes')
    title = models.CharField(max_length=255)
    description = models.TextField()
    ingredients = models.TextField(help_text="Comma-separated list or JSON format")
    instructions = models.TextField()
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='medium')
    cuisine_type = models.CharField(max_length=100, blank=True)
    preparation_time = models.IntegerField(help_text="In minutes", default=30)
    cooking_time = models.IntegerField(help_text="In minutes", default=30)
    servings = models.IntegerField(default=4)
    recipe_image = models.URLField(blank=True, null=True, help_text="URL to recipe image")
    calories = models.IntegerField(blank=True, null=True)
    dietary_tags = models.CharField(max_length=255, blank=True, help_text="e.g., vegan, gluten-free, low-carb")
    views_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} by {self.author.email}"


class RecipeRating(models.Model):
    """User ratings and reviews for recipes"""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)], help_text="1 to 5 stars")
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('recipe', 'user')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.rating}★ - {self.recipe.title} by {self.user.email}"


class RecipeLike(models.Model):
    """User likes for recipes"""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('recipe', 'user')
    
    def __str__(self):
        return f"{self.user.email} liked {self.recipe.title}"


# ============================================================================
# RESTAURANT LOCATION MODELS
# ============================================================================

class RestaurantLocation(models.Model):
    """Restaurant location with geolocation data"""
    restaurant = models.OneToOneField(RestaurantUserProfile, on_delete=models.CASCADE, related_name='location')
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20, blank=True)
    phone_number = models.CharField(max_length=20)
    website = models.URLField(blank=True, null=True)
    hours_open = models.TimeField(blank=True, null=True)
    hours_close = models.TimeField(blank=True, null=True)
    is_open = models.BooleanField(default=True)
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_ratings = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-rating_avg']
    
    def __str__(self):
        return f"{self.restaurant.restaurant_name} - {self.city}"


class RestaurantMenu(models.Model):
    """Menu items for restaurants"""
    restaurant = models.ForeignKey(RestaurantUserProfile, on_delete=models.CASCADE, related_name='menu_items')
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    category = models.CharField(max_length=100, help_text="e.g., Appetizer, Main, Dessert")
    is_available = models.BooleanField(default=True)
    dietary_info = models.CharField(max_length=255, blank=True, help_text="e.g., vegan, gluten-free")
    image = models.URLField(blank=True, null=True, help_text="URL to menu item image")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} - {self.restaurant.restaurant_name}"


class RestaurantRating(models.Model):
    """Ratings for restaurants"""
    restaurant = models.ForeignKey(RestaurantUserProfile, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('restaurant', 'user')
    
    def __str__(self):
        return f"{self.rating}★ - {self.restaurant.restaurant_name}"


# ============================================================================
# STORE PRODUCT MODELS
# ============================================================================

class StoreProduct(models.Model):
    """Products/Ingredients sold by stores"""
    store = models.ForeignKey(StoreUserProfile, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    category = models.CharField(max_length=100, help_text="e.g., Vegetables, Fruits, Dairy")
    stock = models.IntegerField(default=0, help_text="Available quantity")
    is_available = models.BooleanField(default=True)
    image = models.URLField(blank=True, null=True, help_text="URL to product image")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.store.store_name}"


# ============================================================================
# ORDER & PAYMENT MODELS
# ============================================================================

class Order(models.Model):
    """Customer orders"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('payment_pending', 'Payment Pending'),
        ('paid', 'Paid'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    order_id = models.CharField(max_length=100, unique=True, default=uuid.uuid4)
    customer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='orders')
    store = models.ForeignKey(StoreUserProfile, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    delivery_address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Order {self.order_id} - {self.customer.email}"


class OrderItem(models.Model):
    """Items in an order"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(StoreProduct, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.product.name} x {self.quantity} in Order {self.order.order_id}"


class Payment(models.Model):
    """Payment transactions"""
    PAYMENT_METHOD_CHOICES = [
        ('card', 'Credit/Debit Card'),
        ('wallet', 'Wallet'),
        ('demo', 'Demo Payment'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    payment_id = models.CharField(max_length=100, unique=True, default=uuid.uuid4)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='demo')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Payment {self.payment_id} - {self.status}"

