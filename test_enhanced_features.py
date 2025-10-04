#!/usr/bin/env python3
"""
Test script for enhanced dating app features
"""

import sys
import os
sys.path.append('/app/backend')

from server import (
    LifestyleSliders, 
    calculate_lifestyle_compatibility, 
    check_gender_compatibility,
    GenderIdentity,
    OpenToDating,
    User
)
from datetime import date, datetime, timezone

def test_lifestyle_compatibility():
    """Test the lifestyle compatibility algorithm"""
    print("Testing Lifestyle Compatibility Algorithm...")
    
    # Create two users with similar lifestyle preferences
    user1_sliders = LifestyleSliders(
        fitness_health=4,
        career_ambition=5,
        social_energy=2,
        travel_adventure=4,
        nightlife_lifestyle=1,
        family_future=5,
        dating_approach=3,
        passions_hobbies=4
    )
    
    user2_sliders = LifestyleSliders(
        fitness_health=4,  # Same
        career_ambition=4,  # Close (diff=1)
        social_energy=3,   # Close (diff=1)
        travel_adventure=5, # Close (diff=1)
        nightlife_lifestyle=2, # Close (diff=1)
        family_future=5,   # Same
        dating_approach=2, # Close (diff=1)
        passions_hobbies=3 # Close (diff=1)
    )
    
    result = calculate_lifestyle_compatibility(user1_sliders, user2_sliders)
    print(f"Compatibility Score: {result['overall_percentage']:.1f}%")
    
    # Should be high compatibility (80%+)
    assert result['overall_percentage'] > 80, f"Expected high compatibility, got {result['overall_percentage']:.1f}%"
    print("✅ High compatibility test passed")
    
    # Test incompatible users
    user3_sliders = LifestyleSliders(
        fitness_health=1,  # Very different (diff=3)
        career_ambition=1, # Very different (diff=4)
        social_energy=5,   # Very different (diff=3)
        travel_adventure=1, # Very different (diff=3)
        nightlife_lifestyle=5, # Very different (diff=4)
        family_future=1,   # Very different (diff=4)
        dating_approach=5, # Very different (diff=2)
        passions_hobbies=1 # Very different (diff=3)
    )
    
    result2 = calculate_lifestyle_compatibility(user1_sliders, user3_sliders)
    print(f"Incompatible Score: {result2['overall_percentage']:.1f}%")
    
    # Should be low compatibility (<50%)
    assert result2['overall_percentage'] < 50, f"Expected low compatibility, got {result2['overall_percentage']:.1f}%"
    print("✅ Low compatibility test passed")

def test_gender_compatibility():
    """Test gender compatibility checking"""
    print("\nTesting Gender Compatibility...")
    
    # Create test users
    user1 = User(
        id="1",
        email="test1@example.com",
        name="Alice",
        birth_date=date(1995, 5, 15),
        zodiac_sign="taurus",
        gender_identity=GenderIdentity.WOMAN,
        open_to_dating=[OpenToDating.MEN, OpenToDating.NON_BINARY],
        created_at=datetime.now(timezone.utc)
    )
    
    user2 = User(
        id="2", 
        email="test2@example.com",
        name="Bob",
        birth_date=date(1993, 8, 22),
        zodiac_sign="leo",
        gender_identity=GenderIdentity.MAN,
        open_to_dating=[OpenToDating.WOMEN],
        created_at=datetime.now(timezone.utc)
    )
    
    # Should be compatible (woman open to men, man open to women)
    compatible = check_gender_compatibility(user1, user2)
    assert compatible, "Expected users to be compatible"
    print("✅ Compatible gender preferences test passed")
    
    # Test incompatible users
    user3 = User(
        id="3",
        email="test3@example.com", 
        name="Charlie",
        birth_date=date(1994, 3, 10),
        zodiac_sign="pisces",
        gender_identity=GenderIdentity.MAN,
        open_to_dating=[OpenToDating.MEN],  # Only interested in men
        created_at=datetime.now(timezone.utc)
    )
    
    # Should be incompatible (user1 is woman, user3 only wants men)
    incompatible = check_gender_compatibility(user1, user3)
    assert not incompatible, "Expected users to be incompatible"
    print("✅ Incompatible gender preferences test passed")

def test_enum_values():
    """Test that enum values are working correctly"""
    print("\nTesting Enum Values...")
    
    # Test GenderIdentity enum
    assert GenderIdentity.MAN == "man"
    assert GenderIdentity.WOMAN == "woman"
    assert GenderIdentity.NON_BINARY == "non_binary"
    print("✅ GenderIdentity enum test passed")
    
    # Test OpenToDating enum
    assert OpenToDating.MEN == "men"
    assert OpenToDating.WOMEN == "women"
    assert OpenToDating.ALL_GENDERS == "all_genders"
    print("✅ OpenToDating enum test passed")

def main():
    """Run all tests"""
    print("🚀 Testing Enhanced Dating App Features\n")
    
    try:
        test_enum_values()
        test_gender_compatibility()
        test_lifestyle_compatibility()
        
        print("\n🎉 All tests passed! Enhanced features are working correctly.")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()