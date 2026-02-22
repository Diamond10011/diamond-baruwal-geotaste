from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import (
    CustomUser, UserProfile, StoreUserProfile, RestaurantUserProfile, OTP,
    Recipe, RecipeRating, RecipeLike, RestaurantLocation, RestaurantMenu, RestaurantRating,
    StoreProduct, Order, OrderItem, Payment
)
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, UserProfileSerializer,
    StoreUserProfileSerializer, RestaurantUserProfileSerializer, ChangePasswordSerializer,
    ForgotPasswordSerializer, VerifyPasswordResetOTPSerializer, ResetPasswordSerializer,
    EmailVerificationSerializer, send_verification_email, send_password_reset_email,
    RecipeListSerializer, RecipeDetailSerializer, RecipeCreateUpdateSerializer,
    RecipeRatingSerializer, RecipeLikeSerializer,
    RestaurantListSerializer, RestaurantDetailSerializer, RestaurantMenuSerializer,
    RestaurantRatingSerializer, NearbyRestaurantSerializer,
    StoreProductSerializer, OrderSerializer, OrderItemSerializer, PaymentSerializer
)
from django.utils import timezone


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

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
    try:
        recipe = Recipe.objects.get(id=recipe_id)
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
    try:
        recipe = Recipe.objects.get(id=recipe_id)
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
    try:
        recipe = Recipe.objects.get(id=recipe_id)
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