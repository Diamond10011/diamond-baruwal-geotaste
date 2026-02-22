from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import (
    CustomUser, UserProfile, StoreUserProfile, RestaurantUserProfile, OTP, PasswordResetToken,
    Recipe, RecipeRating, RecipeLike, RestaurantLocation, RestaurantMenu, RestaurantRating,
    StoreProduct, Order, OrderItem, Payment
)
from django.core.mail import send_mail
from django.conf import settings
import secrets

# ============================================================================
# EMAIL FUNCTIONS
# ============================================================================

def send_verification_email(email, otp_code):
    """Send OTP verification email"""
    subject = "Verify your GeoTaste email"
    message = f"""
Hello,

Thank you for registering with GeoTaste! 

Your email verification code is: {otp_code}

This code will expire in 10 minutes.

Best regards,
GeoTaste Team
    """
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email], fail_silently=False)
    except Exception as e:
        print(f"Error sending verification email: {e}")

def send_password_reset_email(email, otp_code):
    """Send password reset OTP email"""
    subject = "Reset your GeoTaste password"
    message = f"""
Hello,

We received a request to reset your password.

Your password reset code is: {otp_code}

This code will expire in 10 minutes.

If you didn't request this, please ignore this email.

Best regards,
GeoTaste Team
    """
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email], fail_silently=False)
    except Exception as e:
        print(f"Error sending password reset email: {e}")

# ============================================================================
# SERIALIZERS
# ============================================================================

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES, required=True)
    
    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'password_confirm', 'role']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': "Passwords do not match."})
        
        # Check if user already exists
        if CustomUser.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({'email': "Email already registered."})
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = CustomUser(
            email=validated_data['email'],
            role=validated_data['role'],
            username=validated_data['email'],
            is_email_verified=True
        )
        user.set_password(password)
        user.save()
        
        # Create user profile for all users
        UserProfile.objects.create(user=user)
        
        # Create role-specific profile
        if user.role == 'store':
            StoreUserProfile.objects.create(user=user, store_name='', store_address='')
        elif user.role == 'restaurant':
            RestaurantUserProfile.objects.create(user=user, restaurant_name='', restaurant_address='')
        
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        # Authenticate using email
        user = authenticate(username=email, password=password)
        
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        
        attrs['user'] = user
        return attrs


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification"""
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6, min_length=6)
    
    def validate(self, attrs):
        email = attrs.get('email')
        otp_code = attrs.get('otp_code')
        
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User not found.")
        
        # Check if OTP exists and is valid
        try:
            otp = OTP.objects.get(
                user=user,
                code=otp_code,
                otp_type='email_verification',
                is_used=False
            )
            if not otp.is_valid():
                raise serializers.ValidationError("OTP has expired or is invalid.")
        except OTP.DoesNotExist:
            raise serializers.ValidationError("Invalid OTP code.")
        
        attrs['user'] = user
        attrs['otp'] = otp
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer for forgot password - step 1"""
    email = serializers.EmailField()
    
    def validate_email(self, value):
        try:
            user = CustomUser.objects.get(email=value)
            return value
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")


