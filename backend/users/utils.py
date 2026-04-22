import uuid
from rest_framework import status
from rest_framework.response import Response

def _parse_uuid(value):
    """Parse UUIDs coming from URL/query/body; return None when invalid."""
    try:
        return uuid.UUID(str(value))
    except (ValueError, TypeError, AttributeError):
        return None

def _require_admin(request):
    """Check if the user is an authenticated admin."""
    if not request.user.is_authenticated or not getattr(request.user, 'role', None) == 'admin':
        return Response({'error': 'Only admins can access this endpoint'}, status=status.HTTP_403_FORBIDDEN)
    return None

def _require_verified_for_role(request, roles):
    """
    For users whose `role` is in `roles`, require `verification_status == 'verified'`.
    Admins always pass.
    """
    user = request.user
    if getattr(user, "role", None) == "admin":
        return None
    if getattr(user, "role", None) in set(roles) and getattr(user, "verification_status", "verified") != "verified":
        return Response(
            {
                "error": "Access denied: verification required",
                "verification_status": getattr(user, "verification_status", None),
            },
            status=status.HTTP_403_FORBIDDEN,
        )
    return None
