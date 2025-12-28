from rest_framework import serializers
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
            user = CustomUser.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password']
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