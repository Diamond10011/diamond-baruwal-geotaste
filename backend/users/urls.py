from django.urls import path
from .views import (
    RegisterView, LoginView, #ForgotPasswordView, VerifyOTPView,
    #ResetPasswordView, HomeView, UserDashboardView, AdminDashboardView
)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    # path('forgot-password/', ForgotPasswordView.as_view()),
    # path('verify-otp/', VerifyOTPView.as_view()),
    # path('reset-password/', ResetPasswordView.as_view()),
    # path('home/', HomeView.as_view()),
    # path('user-dashboard/', UserDashboardView.as_view()),
    # path('admin-dashboard/', AdminDashboardView.as_view()),
]