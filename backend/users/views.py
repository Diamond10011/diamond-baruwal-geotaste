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
    RestaurantRatingSerializer, NearbyRestaurantSerializer,
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
    restaurants = RestaurantUserProfile.objects.filter(is_verified=True).prefetch_related('location')
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
@permission_classes([IsAuthenticated])
def restaurant_nearby(request):
    """Find nearby restaurants based on latitude, longitude and radius"""
    from decimal import Decimal
    import math
    
    serializer = NearbyRestaurantSerializer(data=request.data)
    if serializer.is_valid():
        lat = float(serializer.validated_data['latitude'])
        lon = float(serializer.validated_data['longitude'])
        radius = serializer.validated_data.get('radius', 10)  # km
        cuisine = serializer.validated_data.get('cuisine_type', '').strip()
        
        # Get all restaurants with locations
        restaurants = RestaurantUserProfile.objects.filter(
            is_verified=True
        ).prefetch_related('location').exclude(location__isnull=True)
        
        # Filter by radius using Haversine formula
        nearby = []
        for restaurant in restaurants:
            if not restaurant.location:
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
                if cuisine and cuisine.lower() not in restaurant.cuisine_type.lower():
                    continue
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


# ============================================================================
# STORE PRODUCT ENDPOINTS
# ============================================================================

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
            product = StoreProduct.objects.get(id=product_id)
        except StoreProduct.DoesNotExist:
            order.delete()
            return Response({'error': f'Product {product_id} not found'}, status=status.HTTP_404_NOT_FOUND)
        
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
    
    # Get user's favorite recipes
    user_favorite_recipes = Recipe.objects.filter(
        likes__user=user
    ).values_list('id', flat=True)
    
    # Get user's rated recipes
    user_rated_recipes = Recipe.objects.filter(
        ratings__user=user
    ).values_list('id', flat=True)
    
    # Combine user's interacted recipes
    user_interacted = set(user_favorite_recipes) | set(user_rated_recipes)
    
    # Base queryset excluding user's own recipes and already interacted recipes
    base_recipes = Recipe.objects.exclude(
        Q(author=user) | Q(id__in=user_interacted)
    )
    
    # Apply filters if provided
    if cuisine_filter:
        base_recipes = base_recipes.filter(cuisine_type__icontains=cuisine_filter)
    
    if difficulty_filter:
        base_recipes = base_recipes.filter(difficulty=difficulty_filter)
    
    # Calculate recommendation score: views + likes + average rating
    recommendations = base_recipes.annotate(
        likes_count=Count('likes'),
        avg_rating=Avg('ratings__rating'),
        engagement_score=Count('likes') + (Count('ratings') * 2) + (F('views_count') * 0.1)
    ).order_by('-engagement_score', '-avg_rating', '-views_count')[:limit]
    
    # Get similar recipes based on user's favorites
    if user_favorite_recipes.exists():
        favorite_recipes = Recipe.objects.filter(id__in=user_favorite_recipes)
        # Get cuisine types and difficulty levels the user likes
        favorite_cuisines = set(
            favorite_recipes.values_list('cuisine_type', flat=True)
        )
        favorite_difficulties = set(
            favorite_recipes.values_list('difficulty', flat=True)
        )
        
        # Find similar recipes
        similar_recipes = base_recipes.filter(
            Q(cuisine_type__in=favorite_cuisines) |
            Q(difficulty__in=favorite_difficulties)
        ).annotate(
            likes_count=Count('likes'),
            avg_rating=Avg('ratings__rating'),
            engagement_score=Count('likes') + (Count('ratings') * 2) + (F('views_count') * 0.1)
        ).order_by('-engagement_score', '-avg_rating')[:limit]
        
        # Combine and deduplicate
        all_recommendations = list(similar_recipes) + list(recommendations)
        seen_ids = set()
        unique_recommendations = []
        for recipe in all_recommendations:
            if recipe.id not in seen_ids:
                unique_recommendations.append(recipe)
                seen_ids.add(recipe.id)
        
        recommendations = unique_recommendations[:limit]
    
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
    from decimal import Decimal
    import math
    
    user = request.user
    limit = int(request.query_params.get('limit', 10))
    latitude = request.query_params.get('latitude')
    longitude = request.query_params.get('longitude')
    radius = float(request.query_params.get('radius', 20))
    cuisine_filter = request.query_params.get('cuisine_type', '').strip()
    
    # Get user's favorite restaurants
    user_favorite_restaurants = RestaurantUserProfile.objects.filter(
        # Assuming there's a favorite mechanism, adjust as needed
    ).values_list('id', flat=True)
    
    # Base queryset
    base_restaurants = RestaurantUserProfile.objects.filter(
        is_verified=True
    ).exclude(id__in=user_favorite_restaurants)
    
    # Apply cuisine filter if provided
    if cuisine_filter:
        base_restaurants = base_restaurants.filter(cuisine_type__icontains=cuisine_filter)
    
    # Get restaurants with location data
    restaurants_with_location = base_restaurants.prefetch_related('location').exclude(
        location__isnull=True
    )
    
    # If user location provided, filter by distance
    if latitude and longitude:
        try:
            user_lat = float(latitude)
            user_lon = float(longitude)
            
            nearby_restaurants = []
            for restaurant in restaurants_with_location:
                if not restaurant.location:
                    continue
                
                rest_lat = float(restaurant.location.latitude)
                rest_lon = float(restaurant.location.longitude)
                
                # Haversine formula for distance
                R = 6371  # Earth's radius in km
                dlat = math.radians(rest_lat - user_lat)
                dlon = math.radians(rest_lon - user_lon)
                a = math.sin(dlat/2)**2 + math.cos(math.radians(user_lat)) * math.cos(math.radians(rest_lat)) * math.sin(dlon/2)**2
                c = 2 * math.asin(math.sqrt(a))
                distance = R * c
                
                if distance <= radius:
                    nearby_restaurants.append(restaurant)
            
            restaurants_with_location = nearby_restaurants
        except (ValueError, TypeError):
            pass  # Ignore invalid coordinates
    
    # Calculate recommendation score
    recommendations = []
    for restaurant in restaurants_with_location:
        rating_count = restaurant.ratings.count()
        avg_rating = restaurant.rating_avg or 0
        
        # Score: average rating (weighted heavily) + number of ratings
        score = (avg_rating * 10) + rating_count
        
        recommendations.append({
            'restaurant': restaurant,
            'score': score
        })
    
    # Sort by score
    recommendations_sorted = sorted(recommendations, key=lambda x: x['score'], reverse=True)[:limit]
    restaurant_list = [r['restaurant'] for r in recommendations_sorted]
    
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
    
    restaurants = RestaurantUserProfile.objects.filter(is_verified=True)
    
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
    
    # Sort by rating and number of ratings
    restaurants = restaurants.order_by('-rating_avg', '-total_ratings')[:limit]
    
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
    from django.db.models import Count, Avg, F
    from datetime import timedelta
    
    user = request.user
    
    # Get user's favorite cuisines
    user_favorite_recipes = Recipe.objects.filter(likes__user=user)
    favorite_cuisines = set(
        user_favorite_recipes.filter(
            cuisine_type__isnull=False
        ).values_list('cuisine_type', flat=True)
    )
    
    # 1. Personalized recipes
    personalized_recipes = Recipe.objects.exclude(
        Q(author=user) | Q(likes__user=user)
    ).annotate(
        likes_count=Count('likes'),
        avg_rating=Avg('ratings__rating'),
        engagement_score=Count('likes') + (Count('ratings') * 2) + (F('views_count') * 0.1)
    ).order_by('-engagement_score')[:5]
    
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
    
    # 4. Popular restaurants
    popular_restaurants_list = RestaurantUserProfile.objects.filter(
        is_verified=True
    ).order_by('-rating_avg', '-total_ratings')[:5]
    
    return Response({
        'personalized_recipes': RecipeListSerializer(personalized_recipes, many=True, context={'request': request}).data,
        'popular_recipes': RecipeListSerializer(popular_recipes_list, many=True, context={'request': request}).data,
        'trending_recipes': RecipeListSerializer(trending_recipes_list, many=True, context={'request': request}).data,
        'popular_restaurants': RestaurantListSerializer(popular_restaurants_list, many=True).data,
        'user_favorite_cuisines': list(favorite_cuisines)
    }, status=status.HTTP_200_OK)
