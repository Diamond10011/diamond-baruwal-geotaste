from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser, UserProfile, StoreUserProfile, RestaurantUserProfile, OTP
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, UserProfileSerializer,
    StoreUserProfileSerializer, RestaurantUserProfileSerializer, ChangePasswordSerializer,
    ForgotPasswordSerializer, VerifyOTPSerializer, ResetPasswordSerializer,
    send_verification_email, send_password_reset_email
)
from django.utils import timezone

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user
    Expected fields: email, password, password_confirm, role
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'message': 'User registered successfully. Please verify your email.',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login user and return JWT tokens
    Expected fields: email, password
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        if not user.is_email_verified:
            return Response({
                'error': 'Email not verified. Please verify your email first.',
                'email': user.email
            }, status=status.HTTP_400_BAD_REQUEST)
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout user (JWT blacklist would be handled by frontend by removing tokens)
    """
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """
    Verify email using OTP
    Expected fields: email, otp_code
    """
    serializer = VerifyOTPSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']
        otp_type = serializer.validated_data['otp_type']
        
        try:
            user = CustomUser.objects.get(email=email)
            otp = OTP.objects.filter(
                user=user,
                code=otp_code,
                otp_type=otp_type
            ).first()
            
            if not otp:
                return Response({
                    'error': 'Invalid OTP'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not otp.is_valid():
                return Response({
                    'error': 'OTP has expired'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Mark email as verified
            user.is_email_verified = True
            user.save()
            
            # Mark OTP as used
            otp.is_used = True
            otp.save()
            
            return Response({
                'message': 'Email verified successfully'
            }, status=status.HTTP_200_OK)
        
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    Send password reset OTP to email
    Expected fields: email
    """
    serializer = ForgotPasswordSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        user = CustomUser.objects.get(email=email)
        
        # Create OTP
        otp = OTP.objects.create(
            user=user,
            otp_type='password_reset'
        )
        
        # Send email
        send_password_reset_email(email, otp.code)
        
        return Response({
            'message': 'Password reset code sent to your email',
            'email': email
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Reset password using OTP
    Expected fields: email, otp_code, new_password, new_password_confirm
    """
    serializer = ResetPasswordSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']
        new_password = serializer.validated_data['new_password']
        
        try:
            user = CustomUser.objects.get(email=email)
            otp = OTP.objects.filter(
                user=user,
                code=otp_code,
                otp_type='password_reset'
            ).first()
            
            if not otp:
                return Response({
                    'error': 'Invalid OTP'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not otp.is_valid():
                return Response({
                    'error': 'OTP has expired'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update password
            user.set_password(new_password)
            user.save()
            
            # Mark OTP as used
            otp.is_used = True
            otp.save()
            
            return Response({
                'message': 'Password reset successfully'
            }, status=status.HTTP_200_OK)
        
        except CustomUser.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get current logged-in user details
    """
    user = request.user
    return Response({
        'user': UserSerializer(user).data
    }, status=status.HTTP_200_OK)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Get or update user profile
    """
    user = request.user
    profile, created = UserProfile.objects.get_or_create(user=user)
    
    if request.method == 'GET':
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully',
                'profile': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def store_profile(request):
    """
    Get or update store user profile (only for store users)
    """
    user = request.user
    
    if user.role != 'store':
        return Response({
            'error': 'Only store users can access this endpoint'
        }, status=status.HTTP_403_FORBIDDEN)
    
    store_profile, created = StoreUserProfile.objects.get_or_create(
        user=user,
        defaults={'store_name': '', 'store_address': ''}
    )
    
    if request.method == 'GET':
        serializer = StoreUserProfileSerializer(store_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        serializer = StoreUserProfileSerializer(store_profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Store profile updated successfully',
                'profile': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def restaurant_profile(request):
    """
    Get or update restaurant user profile (only for restaurant users)
    """
    user = request.user
    
    if user.role != 'restaurant':
        return Response({
            'error': 'Only restaurant users can access this endpoint'
        }, status=status.HTTP_403_FORBIDDEN)
    
    restaurant_profile, created = RestaurantUserProfile.objects.get_or_create(
        user=user,
        defaults={'restaurant_name': '', 'restaurant_address': ''}
    )
    
    if request.method == 'GET':
        serializer = RestaurantUserProfileSerializer(restaurant_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        serializer = RestaurantUserProfileSerializer(restaurant_profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Restaurant profile updated successfully',
                'profile': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password
    Expected fields: old_password, new_password, new_password_confirm
    """
    user = request.user
    serializer = ChangePasswordSerializer(data=request.data)
    
    if serializer.is_valid():
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']
        
        if not user.check_password(old_password):
            return Response({
                'error': 'Old password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    """
    Admin dashboard endpoint (only accessible by admins)
    """
    user = request.user
    
    if not user.is_admin:
        return Response({
            'error': 'Only admins can access this endpoint'
        }, status=status.HTTP_403_FORBIDDEN)
    
    total_users = CustomUser.objects.count()
    normal_users = CustomUser.objects.filter(role='normal').count()
    store_users = CustomUser.objects.filter(role='store').count()
    restaurant_users = CustomUser.objects.filter(role='restaurant').count()
    verified_emails = CustomUser.objects.filter(is_email_verified=True).count()
    
    return Response({
        'total_users': total_users,
        'normal_users': normal_users,
        'store_users': store_users,
        'restaurant_users': restaurant_users,
        'verified_emails': verified_emails,
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_dashboard(request):
    """
    User dashboard endpoint (accessible by all authenticated users)
    """
    user = request.user
    profile = UserProfile.objects.filter(user=user).first()
    
    return Response({
        'user': UserSerializer(user).data,
        'profile': UserProfileSerializer(profile).data if profile else None
    }, status=status.HTTP_200_OK)