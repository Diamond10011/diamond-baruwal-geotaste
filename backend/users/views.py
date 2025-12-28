from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import (
    RegisterSerializer, LoginSerializer, 
)
from rest_framework_simplejwt.tokens import RefreshToken

# Create your views here.
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'is_admin': user.is_admin
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'is_admin': user.is_admin
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class ForgotPasswordView(APIView):
#     def post(self, request):
#         serializer = ForgotPasswordSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({"message": "OTP sent to email"}, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class VerifyOTPView(APIView):
#     def post(self, request):
#         serializer = VerifyOTPSerializer(data=request.data)
#         if serializer.is_valid():
#             return Response({"message": "OTP verified"}, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class ResetPasswordView(APIView):
#     def post(self, request):
#         serializer = ResetPasswordSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# # Protected views for dashboards (just placeholders)
# class HomeView(APIView):
#     permission_classes = [IsAuthenticated]
#     def get(self, request):
#         return Response({"message": "Welcome to GeoTaste Home"})

# class UserDashboardView(APIView):
#     permission_classes = [IsAuthenticated]
#     def get(self, request):
#         if request.user.is_admin:
#             return Response({"error": "Admins not allowed"}, status=status.HTTP_403_FORBIDDEN)
#         return Response({"message": "User Dashboard"})

# class AdminDashboardView(APIView):
#     permission_classes = [IsAuthenticated]
#     def get(self, request):
#         if not request.user.is_admin:
#             return Response({"error": "Users not allowed"}, status=status.HTTP_403_FORBIDDEN)
#         return Response({"message": "Admin Dashboard"})