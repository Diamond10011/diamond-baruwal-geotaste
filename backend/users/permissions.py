from rest_framework.permissions import BasePermission


class IsVerifiedAccount(BasePermission):
    """
    Allow access when:
    - user is admin, or
    - user is verified.

    Store/Restaurant users must be verified before accessing protected features.
    """

    message = "Access denied: verification required."

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return False
        if getattr(user, "role", None) == "admin":
            return True
        return getattr(user, "verification_status", "verified") == "verified"

