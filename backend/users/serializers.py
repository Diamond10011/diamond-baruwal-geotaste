from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, UserProfile, StoreUserProfile, RestaurantUserProfile, OTP, PasswordResetToken
import secrets
from django.core.mail import send_mail
from django.conf import settings
import re

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES, required=True)
    
    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'password_confirm', 'role']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': "Passwords do not match."})
        
        # Frontend validation, but we validate again here for security
        if len(attrs['password']) < 8:
            raise serializers.ValidationError({'password': "Password must be at least 8 characters."})
        
        if not re.search(r'[A-Z]', attrs['password']):
            raise serializers.ValidationError({'password': "Password must contain at least one uppercase letter."})
        
        if not re.search(r'[a-z]', attrs['password']):
            raise serializers.ValidationError({'password': "Password must contain at least one lowercase letter."})
        
        if not re.search(r'[0-9]', attrs['password']):
            raise serializers.ValidationError({'password': "Password must contain at least one digit."})
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = CustomUser.objects.create_user(**validated_data)
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        # Send email verification OTP
        otp = OTP.objects.create(
            user=user,
            otp_type='email_verification'
        )
        
        # Send email
        send_verification_email(user.email, otp.code)
        
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        user = authenticate(username=attrs['email'], password=attrs['password'])
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        attrs['user'] = user
        return attrs

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'role', 'is_email_verified', 'is_admin', 'created_at']
        read_only_fields = ['id', 'is_email_verified', 'created_at']

class UserProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user_email', 'user_role', 'first_name', 'last_name', 'phone_number', 
                  'location', 'profile_photo', 'bio', 'dark_mode', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class StoreUserProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = StoreUserProfile
        fields = ['id', 'user_email', 'store_name', 'store_description', 'store_address', 
                  'business_license', 'is_verified', 'created_at', 'updated_at']
        read_only_fields = ['id', 'is_verified', 'created_at', 'updated_at']

class RestaurantUserProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = RestaurantUserProfile
        fields = ['id', 'user_email', 'restaurant_name', 'restaurant_description', 'restaurant_address', 
                  'cuisine_type', 'business_license', 'is_verified', 'created_at', 'updated_at']
        read_only_fields = ['id', 'is_verified', 'created_at', 'updated_at']

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True, required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({'new_password_confirm': "Passwords do not match."})
        return attrs

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, email):
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("No user found with this email.")
        return email

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)
    otp_type = serializers.ChoiceField(choices=['email_verification', 'password_reset'])

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True, required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({'new_password_confirm': "Passwords do not match."})
        return attrs

def send_verification_email(email, otp_code):
    """Send email verification OTP"""
    subject = 'GeoTaste - Email Verification Code'
    message = f"""
    Welcome to GeoTaste!
    
    Your email verification code is: {otp_code}
    
    This code expires in 10 minutes.
    
    If you didn't request this, please ignore this email.
    """
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])

def send_password_reset_email(email, otp_code):
    """Send password reset OTP"""
    subject = 'GeoTaste - Password Reset Code'
    message = f"""
    Password Reset Request
    
    Your password reset code is: {otp_code}
    
    This code expires in 10 minutes.
    
    If you didn't request this, please ignore this email.
    """
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
from .models import CustomUser, OTP
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True)
    confirm_password = serializers.CharField(write_only = True)

    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'confirm_password']

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data): 
        try:
            # Remove confirm_password from validated_data as it's not a model field
            validated_data.pop('confirm_password', None)
            email = validated_data['email']
            password = validated_data['password']
            
            # Use email as username since USERNAME_FIELD is set to 'email'
            user = CustomUser.objects.create_user(
                username=email,
                email=email,
                password=password
            )
            return user
        except Exception as e:
            raise serializers.ValidationError(f"Error creating user: {str(e)}")
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Invalid credentials")
    
# class ForgotPasswordSerializer(serializers.Serializer):
#     email = serializers.EmailField()

#     def save(self):
#         email = self.validated_data['email']
#         try:
#             user = CustomUser.objects.get(email=email)
#             otp = OTP.objects.create(user=user)
#             send_mail(
#                 'GeoTaste Password Reset OTP',
#                 f'Your OTP is {otp.code}. It expires in 10 minutes.',
#                 settings.EMAIL_HOST_USER,
#                 [email],
#             )
#             return otp
#         except CustomUser.DoesNotExist:
#             raise serializers.ValidationError("User not found")

# class VerifyOTPSerializer(serializers.Serializer):
#     email = serializers.EmailField()
#     otp_code = serializers.CharField()

#     def validate(self, data):
#         try:
#             user = CustomUser.objects.get(email=data['email'])
#             otp = OTP.objects.filter(user=user, code=data['otp_code']).latest('created_at')
#             if otp.is_valid():
#                 return data
#             raise serializers.ValidationError("Invalid or expired OTP")
#         except (CustomUser.DoesNotExist, OTP.DoesNotExist):
#             raise serializers.ValidationError("Invalid OTP")

# class ResetPasswordSerializer(serializers.Serializer):
#     email = serializers.EmailField()
#     new_password = serializers.CharField()
#     confirm_password = serializers.CharField()

#     def validate(self, data):
#         if data['new_password'] != data['confirm_password']:
#             raise serializers.ValidationError("Passwords don't match")
#         return data

#     def save(self):
#         user = CustomUser.objects.get(email=self.validated_data['email'])
#         user.set_password(self.validated_data['new_password'])
#         user.save()