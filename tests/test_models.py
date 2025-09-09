# tests/test_models.py
import pytest
import sys
import os

# Add the src directory to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

from models.user import User

class TestUser:
    def test_create_user_with_valid_data(self):
        """Test creating a user with valid data"""
        user = User(username="testuser", email="test@example.com")
        
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.is_active == True
        assert user.is_staff == False
    
    def test_create_user_default_values(self):
        """Test that default values are set correctly"""
        user = User(username="testuser", email="test@example.com")
        
        assert user.is_active == True  # Default value
        assert user.is_staff == False  # Default value
    
    def test_create_user_missing_username(self):
        """Test that creating user without username raises error"""
        with pytest.raises(ValueError, match="Username and email are required"):
            User(username="", email="test@example.com")
    
    def test_create_user_missing_email(self):
        """Test that creating user without email raises error"""
        with pytest.raises(ValueError, match="Username and email are required"):
            User(username="testuser", email="")
    
    def test_activate_user(self):
        """Test user activation"""
        user = User(username="testuser", email="test@example.com")
        user.deactivate()  # First deactivate
        user.activate()    # Then activate
        
        assert user.is_active == True
    
    def test_deactivate_user(self):
        """Test user deactivation"""
        user = User(username="testuser", email="test@example.com")
        user.deactivate()
        
        assert user.is_active == False
    
    def test_promote_to_staff(self):
        """Test promoting user to staff"""
        user = User(username="testuser", email="test@example.com")
        user.promote_to_staff()
        
        assert user.is_staff == True
    
    def test_demote_from_staff(self):
        """Test demoting user from staff"""
        user = User(username="testuser", email="test@example.com")
        user.promote_to_staff()   # First promote
        user.demote_from_staff()  # Then demote
        
        assert user.is_staff == False
    
    def test_user_string_representation(self):
        """Test string representation of user"""
        user = User(username="testuser", email="test@example.com")
        user_str = str(user)
        
        assert "testuser" in user_str
        assert "test@example.com" in user_str