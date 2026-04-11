from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import (
    CustomUser, UserProfile, StoreUserProfile, RestaurantUserProfile, OTP,
    Recipe, RecipeRating, RecipeLike, FavoriteRecipe, RestaurantLocation, RestaurantMenu, RestaurantRating,
    StoreProduct, Order, OrderItem, Payment
)
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, UserProfileSerializer,
    StoreUserProfileSerializer, RestaurantUserProfileSerializer, ChangePasswordSerializer,
    ForgotPasswordSerializer, VerifyPasswordResetOTPSerializer, ResetPasswordSerializer,
    EmailVerificationSerializer, send_verification_email, send_password_reset_email,
    RecipeListSerializer, RecipeDetailSerializer, RecipeCreateUpdateSerializer,
    RecipeRatingSerializer, RecipeLikeSerializer, FavoriteRecipeSerializer,
    RestaurantListSerializer, RestaurantDetailSerializer, RestaurantMenuSerializer,
    RestaurantLocationSerializer, RestaurantRatingSerializer, NearbyRestaurantSerializer,
    StoreProductSerializer, OrderSerializer, OrderItemSerializer, PaymentSerializer
)
from django.utils import timezone
import uuid


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

def _parse_uuid(value):
    """Parse UUIDs coming from URL/query/body; return None when invalid."""
    try:
        return uuid.UUID(str(value))
    except (ValueError, TypeError, AttributeError):
        return None

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
            'message': 'User registered successfully. You can now login.',
            'user': UserSerializer(user).data,
            'email_verification_required': False
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
        user = serializer.validated_data.get('user')
        
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
    Logout user
    Note: JWT tokens should be discarded on the frontend
    """
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """
    Verify email using OTP
    Expected fields: email, otp_code
    """
    serializer = EmailVerificationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        otp = serializer.validated_data['otp']
        
        # Mark email as verified
        user.is_email_verified = True
        user.save()
        
        # Mark OTP as used
        otp.is_used = True
        otp.save()
        
        return Response({
            'message': 'Email verified successfully. You can now login.',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification_otp(request):
    """
    Resend email verification OTP
    Expected fields: email
    """
    email = request.data.get('email')
    
    if not email:
        return Response({
            'error': 'Email is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = CustomUser.objects.get(email=email)
        
        if user.is_email_verified:
            return Response({
                'error': 'Email is already verified'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create new OTP and invalidate old ones
        OTP.objects.filter(user=user, otp_type='email_verification', is_used=False).update(is_used=True)
        otp = OTP.objects.create(
            user=user,
            otp_type='email_verification'
        )
        send_verification_email(user.email, otp.code)
        
        return Response({
            'message': 'Verification OTP sent to your email'
        }, status=status.HTTP_200_OK)
    
    except CustomUser.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """
    Step 1: Send password reset OTP to email
    Expected fields: email
    """
    serializer = ForgotPasswordSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        user = CustomUser.objects.get(email=email)
        
        # Invalidate previous password reset OTPs
        OTP.objects.filter(user=user, otp_type='password_reset', is_used=False).update(is_used=True)
        
        # Create new OTP
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
def verify_password_reset_otp(request):
    """
    Step 2: Verify password reset OTP
    Expected fields: email, otp_code
    """
    serializer = VerifyPasswordResetOTPSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        otp = serializer.validated_data['otp']
        
        # Mark OTP as used so it can't be used again
        otp.is_used = True
        otp.save()
        
        return Response({
            'message': 'OTP verified. You can now reset your password.',
            'email': user.email,
            'can_reset_password': True
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Step 3: Reset password after OTP verification
    Expected fields: email, otp_code, new_password
    """
    serializer = ResetPasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        new_password = serializer.validated_data['new_password']
        
        # Update password
        user.set_password(new_password)
        user.save()
        
        return Response({
            'message': 'Password reset successfully. Please login with your new password.',
            'email': user.email
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# USER PROFILE ENDPOINTS
# ============================================================================

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
    
    try:
        store_profile = StoreUserProfile.objects.get(user=user)
    except StoreUserProfile.DoesNotExist:
        if request.method == 'GET':
            return Response({'error': 'Store profile not found'}, status=status.HTTP_404_NOT_FOUND)
        store_profile = None
    
    if request.method == 'GET':
        serializer = StoreUserProfileSerializer(store_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        kwargs = {'data': request.data, 'partial': True}
        if store_profile:
            serializer = StoreUserProfileSerializer(store_profile, **kwargs)
        else:
            serializer = StoreUserProfileSerializer(**kwargs)
            
        if serializer.is_valid():
            serializer.save(user=user)
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
    
    try:
        restaurant_profile = RestaurantUserProfile.objects.get(user=user)
    except RestaurantUserProfile.DoesNotExist:
        if request.method == 'GET':
            return Response({'error': 'Restaurant profile not found'}, status=status.HTTP_404_NOT_FOUND)
        restaurant_profile = None
    
    if request.method == 'GET':
        serializer = RestaurantUserProfileSerializer(restaurant_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        kwargs = {'data': request.data, 'partial': True}
        if restaurant_profile:
            serializer = RestaurantUserProfileSerializer(restaurant_profile, **kwargs)
        else:
            serializer = RestaurantUserProfileSerializer(**kwargs)
            
        if serializer.is_valid():
            serializer.save(user=user)
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
    Expected fields: old_password, new_password
    """
    user = request.user
    serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        new_password = serializer.validated_data['new_password']
        user.set_password(new_password)
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# DASHBOARD ENDPOINTS
# ============================================================================

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


# ============================================================================
# ADMIN MANAGEMENT ENDPOINTS
# ============================================================================

def _require_admin(request):
    if not request.user.is_authenticated or not request.user.is_admin:
        return Response({'error': 'Only admins can access this endpoint'}, status=status.HTTP_403_FORBIDDEN)
    return None


def _repair_bad_customuser_ids():
    """
    One-time repair for legacy/dev DBs where CustomUser.id contains non-UUID values
    (e.g. '1' from an earlier AutoField schema).

    This function rewrites bad ids to new UUIDs and updates known FK columns.
    It uses raw SQL and temporarily disables SQLite FK checks to avoid constraint issues.
    """
    import uuid as _uuid
    from django.db import connection, transaction

    def _is_uuid(value):
        try:
            _uuid.UUID(str(value))
            return True
        except Exception:
            return False

    def _table_has_col(cur, table, col):
        try:
            cur.execute(f"PRAGMA table_info({table})")
            return any(r[1] == col for r in cur.fetchall())
        except Exception:
            return False

    with connection.cursor() as cur:
        try:
            cur.execute("SELECT id FROM users_customuser")
        except Exception:
            return 0
        raw_ids = [r[0] for r in cur.fetchall()]

    bad_ids = [rid for rid in raw_ids if not _is_uuid(rid)]
    if not bad_ids:
        return 0

    # Tables/columns that reference CustomUser.id (UUID).
    # Only update if the table/column exists in this DB.
    fk_refs = [
        ("users_userprofile", "user_id"),
        ("users_storeuserprofile", "user_id"),
        ("users_restaurantuserprofile", "user_id"),
        ("users_otp", "user_id"),
        ("users_passwordresettoken", "user_id"),
        ("users_recipe", "author_id"),
        ("users_reciperating", "user_id"),
        ("users_recipelike", "user_id"),
        ("users_favoriterecipe", "user_id"),
        ("users_restaurantrating", "user_id"),
        ("users_order", "customer_id"),
        ("django_admin_log", "user_id"),
    ]

    repaired = 0
    with transaction.atomic():
        with connection.cursor() as cur:
            # Disable FK checks during repair so we can rewrite ids safely.
            cur.execute("PRAGMA foreign_keys=OFF")
            for bad_id in bad_ids:
                new_id = str(_uuid.uuid4())

                # Update parent PK first.
                cur.execute(
                    "UPDATE users_customuser SET id = %s WHERE id = %s",
                    [new_id, str(bad_id)],
                )

                # Update known FK references.
                for table, col in fk_refs:
                    if _table_has_col(cur, table, col):
                        cur.execute(
                            f"UPDATE {table} SET {col} = %s WHERE {col} = %s",
                            [new_id, str(bad_id)],
                        )

                repaired += 1

            cur.execute("PRAGMA foreign_keys=ON")

    return repaired


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_summary(request):
    """
    Admin overview summary for the whole system.
    """
    from django.db.models import Count

    denied = _require_admin(request)
    if denied:
        return denied

    users_by_role = {
        row["role"]: row["c"]
        for row in CustomUser.objects.values("role").annotate(c=Count("id"))
    }
    total_users = CustomUser.objects.count()

    total_recipes = Recipe.objects.count()
    total_restaurants = RestaurantUserProfile.objects.count()
    total_stores = StoreUserProfile.objects.count()

    pending_restaurant_verifications = RestaurantUserProfile.objects.filter(is_verified=False).count()
    pending_store_verifications = StoreUserProfile.objects.filter(is_verified=False).count()

    orders_by_status = {
        row["status"]: row["c"]
        for row in Order.objects.values("status").annotate(c=Count("id"))
    }
    total_orders = Order.objects.count()
    total_payments = Payment.objects.count()

    return Response(
        {
            "users": {
                "total": total_users,
                "by_role": users_by_role,
                "email_verified": CustomUser.objects.filter(is_email_verified=True).count(),
                "email_unverified": CustomUser.objects.filter(is_email_verified=False).count(),
                "inactive": CustomUser.objects.filter(is_active=False).count(),
            },
            "content": {
                "recipes": total_recipes,
                "restaurants": total_restaurants,
                "stores": total_stores,
            },
            "verifications": {
                "restaurants_pending": pending_restaurant_verifications,
                "stores_pending": pending_store_verifications,
            },
            "commerce": {
                "orders_total": total_orders,
                "orders_by_status": orders_by_status,
                "payments_total": total_payments,
            },
        },
        status=status.HTTP_200_OK,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users(request):
    """
    Admin: list users.
    Query params:
    - q: search by email/name
    - role: filter by role
    - verified: true/false
    - active: true/false
    - limit, offset
    """
    from django.db.models import Q

    denied = _require_admin(request)
    if denied:
        return denied

    # Auto-repair legacy/dev databases that still contain non-UUID user ids.
    _repair_bad_customuser_ids()

    q = (request.query_params.get("q") or "").strip()
    role = (request.query_params.get("role") or "").strip()
    verified = (request.query_params.get("verified") or "").strip().lower()
    active = (request.query_params.get("active") or "").strip().lower()
    limit = int(request.query_params.get("limit", 50))
    offset = int(request.query_params.get("offset", 0))

    qs = CustomUser.objects.all().select_related("profile").order_by("-created_at")
    if role:
        qs = qs.filter(role=role)
    if verified in {"true", "false"}:
        qs = qs.filter(is_email_verified=(verified == "true"))
    if active in {"true", "false"}:
        qs = qs.filter(is_active=(active == "true"))
    if q:
        qs = qs.filter(
            Q(email__icontains=q)
            | Q(profile__first_name__icontains=q)
            | Q(profile__last_name__icontains=q)
        )

    total = qs.count()
    users = qs[offset:offset + limit]
    data = []
    for u in users:
        p = getattr(u, "profile", None)
        data.append(
            {
                "id": str(u.id),
                "email": u.email,
                "role": u.role,
                "is_email_verified": u.is_email_verified,
                "is_active": u.is_active,
                "created_at": u.created_at,
                "profile": {
                    "first_name": getattr(p, "first_name", "") if p else "",
                    "last_name": getattr(p, "last_name", "") if p else "",
                    "phone_number": getattr(p, "phone_number", "") if p else "",
                    "location": getattr(p, "location", "") if p else "",
                },
            }
        )

    return Response({"count": total, "results": data, "limit": limit, "offset": offset}, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_user_detail(request, user_id):
    """
    Admin: get/update/delete a user.
    PUT accepts:
    - role, is_email_verified, is_active
    - profile: {first_name,last_name,phone_number,location,bio,dark_mode}
    """
    denied = _require_admin(request)
    if denied:
        return denied

    parsed = _parse_uuid(user_id)
    if not parsed:
        return Response({"error": "Invalid user id"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        u = CustomUser.objects.select_related("profile").get(id=parsed)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        p = getattr(u, "profile", None)
        return Response(
            {
                "id": str(u.id),
                "email": u.email,
                "role": u.role,
                "is_email_verified": u.is_email_verified,
                "is_active": u.is_active,
                "created_at": u.created_at,
                "profile": UserProfileSerializer(p).data if p else None,
            },
            status=status.HTTP_200_OK,
        )

    if request.method == "DELETE":
        # Prevent locking out the last admin.
        if u.role == "admin" and CustomUser.objects.filter(role="admin").exclude(id=u.id).count() == 0:
            return Response({"error": "Cannot delete the last admin account"}, status=status.HTTP_400_BAD_REQUEST)
        u.delete()
        return Response({"message": "User deleted"}, status=status.HTTP_200_OK)

    # PUT
    data = request.data or {}
    role = data.get("role")
    if role and role in dict(CustomUser.ROLE_CHOICES):
        u.role = role
        # Ensure role-specific profile exists if needed.
        if role == "store":
            StoreUserProfile.objects.get_or_create(user=u, defaults={"store_name": "", "store_address": ""})
        if role == "restaurant":
            RestaurantUserProfile.objects.get_or_create(user=u, defaults={"restaurant_name": "", "restaurant_address": ""})
    if "is_email_verified" in data:
        u.is_email_verified = bool(data.get("is_email_verified"))
    if "is_active" in data:
        u.is_active = bool(data.get("is_active"))
    u.save()

    profile_payload = data.get("profile") or {}
    if profile_payload:
        profile, _created = UserProfile.objects.get_or_create(user=u)
        # Update a safe subset of fields.
        for field in ["first_name", "last_name", "phone_number", "location", "bio", "dark_mode"]:
            if field in profile_payload:
                setattr(profile, field, profile_payload.get(field))
        profile.save()

    return Response({"message": "User updated"}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_user_reset_password(request, user_id):
    """
    Admin: reset a user's password.
    Body: {new_password: "..."} or omit to generate a random one.
    """
    from django.contrib.auth.password_validation import validate_password
    from django.utils.crypto import get_random_string

    denied = _require_admin(request)
    if denied:
        return denied

    parsed = _parse_uuid(user_id)
    if not parsed:
        return Response({"error": "Invalid user id"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        u = CustomUser.objects.get(id=parsed)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    new_password = (request.data or {}).get("new_password")
    if not new_password:
        # 16 chars, letters/digits
        new_password = get_random_string(16)
    else:
        try:
            validate_password(new_password, user=u)
        except Exception as exc:
            return Response({"error": "Password validation failed", "details": [str(exc)]}, status=status.HTTP_400_BAD_REQUEST)

    u.set_password(new_password)
    u.save()
    return Response({"message": "Password reset", "new_password": new_password}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_recipes(request):
    """
    Admin: list recipes.
    Query params: q, cuisine_type, difficulty, limit, offset
    """
    from django.db.models import Q, Count, Avg

    denied = _require_admin(request)
    if denied:
        return denied

    q = (request.query_params.get("q") or "").strip()
    cuisine = (request.query_params.get("cuisine_type") or "").strip()
    difficulty = (request.query_params.get("difficulty") or "").strip()
    limit = int(request.query_params.get("limit", 50))
    offset = int(request.query_params.get("offset", 0))

    qs = Recipe.objects.all().select_related("author").order_by("-created_at")
    if cuisine:
        qs = qs.filter(cuisine_type__icontains=cuisine)
    if difficulty:
        qs = qs.filter(difficulty=difficulty)
    if q:
        qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q) | Q(author__email__icontains=q))

    qs = qs.annotate(likes_count=Count("likes"), ratings_count=Count("ratings"), avg_rating=Avg("ratings__rating"))
    total = qs.count()
    rows = []
    for r in qs[offset:offset + limit]:
        rows.append(
            {
                "id": str(r.id),
                "title": r.title,
                "author_email": r.author.email,
                "cuisine_type": r.cuisine_type,
                "difficulty": r.difficulty,
                "views_count": r.views_count,
                "likes_count": getattr(r, "likes_count", 0) or 0,
                "ratings_count": getattr(r, "ratings_count", 0) or 0,
                "avg_rating": float(getattr(r, "avg_rating", 0) or 0),
                "created_at": r.created_at,
            }
        )
    return Response({"count": total, "results": rows, "limit": limit, "offset": offset}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_recipe_delete(request, recipe_id):
    denied = _require_admin(request)
    if denied:
        return denied

    parsed = _parse_uuid(recipe_id)
    if not parsed:
        return Response({"error": "Invalid recipe id"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        r = Recipe.objects.get(id=parsed)
    except Recipe.DoesNotExist:
        return Response({"error": "Recipe not found"}, status=status.HTTP_404_NOT_FOUND)

    r.delete()
    return Response({"message": "Recipe deleted"}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_restaurants(request):
    """
    Admin: list restaurant profiles.
    Query params: q, verified(true/false), limit, offset
    """
    from django.db.models import Q

    denied = _require_admin(request)
    if denied:
        return denied

    q = (request.query_params.get("q") or "").strip()
    verified = (request.query_params.get("verified") or "").strip().lower()
    limit = int(request.query_params.get("limit", 50))
    offset = int(request.query_params.get("offset", 0))

    qs = RestaurantUserProfile.objects.all().select_related("user").order_by("-created_at")
    if verified in {"true", "false"}:
        qs = qs.filter(is_verified=(verified == "true"))
    if q:
        qs = qs.filter(
            Q(restaurant_name__icontains=q)
            | Q(restaurant_address__icontains=q)
            | Q(cuisine_type__icontains=q)
            | Q(user__email__icontains=q)
        )
    total = qs.count()
    results = []
    for rp in qs[offset:offset + limit]:
        loc = getattr(rp, "location", None)
        results.append(
            {
                "id": rp.id,
                "user_id": str(rp.user_id),
                "user_email": rp.user.email,
                "restaurant_name": rp.restaurant_name,
                "restaurant_address": rp.restaurant_address,
                "restaurant_description": rp.restaurant_description,
                "cuisine_type": rp.cuisine_type,
                "is_verified": rp.is_verified,
                "location": RestaurantLocationSerializer(loc).data if loc else None,
                "created_at": rp.created_at,
            }
        )
    return Response({"count": total, "results": results, "limit": limit, "offset": offset}, status=status.HTTP_200_OK)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_restaurant_detail(request, restaurant_id):
    denied = _require_admin(request)
    if denied:
        return denied

    try:
        rp = RestaurantUserProfile.objects.select_related("user").get(id=restaurant_id)
    except RestaurantUserProfile.DoesNotExist:
        return Response({"error": "Restaurant not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        rp.delete()
        return Response({"message": "Restaurant deleted"}, status=status.HTTP_200_OK)

    serializer = RestaurantUserProfileSerializer(rp, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Restaurant updated", "restaurant": serializer.data}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stores(request):
    """
    Admin: list store profiles.
    Query params: q, verified(true/false), limit, offset
    """
    from django.db.models import Q

    denied = _require_admin(request)
    if denied:
        return denied

    q = (request.query_params.get("q") or "").strip()
    verified = (request.query_params.get("verified") or "").strip().lower()
    limit = int(request.query_params.get("limit", 50))
    offset = int(request.query_params.get("offset", 0))

    qs = StoreUserProfile.objects.all().select_related("user").order_by("-created_at")
    if verified in {"true", "false"}:
        qs = qs.filter(is_verified=(verified == "true"))
    if q:
        qs = qs.filter(
            Q(store_name__icontains=q)
            | Q(store_address__icontains=q)
            | Q(store_description__icontains=q)
            | Q(user__email__icontains=q)
        )
    total = qs.count()
    serializer = StoreUserProfileSerializer(qs[offset:offset + limit], many=True)
    return Response({"count": total, "results": serializer.data, "limit": limit, "offset": offset}, status=status.HTTP_200_OK)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_store_detail(request, store_id):
    denied = _require_admin(request)
    if denied:
        return denied

    try:
        sp = StoreUserProfile.objects.select_related("user").get(id=store_id)
    except StoreUserProfile.DoesNotExist:
        return Response({"error": "Store not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        sp.delete()
        return Response({"message": "Store deleted"}, status=status.HTTP_200_OK)

    serializer = StoreUserProfileSerializer(sp, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Store updated", "store": serializer.data}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_orders(request):
    """
    Admin: list orders.
    Query params: status, q(order_id/customer/store), limit, offset
    """
    from django.db.models import Q

    denied = _require_admin(request)
    if denied:
        return denied

    status_filter = (request.query_params.get("status") or "").strip()
    q = (request.query_params.get("q") or "").strip()
    limit = int(request.query_params.get("limit", 50))
    offset = int(request.query_params.get("offset", 0))

    qs = Order.objects.all().select_related("customer", "store").order_by("-created_at")
    if status_filter:
        qs = qs.filter(status=status_filter)
    if q:
        qs = qs.filter(
            Q(order_id__icontains=q)
            | Q(customer__email__icontains=q)
            | Q(store__store_name__icontains=q)
        )
    total = qs.count()
    results = []
    for o in qs[offset:offset + limit]:
        results.append(
            {
                "order_id": o.order_id,
                "status": o.status,
                "customer_email": o.customer.email,
                "store_id": o.store_id,
                "store_name": o.store.store_name,
                "subtotal": o.subtotal,
                "tax": o.tax,
                "total_amount": o.total_amount,
                "delivery_address": o.delivery_address,
                "created_at": o.created_at,
                "items_count": o.items.count(),
                "has_payment": hasattr(o, "payment"),
            }
        )
    return Response({"count": total, "results": results, "limit": limit, "offset": offset}, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_order_update(request, order_id):
    """
    Admin: update order status/notes.
    Body: {status, notes, delivery_address}
    """
    denied = _require_admin(request)
    if denied:
        return denied

    try:
        o = Order.objects.get(order_id=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data or {}
    if "status" in data:
        new_status = data.get("status")
        valid = {s for (s, _label) in Order.STATUS_CHOICES}
        if new_status not in valid:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        o.status = new_status
    if "notes" in data:
        o.notes = data.get("notes") or ""
    if "delivery_address" in data:
        o.delivery_address = data.get("delivery_address") or ""
    o.save()
    return Response({"message": "Order updated", "order": OrderSerializer(o).data}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_payments(request):
    """
    Admin: list payments.
    Query params: status, q(payment_id/order_id/customer/store), limit, offset
    """
    from django.db.models import Q

    denied = _require_admin(request)
    if denied:
        return denied

    status_filter = (request.query_params.get("status") or "").strip()
    q = (request.query_params.get("q") or "").strip()
    limit = int(request.query_params.get("limit", 50))
    offset = int(request.query_params.get("offset", 0))

    qs = Payment.objects.all().select_related("order", "order__customer", "order__store").order_by("-created_at")
    if status_filter:
        qs = qs.filter(status=status_filter)
    if q:
        qs = qs.filter(
            Q(payment_id__icontains=q)
            | Q(transaction_id__icontains=q)
            | Q(order__order_id__icontains=q)
            | Q(order__customer__email__icontains=q)
            | Q(order__store__store_name__icontains=q)
        )
    total = qs.count()
    results = []
    for p in qs[offset:offset + limit]:
        results.append(
            {
                "payment_id": p.payment_id,
                "status": p.status,
                "payment_method": p.payment_method,
                "amount": p.amount,
                "transaction_id": p.transaction_id,
                "order_id": p.order.order_id,
                "customer_email": p.order.customer.email,
                "store_name": p.order.store.store_name,
                "created_at": p.created_at,
            }
        )
    return Response({"count": total, "results": results, "limit": limit, "offset": offset}, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_payment_update(request, payment_id):
    """
    Admin: update payment status/notes.
    Body: {status, notes}
    """
    denied = _require_admin(request)
    if denied:
        return denied

    try:
        p = Payment.objects.get(payment_id=payment_id)
    except Payment.DoesNotExist:
        return Response({"error": "Payment not found"}, status=status.HTTP_404_NOT_FOUND)

    data = request.data or {}
    if "status" in data:
        new_status = data.get("status")
        valid = {s for (s, _label) in Payment.STATUS_CHOICES}
        if new_status not in valid:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        p.status = new_status
    if "notes" in data:
        p.notes = data.get("notes") or ""
    p.save()
    return Response({"message": "Payment updated", "payment": PaymentSerializer(p).data}, status=status.HTTP_200_OK)


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


# ============================================================================
# RECIPE ENDPOINTS
# ============================================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def recipe_list(request):
    """
    GET: Fetch all recipes (with pagination)
    POST: Create a new recipe
    """
    if request.method == 'POST':
        serializer = RecipeCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            recipe = serializer.save(author=request.user)
            return Response({
                'message': 'Recipe created successfully',
                'recipe': RecipeDetailSerializer(recipe, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # GET - List all recipes
    recipes = Recipe.objects.all()
    serializer = RecipeListSerializer(recipes, many=True, context={'request': request})
    return Response({
        'count': recipes.count(),
        'recipes': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def recipe_detail(request, recipe_id):
    """
    GET: Fetch recipe details
    PUT: Update recipe (author only)
    DELETE: Delete recipe (author only)
    """
    recipe_uuid = _parse_uuid(recipe_id)
    if not recipe_uuid:
        return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        recipe = Recipe.objects.get(id=recipe_uuid)
    except Recipe.DoesNotExist:
        return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        recipe.views_count += 1
        recipe.save()
        serializer = RecipeDetailSerializer(recipe, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # Check if user is author
    if recipe.author != request.user:
        return Response({'error': 'Only recipe author can edit'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'PUT':
        serializer = RecipeCreateUpdateSerializer(recipe, data=request.data, partial=True)
        if serializer.is_valid():
            recipe = serializer.save()
            return Response({
                'message': 'Recipe updated successfully',
                'recipe': RecipeDetailSerializer(recipe, context={'request': request}).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'DELETE':
        recipe.delete()
        return Response({'message': 'Recipe deleted successfully'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recipe_like(request, recipe_id):
    """Toggle like on a recipe"""
    recipe_uuid = _parse_uuid(recipe_id)
    if not recipe_uuid:
        return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        recipe = Recipe.objects.get(id=recipe_uuid)
    except Recipe.DoesNotExist:
        return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)
    
    like = RecipeLike.objects.filter(recipe=recipe, user=request.user).first()
    
    if like:
        like.delete()
        return Response({'message': 'Like removed', 'liked': False}, status=status.HTTP_200_OK)
    else:
        RecipeLike.objects.create(recipe=recipe, user=request.user)
        return Response({'message': 'Recipe liked', 'liked': True}, status=status.HTTP_201_CREATED)


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def recipe_rating(request, recipe_id):
    """
    GET: Get user's rating for recipe
    POST: Create or update rating
    DELETE: Delete rating
    """
    recipe_uuid = _parse_uuid(recipe_id)
    if not recipe_uuid:
        return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)

    try:
        recipe = Recipe.objects.get(id=recipe_uuid)
    except Recipe.DoesNotExist:
        return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)
    
    rating = recipe.ratings.filter(user=request.user).first()
    
    if request.method == 'GET':
        if rating:
            return Response(RecipeRatingSerializer(rating).data, status=status.HTTP_200_OK)
        return Response({'message': 'No rating found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'POST' or request.method == 'PUT':
        data = request.data
        
        if rating:
            serializer = RecipeRatingSerializer(rating, data=data, partial=True)
        else:
            serializer = RecipeRatingSerializer(data=data)
        
        if serializer.is_valid():
            if rating:
                rating = serializer.save()
            else:
                rating = serializer.save(recipe=recipe, user=request.user)
            return Response({
                'message': 'Rating saved successfully',
                'rating': RecipeRatingSerializer(rating).data
            }, status=status.HTTP_201_CREATED if not rating else status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'DELETE':
        if rating:
            rating.delete()
            return Response({'message': 'Rating deleted'}, status=status.HTTP_200_OK)
        return Response({'error': 'No rating found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_recipes(request):
    """Get current user's recipes"""
    recipes = Recipe.objects.filter(author=request.user)
    serializer = RecipeListSerializer(recipes, many=True, context={'request': request})
    return Response({
        'count': recipes.count(),
        'recipes': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_favorite_recipes(request):
    """
    GET: Get user's favorite recipes
    POST: Add recipe to favorites
    """
    if request.method == 'POST':
        recipe_id = request.data.get('recipe_id')
        recipe_uuid = _parse_uuid(recipe_id)
        if not recipe_uuid:
            return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)
        try:
            recipe = Recipe.objects.get(id=recipe_uuid)
        except Recipe.DoesNotExist:
            return Response({'error': 'Recipe not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already favorited
        favorite, created = FavoriteRecipe.objects.get_or_create(
            recipe=recipe,
            user=request.user
        )
        
        if created:
            return Response({
                'message': 'Recipe added to favorites',
                'favorite': FavoriteRecipeSerializer(favorite).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'message': 'Recipe is already in favorites',
                'favorite': FavoriteRecipeSerializer(favorite).data
            }, status=status.HTTP_200_OK)
    
    # GET - List user's favorite recipes
    favorites = FavoriteRecipe.objects.filter(user=request.user).select_related('recipe')
    serializer = FavoriteRecipeSerializer(favorites, many=True)
    return Response({
        'count': favorites.count(),
        'favorites': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_favorite_recipe(request, recipe_id):
    """Remove recipe from user's favorites"""
    try:
        recipe_uuid = _parse_uuid(recipe_id)
        if not recipe_uuid:
            return Response({'error': 'Recipe not in favorites'}, status=status.HTTP_404_NOT_FOUND)

        favorite = FavoriteRecipe.objects.get(recipe_id=recipe_uuid, user=request.user)
        favorite.delete()
        return Response({'message': 'Recipe removed from favorites'}, status=status.HTTP_200_OK)
    except FavoriteRecipe.DoesNotExist:
        return Response({'error': 'Recipe not in favorites'}, status=status.HTTP_404_NOT_FOUND)


# ============================================================================
# RESTAURANT ENDPOINTS
# ============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def restaurant_list(request):
    """Get all restaurants with locations"""
    restaurants = RestaurantUserProfile.objects.all().select_related('location')
    serializer = RestaurantListSerializer(restaurants, many=True)
    return Response({
        'count': restaurants.count(),
        'restaurants': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def restaurant_detail(request, restaurant_id):
    """Get detailed restaurant information"""
    try:
        restaurant = RestaurantUserProfile.objects.get(id=restaurant_id)
    except RestaurantUserProfile.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = RestaurantDetailSerializer(restaurant, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def restaurant_nearby(request):
    """Find nearby restaurants based on latitude, longitude and radius"""
    import math
    
    serializer = NearbyRestaurantSerializer(data=request.data)
    if serializer.is_valid():
        lat = float(serializer.validated_data['latitude'])
        lon = float(serializer.validated_data['longitude'])
        radius = serializer.validated_data.get('radius', 10)  # km
        cuisine = serializer.validated_data.get('cuisine_type', '').strip()
        
        # Get all restaurants with locations
        restaurants = RestaurantUserProfile.objects.select_related('location').exclude(
            location__isnull=True
        ).exclude(
            location__latitude__isnull=True
        ).exclude(
            location__longitude__isnull=True
        )
        
        # Filter by radius using Haversine formula
        nearby = []
        for restaurant in restaurants:
            if not restaurant.location or restaurant.location.latitude is None or restaurant.location.longitude is None:
                continue
            
            rest_lat = float(restaurant.location.latitude)
            rest_lon = float(restaurant.location.longitude)
            
            # Haversine formula
            R = 6371  # Earth's radius in km
            dlat = math.radians(rest_lat - lat)
            dlon = math.radians(rest_lon - lon)
            a = math.sin(dlat/2)**2 + math.cos(math.radians(lat)) * math.cos(math.radians(rest_lat)) * math.sin(dlon/2)**2
            c = 2 * math.asin(math.sqrt(a))
            distance = R * c
            
            if distance <= radius:
                restaurant_cuisine = (restaurant.cuisine_type or "").lower()
                if cuisine and cuisine.lower() not in restaurant_cuisine:
                    continue
                restaurant.distance_km = distance
                nearby.append(restaurant)
        
        serializer = RestaurantListSerializer(nearby, many=True)
        return Response({
            'count': len(nearby),
            'restaurants': serializer.data,
            'search_radius_km': radius
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def restaurant_menu(request, restaurant_id):
    """
    GET: Get restaurant menu
    POST: Add menu item (restaurant owner only)
    """
    try:
        restaurant = RestaurantUserProfile.objects.get(id=restaurant_id)
    except RestaurantUserProfile.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        menu_items = restaurant.menu_items.all()
        serializer = RestaurantMenuSerializer(menu_items, many=True)
        return Response({
            'restaurant': restaurant.restaurant_name,
            'count': menu_items.count(),
            'menu': serializer.data
        }, status=status.HTTP_200_OK)
    
    # POST - Add menu item (restaurant owner only)
    if restaurant.user != request.user:
        return Response({'error': 'Only restaurant owner can add menu'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = RestaurantMenuSerializer(data=request.data)
    if serializer.is_valid():
        menu_item = serializer.save(restaurant=restaurant)
        return Response({
            'message': 'Menu item added successfully',
            'menu_item': RestaurantMenuSerializer(menu_item).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def restaurant_rating(request, restaurant_id):
    """Rate restaurant"""
    try:
        restaurant = RestaurantUserProfile.objects.get(id=restaurant_id)
    except RestaurantUserProfile.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=status.HTTP_404_NOT_FOUND)
    
    rating = restaurant.ratings.filter(user=request.user).first()
    
    if request.method == 'GET':
        if rating:
            return Response(RestaurantRatingSerializer(rating).data, status=status.HTTP_200_OK)
        return Response({'message': 'No rating found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'POST' or request.method == 'PUT':
        data = request.data
        if rating:
            serializer = RestaurantRatingSerializer(rating, data=data, partial=True)
        else:
            serializer = RestaurantRatingSerializer(data=data)
        
        if serializer.is_valid():
            if rating:
                rating = serializer.save()
            else:
                rating = serializer.save(restaurant=restaurant, user=request.user)
            return Response({
                'message': 'Rating saved',
                'rating': RestaurantRatingSerializer(rating).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.method == 'DELETE':
        if rating:
            rating.delete()
            return Response({'message': 'Rating deleted'}, status=status.HTTP_200_OK)
        return Response({'error': 'No rating found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def restaurant_location(request):
    """
    GET: Get restaurant location for current user
    POST: Create restaurant location for current user
    PUT: Update restaurant location for current user
    """
    user = request.user
    
    if user.role != 'restaurant':
        return Response({
            'error': 'Only restaurant users can access this endpoint'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Get or create restaurant profile
    try:
        restaurant_profile = RestaurantUserProfile.objects.get(user=user)
    except RestaurantUserProfile.DoesNotExist:
        return Response({
            'error': 'Restaurant profile not found. Please create a restaurant profile first.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    location, created = RestaurantLocation.objects.get_or_create(
        restaurant=restaurant_profile,
        defaults={
            'latitude': None,
            'longitude': None,
            'city': '',
            'country': '',
            'phone_number': '',
            'website': '',
        }
    )
    
    if request.method == 'GET':
        serializer = RestaurantLocationSerializer(location)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST' or request.method == 'PUT':
        # Normalize lat/lon to match DecimalField(max_digits=9, decimal_places=6).
        # Browsers often provide many decimal places; DRF will reject that unless we round first.
        from decimal import Decimal, ROUND_HALF_UP

        data = request.data.copy() if hasattr(request.data, "copy") else dict(request.data)
        for key in ("latitude", "longitude"):
            value = data.get(key, None)
            if value in (None, ""):
                continue
            try:
                dec = Decimal(str(value)).quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP)
                data[key] = str(dec)
            except Exception:
                # Let the serializer raise a helpful validation error if it's still invalid.
                pass

        serializer = RestaurantLocationSerializer(location, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Restaurant location updated successfully',
                'location': serializer.data
            }, status=status.HTTP_200_OK)
        # Return detailed error messages
        return Response({
            'error': 'Validation failed',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# STORE PRODUCT ENDPOINTS
# ============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def store_list(request):
    """Public list of stores (profiles)."""
    stores = StoreUserProfile.objects.all().order_by("-created_at")
    serializer = StoreUserProfileSerializer(stores, many=True)
    return Response(
        {
            "count": stores.count(),
            "stores": serializer.data,
        },
        status=status.HTTP_200_OK,
    )

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def store_products(request):
    """
    GET: Get all store products or filter by store
    POST: Add new store product (store owner only)
    """
    if request.method == 'GET':
        store_id = request.query_params.get('store_id')
        if store_id:
            try:
                store = StoreUserProfile.objects.get(id=store_id)
                products = store.products.all()
                # For non-owners, only expose products the store has made available.
                if request.user.role != 'store' or store.user_id != request.user.id:
                    products = products.filter(is_available=True)
            except StoreUserProfile.DoesNotExist:
                return Response({'error': 'Store not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # Get products from user's own store
            if request.user.role != 'store':
                return Response({'error': 'Only store users can access this'}, status=status.HTTP_403_FORBIDDEN)
            try:
                store = StoreUserProfile.objects.get(user=request.user)
                products = store.products.all()
            except StoreUserProfile.DoesNotExist:
                return Response({'error': 'Store profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = StoreProductSerializer(products, many=True)
        return Response({
            'count': products.count(),
            'products': serializer.data
        }, status=status.HTTP_200_OK)
    
    # POST - Add product (store owner only)
    if request.user.role != 'store':
        return Response({'error': 'Only store users can add products'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        store = StoreUserProfile.objects.get(user=request.user)
    except StoreUserProfile.DoesNotExist:
        return Response({'error': 'Store profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = StoreProductSerializer(data=request.data)
    if serializer.is_valid():
        product = serializer.save(store=store)
        return Response({
            'message': 'Product added successfully',
            'product': StoreProductSerializer(product).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def store_product_detail(request, product_id):
    """
    Get, update, or delete a store product
    """
    try:
        product = StoreProduct.objects.get(id=product_id)
    except StoreProduct.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user owns this store
    if request.method in ['PUT', 'DELETE']:
        if product.store.user != request.user:
            return Response({'error': 'You can only modify your own products'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        serializer = StoreProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        serializer = StoreProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Product updated successfully',
                'product': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        product.delete()
        return Response({'message': 'Product deleted successfully'}, status=status.HTTP_200_OK)


# ============================================================================
# ORDER ENDPOINTS
# ============================================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def orders(request):
    """
    GET: Get user's orders
    POST: Create a new order
    """
    if request.method == 'GET':
        if request.user.role == 'store':
            user_orders = Order.objects.filter(store__user=request.user).order_by('-created_at')
        else:
            user_orders = Order.objects.filter(customer=request.user).order_by('-created_at')
        serializer = OrderSerializer(user_orders, many=True)
        return Response({
            'count': user_orders.count(),
            'orders': serializer.data
        }, status=status.HTTP_200_OK)
    
    # POST - Create order
    data = request.data
    
    # Get or create store
    store_id = data.get('store_id')
    if not store_id:
        return Response({'error': 'store_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        store = StoreUserProfile.objects.get(id=store_id)
    except StoreUserProfile.DoesNotExist:
        return Response({'error': 'Store not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Create order
    import uuid
    order = Order.objects.create(
        order_id=str(uuid.uuid4()),
        customer=request.user,
        store=store,
        delivery_address=data.get('delivery_address', ''),
        notes=data.get('notes', '')
    )
    
    # Add order items
    items_data = data.get('items', [])
    subtotal = 0
    
    for item in items_data:
        product_id = item.get('product_id')
        quantity = item.get('quantity', 1)
        
        try:
            # Ensure items belong to the selected store.
            product = StoreProduct.objects.get(id=product_id, store=store)
        except StoreProduct.DoesNotExist:
            order.delete()
            return Response({'error': f'Product {product_id} not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if not product.is_available:
            order.delete()
            return Response({'error': f'{product.name} is not available'}, status=status.HTTP_400_BAD_REQUEST)

        if product.stock < quantity:
            order.delete()
            return Response({'error': f'{product.name} has insufficient stock'}, status=status.HTTP_400_BAD_REQUEST)
        
        item_subtotal = float(product.price) * quantity
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=quantity,
            price=product.price,
            subtotal=item_subtotal
        )
        # Reduce stock so future buyers see accurate availability.
        product.stock = product.stock - int(quantity)
        product.save(update_fields=['stock'])
        subtotal += item_subtotal
    
    # Calculate tax and total
    tax = round(subtotal * 0.1, 2)  # 10% tax
    total = subtotal + tax
    
    # Update order totals
    order.subtotal = subtotal
    order.tax = tax
    order.total_amount = total
    order.status = 'payment_pending'
    order.save()
    
    return Response({
        'message': 'Order created successfully',
        'order': OrderSerializer(order).data
    }, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def order_detail(request, order_id):
    """
    Get or update an order
    """
    try:
        order = Order.objects.get(order_id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user owns this order
    if order.customer != request.user and order.store.user != request.user:
        return Response({'error': 'You cannot access this order'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PUT':
        # Only allow updating delivery address and notes
        order.delivery_address = request.data.get('delivery_address', order.delivery_address)
        order.notes = request.data.get('notes', order.notes)
        order.save()
        
        return Response({
            'message': 'Order updated successfully',
            'order': OrderSerializer(order).data
        }, status=status.HTTP_200_OK)


# ============================================================================
# PAYMENT ENDPOINTS
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_payment(request):
    """
    Process payment for an order (demo payment)
    """
    data = request.data
    order_id = data.get('order_id')
    payment_method = data.get('payment_method', 'demo')
    
    if not order_id:
        return Response({'error': 'order_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        order = Order.objects.get(order_id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user owns this order
    if order.customer != request.user:
        return Response({'error': 'You can only pay for your own orders'}, status=status.HTTP_403_FORBIDDEN)
    
    # Check if payment already exists
    if hasattr(order, 'payment'):
        return Response({
            'error': 'Payment already processed for this order',
            'payment': PaymentSerializer(order.payment).data
        }, status=status.HTTP_400_BAD_REQUEST)
    
    import uuid
    # Create payment record
    payment = Payment.objects.create(
        payment_id=str(uuid.uuid4()),
        order=order,
        amount=order.total_amount,
        payment_method=payment_method,
        status='pending'
    )
    
    # Demo payment - automatically mark as completed
    payment.status = 'completed'
    payment.transaction_id = f'DEMO-{str(uuid.uuid4())[:8].upper()}'
    payment.save()
    
    # Update order status
    order.status = 'paid'
    order.save()
    
    return Response({
        'message': 'Payment processed successfully (Demo)',
        'payment': PaymentSerializer(payment).data,
        'order': OrderSerializer(order).data
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_detail(request, payment_id):
    """
    Get payment details
    """
    try:
        payment = Payment.objects.get(payment_id=payment_id)
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user owns this payment
    if payment.order.customer != request.user and payment.order.store.user != request.user:
        return Response({'error': 'You cannot access this payment'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = PaymentSerializer(payment)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ============================================================================
# RECOMMENDATION ENGINE ENDPOINTS
# ============================================================================

import re

def _tokenize_list_field(value):
    """
    Normalize free-form ingredients/tags fields into a token set.
    Supports newline/comma separated text; ignores empty tokens.
    """
    if not value:
        return set()
    # Split on commas/newlines/semicolons, then keep simple word-like tokens.
    parts = re.split(r"[\n,;]+", str(value))
    tokens = set()
    for part in parts:
        token = part.strip().lower()
        if not token:
            continue
        tokens.add(token)
    return tokens

def _get_user_recipe_prefs(user):
    """
    Build preference signals from existing interactions:
    - likes (RecipeLike)
    - favorites (FavoriteRecipe)
    - ratings (RecipeRating)
    """
    from django.db.models import Q

    favorite_ids = FavoriteRecipe.objects.filter(user=user).values_list("recipe_id", flat=True)
    liked_ids = RecipeLike.objects.filter(user=user).values_list("recipe_id", flat=True)
    rated_ids = RecipeRating.objects.filter(user=user).values_list("recipe_id", flat=True)

    interacted_ids = set(favorite_ids) | set(liked_ids) | set(rated_ids)
    if not interacted_ids:
        return {
            "interacted_ids": set(),
            "cuisines": set(),
            "difficulties": set(),
            "dietary_tags": set(),
            "ingredients": set(),
        }

    interacted_recipes = Recipe.objects.filter(id__in=interacted_ids).only(
        "cuisine_type",
        "difficulty",
        "dietary_tags",
        "ingredients",
    )

    cuisines = set()
    difficulties = set()
    dietary_tags = set()
    ingredients = set()

    for recipe in interacted_recipes:
        if recipe.cuisine_type:
            cuisines.add(recipe.cuisine_type.strip().lower())
        if recipe.difficulty:
            difficulties.add(recipe.difficulty.strip().lower())
        dietary_tags |= _tokenize_list_field(recipe.dietary_tags)
        ingredients |= _tokenize_list_field(recipe.ingredients)

    return {
        "interacted_ids": interacted_ids,
        "cuisines": cuisines,
        "difficulties": difficulties,
        "dietary_tags": dietary_tags,
        "ingredients": ingredients,
    }

def _score_recipe_for_user(recipe, prefs):
    """
    Lightweight scoring function combining similarity + popularity.
    """
    score = 0.0

    cuisine = (recipe.cuisine_type or "").strip().lower()
    if cuisine and cuisine in prefs["cuisines"]:
        score += 7.0

    difficulty = (recipe.difficulty or "").strip().lower()
    if difficulty and difficulty in prefs["difficulties"]:
        score += 2.0

    tag_overlap = len(_tokenize_list_field(recipe.dietary_tags) & prefs["dietary_tags"])
    score += min(tag_overlap, 5) * 1.5

    ingredient_overlap = len(_tokenize_list_field(recipe.ingredients) & prefs["ingredients"])
    score += min(ingredient_overlap, 8) * 1.0

    # Popularity / quality
    likes_count = getattr(recipe, "likes_count", 0) or 0
    ratings_count = getattr(recipe, "ratings_count", 0) or 0
    avg_rating = getattr(recipe, "avg_rating", 0) or 0
    views = getattr(recipe, "views_count", 0) or 0

    score += (likes_count * 0.5) + (ratings_count * 0.25) + (float(avg_rating) * 1.5) + (views * 0.01)
    return score

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommend_recipes(request):
    """
    Get recipe recommendations for the current user based on:
    - User's favorite recipes
    - User's ratings and interactions
    - Similar recipes (cuisine, difficulty, prep time)
    - Popular recipes (views, likes, ratings)
    
    Query parameters:
    - limit: number of recommendations (default: 10)
    - cuisine_type: filter by cuisine
    - difficulty: filter by difficulty level
    """
    from django.db.models import Q, F, Count, Avg
    
    user = request.user
    limit = int(request.query_params.get('limit', 10))
    cuisine_filter = request.query_params.get('cuisine_type', '').strip()
    difficulty_filter = request.query_params.get('difficulty', '').strip()

    prefs = _get_user_recipe_prefs(user)

    # Prefer "new to you" recipes, but fall back if dataset is small.
    base_qs_new = Recipe.objects.exclude(Q(author=user) | Q(id__in=prefs["interacted_ids"]))
    base_qs_warm = Recipe.objects.exclude(Q(author=user))

    if cuisine_filter:
        base_qs_new = base_qs_new.filter(cuisine_type__icontains=cuisine_filter)
        base_qs_warm = base_qs_warm.filter(cuisine_type__icontains=cuisine_filter)
    if difficulty_filter:
        base_qs_new = base_qs_new.filter(difficulty=difficulty_filter)
        base_qs_warm = base_qs_warm.filter(difficulty=difficulty_filter)

    # Pull candidates, then score with similarity signals.
    # Start with new recipes; if too few, include already-interacted recipes (still excluding own).
    qs = base_qs_new
    if qs.count() < max(1, min(limit, 10)):
        qs = base_qs_warm
    # Final fallback: if user only has their own recipes, still recommend something.
    if qs.count() == 0:
        qs = Recipe.objects.all()

    candidates = list(
        qs.annotate(
            likes_count=Count("likes"),
            ratings_count=Count("ratings"),
            avg_rating=Avg("ratings__rating"),
        ).order_by("-views_count")[:300]
    )

    # If user has no interactions yet, fall back to popular-ish ordering.
    if not prefs["interacted_ids"]:
        recommendations = candidates[:limit]
    else:
        scored = [(r, _score_recipe_for_user(r, prefs)) for r in candidates]
        scored.sort(key=lambda x: x[1], reverse=True)
        recommendations = [r for (r, _s) in scored[:limit]]
    
    serializer = RecipeListSerializer(recommendations, many=True, context={'request': request})
    return Response({
        'count': len(recommendations),
        'recommendations': serializer.data,
        'recommendation_type': 'personalized'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def popular_recipes(request):
    """
    Get popular recipes based on:
    - Number of views
    - Number of likes
    - Average rating
    - Number of ratings
    
    Query parameters:
    - limit: number of recipes (default: 10)
    - time_period: 'all', 'month', 'week', 'day' (default: 'all')
    """
    from django.db.models import Count, Avg
    from datetime import timedelta
    
    limit = int(request.query_params.get('limit', 10))
    time_period = request.query_params.get('time_period', 'all').lower()
    
    recipes = Recipe.objects.all()
    
    # Filter by time period
    if time_period == 'day':
        cutoff_date = timezone.now() - timedelta(days=1)
        recipes = recipes.filter(created_at__gte=cutoff_date)
    elif time_period == 'week':
        cutoff_date = timezone.now() - timedelta(weeks=1)
        recipes = recipes.filter(created_at__gte=cutoff_date)
    elif time_period == 'month':
        cutoff_date = timezone.now() - timedelta(days=30)
        recipes = recipes.filter(created_at__gte=cutoff_date)
    
    # Calculate popularity score
    recipes = recipes.annotate(
        likes_count=Count('likes'),
        ratings_count=Count('ratings'),
        avg_rating=Avg('ratings__rating')
    ).annotate(
        popularity_score=F('views_count') + (F('likes_count') * 5) + (F('ratings_count') * 3)
    ).order_by('-popularity_score', '-avg_rating', '-views_count')[:limit]
    
    serializer = RecipeListSerializer(recipes, many=True, context={'request': request})
    return Response({
        'count': len(recipes),
        'recipes': serializer.data,
        'time_period': time_period
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommend_restaurants(request):
    """
    Get restaurant recommendations for the current user based on:
    - User's favorite restaurants
    - Restaurant ratings and reviews
    - User's location (if provided)
    - Cuisine preferences
    
    Query parameters:
    - limit: number of recommendations (default: 10)
    - latitude: user's latitude
    - longitude: user's longitude
    - radius: search radius in km (default: 20)
    - cuisine_type: filter by cuisine
    """
    from django.db.models import Q, Count, Avg
    import math
    
    user = request.user
    limit = int(request.query_params.get('limit', 10))
    latitude = request.query_params.get('latitude')
    longitude = request.query_params.get('longitude')
    radius = float(request.query_params.get('radius', 20))
    cuisine_filter = request.query_params.get('cuisine_type', '').strip()

    prefs = _get_user_recipe_prefs(user)

    verified_qs = RestaurantUserProfile.objects.filter(is_verified=True)
    base_profiles = verified_qs if verified_qs.exists() else RestaurantUserProfile.objects.all()
    base_qs = base_profiles.prefetch_related("location")
    if cuisine_filter:
        base_qs = base_qs.filter(cuisine_type__icontains=cuisine_filter)

    # Annotate rating signals once (avoid N+1).
    base_qs = base_qs.annotate(
        avg_rating=Avg("ratings__rating"),
        ratings_count=Count("ratings"),
    )

    user_lat = user_lon = None
    if latitude and longitude:
        try:
            user_lat = float(latitude)
            user_lon = float(longitude)
        except (ValueError, TypeError):
            user_lat = user_lon = None

    candidates = []
    for restaurant in base_qs[:300]:
        loc = getattr(restaurant, "location", None)
        has_coords = bool(loc and loc.latitude is not None and loc.longitude is not None)

        distance_km = None
        if user_lat is not None and user_lon is not None:
            # "Near you" mode: only include restaurants that have coordinates.
            if not has_coords:
                continue

            rest_lat = float(loc.latitude)
            rest_lon = float(loc.longitude)
            R = 6371
            dlat = math.radians(rest_lat - user_lat)
            dlon = math.radians(rest_lon - user_lon)
            a = (
                math.sin(dlat / 2) ** 2
                + math.cos(math.radians(user_lat))
                * math.cos(math.radians(rest_lat))
                * math.sin(dlon / 2) ** 2
            )
            c = 2 * math.asin(math.sqrt(a))
            distance_km = R * c
            if distance_km > radius:
                continue

        cuisine = (restaurant.cuisine_type or "").strip().lower()
        cuisine_bonus = 5.0 if cuisine and any(pref in cuisine for pref in prefs["cuisines"]) else 0.0

        avg_rating = float(getattr(restaurant, "avg_rating", 0) or 0)
        ratings_count = int(getattr(restaurant, "ratings_count", 0) or 0)

        proximity_bonus = 0.0
        if distance_km is not None and radius > 0:
            proximity_bonus = max(0.0, (radius - distance_km) / radius) * 5.0

        score = cuisine_bonus + (avg_rating * 10.0) + (ratings_count * 0.25) + proximity_bonus
        candidates.append((restaurant, score))

    # If user shared location but we have zero restaurants with coords, fall back to non-location ranking.
    if user_lat is not None and user_lon is not None and not candidates:
        for restaurant in base_qs[:300]:
            cuisine = (restaurant.cuisine_type or "").strip().lower()
            cuisine_bonus = 5.0 if cuisine and any(pref in cuisine for pref in prefs["cuisines"]) else 0.0
            avg_rating = float(getattr(restaurant, "avg_rating", 0) or 0)
            ratings_count = int(getattr(restaurant, "ratings_count", 0) or 0)
            score = cuisine_bonus + (avg_rating * 10.0) + (ratings_count * 0.25)
            candidates.append((restaurant, score))

    candidates.sort(key=lambda x: x[1], reverse=True)
    restaurant_list = [r for (r, _s) in candidates[:limit]]
    
    serializer = RestaurantListSerializer(restaurant_list, many=True)
    return Response({
        'count': len(restaurant_list),
        'restaurants': serializer.data,
        'recommendation_type': 'personalized'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def popular_restaurants(request):
    """
    Get popular restaurants based on:
    - Average rating
    - Number of ratings
    - Time period
    
    Query parameters:
    - limit: number of restaurants (default: 10)
    - time_period: 'all', 'month', 'week', 'day' (default: 'all')
    """
    from datetime import timedelta
    
    limit = int(request.query_params.get('limit', 10))
    time_period = request.query_params.get('time_period', 'all').lower()
    
    verified_qs = RestaurantUserProfile.objects.filter(is_verified=True)
    restaurants = verified_qs if verified_qs.exists() else RestaurantUserProfile.objects.all()
    
    # Filter by time period
    if time_period == 'day':
        cutoff_date = timezone.now() - timedelta(days=1)
        restaurants = restaurants.filter(created_at__gte=cutoff_date)
    elif time_period == 'week':
        cutoff_date = timezone.now() - timedelta(weeks=1)
        restaurants = restaurants.filter(created_at__gte=cutoff_date)
    elif time_period == 'month':
        cutoff_date = timezone.now() - timedelta(days=30)
        restaurants = restaurants.filter(created_at__gte=cutoff_date)
    
    # Sort by rating and number of ratings (computed from RestaurantRating)
    restaurants = restaurants.annotate(
        avg_rating=Avg("ratings__rating"),
        ratings_count=Count("ratings"),
    ).order_by("-avg_rating", "-ratings_count", "-created_at")[:limit]
    
    serializer = RestaurantListSerializer(restaurants, many=True)
    return Response({
        'count': len(restaurants),
        'restaurants': serializer.data,
        'time_period': time_period
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trending_recipes(request):
    """
    Get trending recipes based on:
    - Recent creation date
    - High engagement (views, likes, ratings)
    
    Query parameters:
    - limit: number of recipes (default: 10)
    - time_period: 'day', 'week', 'month' (default: 'week')
    """
    from django.db.models import Count, Avg, F
    from datetime import timedelta
    
    limit = int(request.query_params.get('limit', 10))
    time_period = request.query_params.get('time_period', 'week').lower()
    
    # Get cutoff date
    if time_period == 'day':
        cutoff_date = timezone.now() - timedelta(days=1)
    elif time_period == 'month':
        cutoff_date = timezone.now() - timedelta(days=30)
    else:  # week
        cutoff_date = timezone.now() - timedelta(weeks=1)
    
    recipes = Recipe.objects.filter(
        created_at__gte=cutoff_date
    ).exclude(author=request.user).annotate(
        likes_count=Count('likes'),
        ratings_count=Count('ratings'),
        avg_rating=Avg('ratings__rating')
    ).annotate(
        trending_score=F('views_count') + (F('likes_count') * 3) + (F('ratings_count') * 2)
    ).order_by('-trending_score', '-avg_rating')[:limit]
    
    serializer = RecipeListSerializer(recipes, many=True, context={'request': request})
    return Response({
        'count': len(recipes),
        'recipes': serializer.data,
        'time_period': time_period
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_recommendations_summary(request):
    """
    Get a comprehensive recommendations summary for the user including:
    - Personalized recipe recommendations
    - Personalized restaurant recommendations
    - Trending recipes
    - Popular recipes
    - Trending restaurants
    """
    from django.db.models import Count, Avg, F, Q
    from datetime import timedelta
    from django.db.models import Avg, Count
    
    user = request.user
    
    # Get user's favorite cuisines
    user_favorite_recipes = Recipe.objects.filter(
        Q(likes__user=user) | Q(favorited_by__user=user) | Q(ratings__user=user)
    ).distinct()
    favorite_cuisines = set(
        user_favorite_recipes.filter(
            cuisine_type__isnull=False
        ).values_list('cuisine_type', flat=True)
    )
    
    # 1. Personalized recipes
    prefs = _get_user_recipe_prefs(user)
    base_qs_new = Recipe.objects.exclude(Q(author=user) | Q(id__in=prefs["interacted_ids"]))
    base_qs_warm = Recipe.objects.exclude(Q(author=user))
    if base_qs_new.count() > 0:
        base_qs = base_qs_new
    elif base_qs_warm.count() > 0:
        base_qs = base_qs_warm
    else:
        base_qs = Recipe.objects.all()
    personalized_candidates = list(
        base_qs.annotate(
            likes_count=Count("likes"),
            ratings_count=Count("ratings"),
            avg_rating=Avg("ratings__rating"),
        ).order_by("-views_count")[:200]
    )
    if prefs["interacted_ids"]:
        scored = [(r, _score_recipe_for_user(r, prefs)) for r in personalized_candidates]
        scored.sort(key=lambda x: x[1], reverse=True)
        personalized_recipes = [r for (r, _s) in scored[:5]]
    else:
        personalized_recipes = personalized_candidates[:5]
    
    # 2. Popular recipes (all time)
    popular_recipes_list = Recipe.objects.all().annotate(
        likes_count=Count('likes'),
        ratings_count=Count('ratings'),
        avg_rating=Avg('ratings__rating')
    ).order_by('-views_count', '-avg_rating')[:5]
    
    # 3. Trending recipes (this week)
    week_ago = timezone.now() - timedelta(weeks=1)
    trending_recipes_list = Recipe.objects.filter(
        created_at__gte=week_ago
    ).annotate(
        likes_count=Count('likes'),
        ratings_count=Count('ratings')
    ).annotate(
        trending_score=F('views_count') + (F('likes_count') * 3) + (F('ratings_count') * 2)
    ).order_by('-trending_score')[:5]
    
    # 4. Popular restaurants (fallback to all if none verified)
    verified_restaurants = RestaurantUserProfile.objects.filter(is_verified=True)
    restaurants_base = verified_restaurants if verified_restaurants.exists() else RestaurantUserProfile.objects.all()
    popular_restaurants_list = restaurants_base.annotate(
        avg_rating=Avg("ratings__rating"),
        ratings_count=Count("ratings"),
    ).order_by("-avg_rating", "-ratings_count", "-created_at")[:5]

    # 5. Personalized restaurants (no user location here; cuisine-preference + ratings)
    user_cuisines = {c.strip().lower() for c in favorite_cuisines if c}
    restaurant_candidates = list(
        restaurants_base.annotate(
            avg_rating=Avg("ratings__rating"),
            ratings_count=Count("ratings"),
        )[:200]
    )
    personalized_restaurants_scored = []
    for r in restaurant_candidates:
        cuisine = (r.cuisine_type or "").strip().lower()
        cuisine_bonus = 5.0 if cuisine and any(pref in cuisine for pref in user_cuisines) else 0.0
        avg_rating = float(getattr(r, "avg_rating", 0) or 0)
        ratings_count = int(getattr(r, "ratings_count", 0) or 0)
        score = cuisine_bonus + (avg_rating * 10.0) + (ratings_count * 0.25)
        personalized_restaurants_scored.append((r, score))
    personalized_restaurants_scored.sort(key=lambda x: x[1], reverse=True)
    personalized_restaurants = [r for (r, _s) in personalized_restaurants_scored[:5]]
    
    return Response({
        'personalized_recipes': RecipeListSerializer(personalized_recipes, many=True, context={'request': request}).data,
        'popular_recipes': RecipeListSerializer(popular_recipes_list, many=True, context={'request': request}).data,
        'trending_recipes': RecipeListSerializer(trending_recipes_list, many=True, context={'request': request}).data,
        'personalized_restaurants': RestaurantListSerializer(personalized_restaurants, many=True).data,
        'popular_restaurants': RestaurantListSerializer(popular_restaurants_list, many=True).data,
        'user_favorite_cuisines': list(favorite_cuisines)
    }, status=status.HTTP_200_OK)
