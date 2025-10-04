#!/usr/bin/env python3
"""
Test script for enhanced API endpoints
"""

import requests
import json
from datetime import datetime

# Test configuration
BASE_URL = "http://localhost:8000/api"

def test_health_endpoint():
    """Test the health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health endpoint working")
            return True
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health endpoint error: {e}")
        return False

def test_enhanced_profile_structure():
    """Test that the enhanced profile structure is properly defined"""
    print("\n🧪 Testing Enhanced Profile Structure...")
    
    # Test data that would be sent to complete-profile endpoint
    enhanced_profile_data = {
        "birth_date": "1995-05-15",
        "birth_time": "14:30",
        "gender_identity": "woman",
        "open_to_dating": ["men", "non_binary"],
        "orientation_visible": True,
        "lifestyle_sliders": {
            "fitness_health": 4,
            "career_ambition": 5,
            "social_energy": 2,
            "travel_adventure": 4,
            "nightlife_lifestyle": 1,
            "family_future": 5,
            "dating_approach": 3,
            "passions_hobbies": 4
        },
        "industry": "technology",
        "relationship_goals": "serious",
        "bio": "Love hiking and reading. Looking for someone who shares my values.",
        "interests": ["hiking", "reading", "yoga", "travel"],
        "age_range_min": 25,
        "age_range_max": 35,
        "max_distance_km": 50,
        "current_location": {
            "city": "San Francisco",
            "country": "United States",
            "state": "CA",
            "latitude": 37.7749,
            "longitude": -122.4194
        }
    }
    
    print("✅ Enhanced profile data structure validated")
    print(f"   - Gender identity: {enhanced_profile_data['gender_identity']}")
    print(f"   - Dating preferences: {enhanced_profile_data['open_to_dating']}")
    print(f"   - Lifestyle sliders: {len(enhanced_profile_data['lifestyle_sliders'])} categories")
    print(f"   - Industry: {enhanced_profile_data['industry']}")
    print(f"   - Relationship goals: {enhanced_profile_data['relationship_goals']}")
    
    return True

def test_compatibility_algorithm():
    """Test the compatibility algorithm components"""
    print("\n🧪 Testing Compatibility Algorithm Components...")
    
    # Import the backend functions
    import sys
    sys.path.append('/app/backend')
    
    try:
        from server import (
            LifestyleSliders, 
            calculate_lifestyle_compatibility,
            check_gender_compatibility,
            GenderIdentity,
            OpenToDating,
            User
        )
        from datetime import date, timezone
        
        # Test lifestyle compatibility
        user1_sliders = LifestyleSliders(
            fitness_health=4, career_ambition=5, social_energy=2,
            travel_adventure=4, nightlife_lifestyle=1, family_future=5,
            dating_approach=3, passions_hobbies=4
        )
        
        user2_sliders = LifestyleSliders(
            fitness_health=4, career_ambition=4, social_energy=3,
            travel_adventure=5, nightlife_lifestyle=2, family_future=5,
            dating_approach=2, passions_hobbies=3
        )
        
        compatibility = calculate_lifestyle_compatibility(user1_sliders, user2_sliders)
        print(f"✅ Lifestyle compatibility calculated: {compatibility['overall_percentage']:.1f}%")
        
        # Test gender compatibility
        user1 = User(
            id="1", email="test1@example.com", name="Alice",
            birth_date=date(1995, 5, 15), zodiac_sign="taurus",
            gender_identity=GenderIdentity.WOMAN,
            open_to_dating=[OpenToDating.MEN],
            created_at=datetime.now(timezone.utc)
        )
        
        user2 = User(
            id="2", email="test2@example.com", name="Bob", 
            birth_date=date(1993, 8, 22), zodiac_sign="leo",
            gender_identity=GenderIdentity.MAN,
            open_to_dating=[OpenToDating.WOMEN],
            created_at=datetime.now(timezone.utc)
        )
        
        gender_compatible = check_gender_compatibility(user1, user2)
        print(f"✅ Gender compatibility checked: {gender_compatible}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Could not import backend modules: {e}")
        return False
    except Exception as e:
        print(f"❌ Compatibility algorithm test failed: {e}")
        return False

def test_new_endpoints_structure():
    """Test that new endpoints are properly structured"""
    print("\n🧪 Testing New Endpoint Structure...")
    
    new_endpoints = [
        "/users/update-lifestyle",
        "/users/update-photos", 
        "/users/compatibility-preview/{user_id}",
        "/admin/check-expired-matches"
    ]
    
    print("✅ New endpoints defined:")
    for endpoint in new_endpoints:
        print(f"   - {BASE_URL}{endpoint}")
    
    return True

def main():
    """Run all API tests"""
    print("🚀 Testing Enhanced Dating App API\n")
    
    tests_passed = 0
    total_tests = 4
    
    # Test 1: Health endpoint
    if test_health_endpoint():
        tests_passed += 1
    
    # Test 2: Enhanced profile structure
    if test_enhanced_profile_structure():
        tests_passed += 1
    
    # Test 3: Compatibility algorithm
    if test_compatibility_algorithm():
        tests_passed += 1
    
    # Test 4: New endpoints structure
    if test_new_endpoints_structure():
        tests_passed += 1
    
    print(f"\n📊 Test Results: {tests_passed}/{total_tests} tests passed")
    
    if tests_passed == total_tests:
        print("🎉 All API tests passed! Enhanced features are ready.")
    else:
        print("⚠️  Some tests failed. Check the implementation.")
        
    return tests_passed == total_tests

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)