class VerifyPasswordResetOTPSerializer(serializers.Serializer):
    """Serializer for verifying password reset OTP - step 2"""
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6, min_length=6)
    
    def validate(self, attrs):
        email = attrs.get('email')
        otp_code = attrs.get('otp_code')
        
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User not found.")
        
        try:
            otp = OTP.objects.get(
                user=user,
                code=otp_code,
                otp_type='password_reset',
                is_used=False
            )
            if not otp.is_valid():
                raise serializers.ValidationError("OTP has expired or is invalid.")
        except OTP.DoesNotExist:
            raise serializers.ValidationError("Invalid OTP code.")
        
        attrs['user'] = user
        attrs['otp'] = otp
        return attrs


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer for resetting password after OTP verification"""
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        email = attrs.get('email')
        otp_code = attrs.get('otp_code')
        
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User not found.")
        
        try:
            otp = OTP.objects.get(
                user=user,
                code=otp_code,
                otp_type='password_reset',
                is_used=False
            )
            if not otp.is_valid():
                raise serializers.ValidationError("OTP has expired or is invalid.")
        except OTP.DoesNotExist:
            raise serializers.ValidationError("Invalid OTP code.")
        
        attrs['user'] = user
        attrs['otp'] = otp
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password of authenticated user"""
    old_password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class UserSerializer(serializers.ModelSerializer):
    """Serializer for CustomUser"""
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'role', 'is_email_verified', 'is_admin', 'created_at']
        read_only_fields = ['id', 'is_email_verified', 'is_admin', 'created_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user_email', 'user_role', 'first_name', 'last_name', 
            'phone_number', 'location', 'profile_photo', 'bio', 'dark_mode', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user_email', 'user_role', 'created_at', 'updated_at']


class StoreUserProfileSerializer(serializers.ModelSerializer):
    """Serializer for StoreUserProfile"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = StoreUserProfile
        fields = [
            'id', 'user_email', 'store_name', 'store_description', 
            'store_address', 'business_license', 'is_verified', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user_email', 'is_verified', 'created_at', 'updated_at']


class RestaurantUserProfileSerializer(serializers.ModelSerializer):
    """Serializer for RestaurantUserProfile"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = RestaurantUserProfile
        fields = [
            'id', 'user_email', 'restaurant_name', 'restaurant_description', 
            'restaurant_address', 'cuisine_type', 'business_license', 'is_verified', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user_email', 'is_verified', 'created_at', 'updated_at']


# ============================================================================
# RECIPE SERIALIZERS
# ============================================================================

class RecipeRatingSerializer(serializers.ModelSerializer):
    """Serializer for recipe ratings and reviews"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = RecipeRating
        fields = ['id', 'rating', 'comment', 'user_email', 'created_at']
        read_only_fields = ['id', 'user_email', 'created_at']


class RecipeLikeSerializer(serializers.ModelSerializer):
    """Serializer for recipe likes"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = RecipeLike
        fields = ['id', 'user_email', 'created_at']
        read_only_fields = ['id', 'user_email', 'created_at']


class RecipeListSerializer(serializers.ModelSerializer):
    """Serializer for recipe list view"""
    author_email = serializers.CharField(source='author.email', read_only=True)
    author_name = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'author_email', 'author_name', 'description', 'difficulty',
            'cuisine_type', 'preparation_time', 'cooking_time', 'servings', 'recipe_image',
            'dietary_tags', 'views_count', 'rating_count', 'likes_count', 'avg_rating',
            'created_at'
        ]
        read_only_fields = ['id', 'author_email', 'views_count', 'created_at']
    
    def get_author_name(self, obj):
        return f"{obj.author.profile.first_name} {obj.author.profile.last_name}".strip() or obj.author.email
    
    def get_rating_count(self, obj):
        return obj.ratings.count()
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_avg_rating(self, obj):
        ratings = obj.ratings.all()
        if ratings.exists():
            total = sum(r.rating for r in ratings)
            return round(total / ratings.count(), 2)
        return 0


class RecipeDetailSerializer(serializers.ModelSerializer):
    """Detailed recipe serializer with ratings and likes"""
    author_email = serializers.CharField(source='author.email', read_only=True)
    author_name = serializers.SerializerMethodField()
    ratings = RecipeRatingSerializer(many=True, read_only=True)
    likes_count = serializers.SerializerMethodField()
    user_liked = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()
    avg_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'author_email', 'author_name', 'description', 'ingredients',
            'instructions', 'difficulty', 'cuisine_type', 'preparation_time', 'cooking_time',
            'servings', 'recipe_image', 'calories', 'dietary_tags', 'views_count',
            'likes_count', 'user_liked', 'rating_count', 'user_rating', 'avg_rating',
            'ratings', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'views_count', 'created_at', 'updated_at']
    
    def get_author_name(self, obj):
        return f"{obj.author.profile.first_name} {obj.author.profile.last_name}".strip() or obj.author.email
    
    def get_likes_count(self, obj):
        return obj.likes.count()
    
    def get_user_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False
    
    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            rating = obj.ratings.filter(user=request.user).first()
            return RecipeRatingSerializer(rating).data if rating else None
        return None
    
    def get_avg_rating(self, obj):
        ratings = obj.ratings.all()
        if ratings.exists():
            total = sum(r.rating for r in ratings)
            return round(total / ratings.count(), 2)
        return 0


class RecipeCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating recipes"""
    
    class Meta:
        model = Recipe
        fields = [
            'title', 'description', 'ingredients', 'instructions', 'difficulty',
            'cuisine_type', 'preparation_time', 'cooking_time', 'servings',
            'recipe_image', 'calories', 'dietary_tags'
        ]


# ============================================================================
# RESTAURANT SERIALIZERS
# ============================================================================

class RestaurantMenuSerializer(serializers.ModelSerializer):
    """Serializer for restaurant menu items"""
    
    class Meta:
        model = RestaurantMenu
        fields = [
            'id', 'name', 'description', 'price', 'category', 'is_available',
            'dietary_info', 'image', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RestaurantLocationSerializer(serializers.ModelSerializer):
    """Serializer for restaurant location"""
    restaurant_name = serializers.CharField(source='restaurant.restaurant_name', read_only=True)
    
    class Meta:
        model = RestaurantLocation
        fields = [
            'id', 'restaurant_name', 'latitude', 'longitude', 'city', 'country',
            'postal_code', 'phone_number', 'website', 'hours_open', 'hours_close',
            'is_open', 'rating_avg', 'total_ratings', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'rating_avg', 'total_ratings', 'created_at', 'updated_at']


class RestaurantRatingSerializer(serializers.ModelSerializer):
    """Serializer for restaurant ratings"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = RestaurantRating
        fields = ['id', 'rating', 'comment', 'user_email', 'created_at']
        read_only_fields = ['id', 'user_email', 'created_at']


class RestaurantDetailSerializer(serializers.ModelSerializer):
    """Detailed restaurant serializer"""
    location = RestaurantLocationSerializer(read_only=True)
    menu_items = RestaurantMenuSerializer(many=True, read_only=True)
    ratings = RestaurantRatingSerializer(many=True, read_only=True)
    avg_rating = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = RestaurantUserProfile
        fields = [
            'id', 'restaurant_name', 'restaurant_description', 'restaurant_address',
            'cuisine_type', 'is_verified', 'location', 'menu_items', 'ratings',
            'avg_rating', 'user_rating', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_verified', 'created_at', 'updated_at']
    
    def get_avg_rating(self, obj):
        ratings = obj.ratings.all()
        if ratings.exists():
            total = sum(r.rating for r in ratings)
            return round(total / ratings.count(), 2)
        return 0
    
    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            rating = obj.ratings.filter(user=request.user).first()
            return RecipeRatingSerializer(rating).data if rating else None
        return None


class RestaurantListSerializer(serializers.ModelSerializer):
    """Serializer for restaurant list view"""
    location = RestaurantLocationSerializer(read_only=True)
    rating_avg = serializers.SerializerMethodField()
    
    class Meta:
        model = RestaurantUserProfile
        fields = [
            'id', 'restaurant_name', 'restaurant_description', 'cuisine_type',
            'is_verified', 'location', 'rating_avg', 'created_at'
        ]
    
    def get_rating_avg(self, obj):
        ratings = obj.ratings.all()
        if ratings.exists():
            total = sum(r.rating for r in ratings)
            return round(total / ratings.count(), 2)
        return 0


class NearbyRestaurantSerializer(serializers.Serializer):
    """Serializer for nearby restaurant search query"""
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6)
    radius = serializers.IntegerField(default=10, help_text="Radius in kilometers")
    cuisine_type = serializers.CharField(required=False, allow_blank=True)


# ============================================================================
# STORE PRODUCT SERIALIZERS
# ============================================================================

class StoreProductSerializer(serializers.ModelSerializer):
    """Serializer for store products"""
    store_name = serializers.CharField(source='store.store_name', read_only=True)
    
    class Meta:
        model = StoreProduct
        fields = [
            'id', 'store_name', 'name', 'description', 'price', 'category',
            'stock', 'is_available', 'image', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ============================================================================
# ORDER & PAYMENT SERIALIZERS
# ============================================================================

class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items"""
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product_id', 'product_name', 'quantity', 'price', 'subtotal']
        read_only_fields = ['id', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for orders"""
    items = OrderItemSerializer(many=True, read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    store_name = serializers.CharField(source='store.store_name', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'customer_email', 'store_name', 'status',
            'total_amount', 'subtotal', 'tax', 'delivery_address', 'notes',
            'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_id', 'total_amount', 'subtotal', 'tax', 'created_at', 'updated_at']


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payments"""
    order_id = serializers.CharField(source='order.order_id', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'payment_id', 'order_id', 'amount', 'payment_method',
            'status', 'transaction_id', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'payment_id', 'created_at', 'updated_at']

