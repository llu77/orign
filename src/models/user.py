# src/models/user.py
from typing import Optional

class User:
    """User model for the content management system."""
    
    def __init__(self, username: str, email: str, is_active: bool = True, is_staff: bool = False):
        """
        Initialize a new user.
        
        Args:
            username: The user's username
            email: The user's email address
            is_active: Whether the user is active (default: True)
            is_staff: Whether the user is staff (default: False)
            
        Raises:
            ValueError: If username or email is empty
        """
        if not username or not email:
            raise ValueError("Username and email are required")
            
        self.username = username
        self.email = email
        self.is_active = is_active
        self.is_staff = is_staff
    
    def activate(self) -> None:
        """Activate the user account."""
        self.is_active = True
    
    def deactivate(self) -> None:
        """Deactivate the user account."""
        self.is_active = False
    
    def promote_to_staff(self) -> None:
        """Promote the user to staff status."""
        self.is_staff = True
    
    def demote_from_staff(self) -> None:
        """Demote the user from staff status."""
        self.is_staff = False
    
    def __str__(self) -> str:
        """String representation of the user."""
        return f"User(username='{self.username}', email='{self.email}', active={self.is_active}, staff={self.is_staff})"
    
    def __repr__(self) -> str:
        """Official string representation of the user."""
        return f"User('{self.username}', '{self.email}', is_active={self.is_active}, is_staff={self.is_staff})"