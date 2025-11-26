#!/usr/bin/env python3
"""
Test the liked-me endpoint with actual test data by creating swipes
"""

import requests
import json
from datetime import datetime

class LikedMeWithDataTester:
    def __init__(self, base_url="https://merge-datingapp.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session = requests.Session()
        self.user_id = None

    def login_test_user(self):
        """Login with test user"""
        print("🔍 Logging in test user...")
        
        login_data = {"email": "testuser@asign.com"}
        response = self.session.post(f"{self.api_url}/auth/test-login", json=login_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            self.user_id = data["user_id"]
            print(f"   ✅ Logged in as user: {self.user_id}")
            return True
        else:
            print(f"   ❌ Login failed: {response.status_code}")
            return False

    def get_potential_matches(self):
        """Get potential matches to find users to test with"""
        print("\n🔍 Getting potential matches...")
        
        response = self.session.get(f"{self.api_url}/users/potential-matches", timeout=10)
        
        if response.status_code == 200:
            matches = response.json()
            print(f"   ✅ Found {len(matches)} potential matches")
            return matches
        else:
            print(f"   ❌ Failed to get matches: {response.status_code}")
            return []

    def simulate_other_user_liking_me(self, other_user_id):
        """
        This would simulate another user liking our test user.
        In a real scenario, we'd need to login as different users and swipe.
        For testing purposes, we'll just check the current state.
        """
        print(f"\n🔍 Checking if user {other_user_id[:8]}... has liked our test user...")
        
        # We can't easily simulate this without multiple user accounts
        # But we can check the current state of the liked-me endpoint
        response = self.session.get(f"{self.api_url}/users/liked-me", timeout=10)
        
        if response.status_code == 200:
            liked_users = response.json()
            print(f"   Current users who liked me: {len(liked_users)}")
            
            # Check if the specific user is in the list
            user_found = any(user.get('id') == other_user_id for user in liked_users)
            if user_found:
                print(f"   ✅ User {other_user_id[:8]}... has liked our test user")
            else:
                print(f"   ℹ️  User {other_user_id[:8]}... has not liked our test user")
            
            return liked_users
        else:
            print(f"   ❌ Failed to check liked-me: {response.status_code}")
            return []

    def test_swipe_functionality(self, target_user_id):
        """Test swiping on a user"""
        print(f"\n🔍 Testing swipe on user {target_user_id[:8]}...")
        
        swipe_data = {
            "swiped_id": target_user_id,
            "liked": True
        }
        
        response = self.session.post(f"{self.api_url}/users/swipe", json=swipe_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Swipe successful: {data}")
            return data.get("match", False)
        else:
            try:
                error = response.json()
                print(f"   ❌ Swipe failed: {error}")
            except:
                print(f"   ❌ Swipe failed: {response.status_code}")
            return False

    def run_comprehensive_test(self):
        """Run comprehensive test with data"""
        print("🚀 Starting Comprehensive Liked-Me Test with Data")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Step 1: Login
        if not self.login_test_user():
            return False
        
        # Step 2: Get potential matches
        matches = self.get_potential_matches()
        if not matches:
            print("❌ No potential matches found")
            return False
        
        # Step 3: Check current liked-me state
        print(f"\n🔍 Checking current liked-me state...")
        response = self.session.get(f"{self.api_url}/users/liked-me", timeout=10)
        if response.status_code == 200:
            current_liked = response.json()
            print(f"   Current users who liked me: {len(current_liked)}")
            
            if len(current_liked) > 0:
                print("   Sample users who liked me:")
                for i, user in enumerate(current_liked[:3]):  # Show first 3
                    print(f"     {i+1}. {user.get('name', 'Unknown')} (ID: {user.get('id', 'No ID')[:8]}...)")
            else:
                print("   No users have liked the test user yet")
        
        # Step 4: Test swipe functionality with first potential match
        if matches:
            first_match = matches[0]
            print(f"\n🔍 Testing swipe functionality with {first_match.get('name', 'Unknown')}...")
            match_result = self.test_swipe_functionality(first_match['id'])
            
            if match_result:
                print("   🎉 It's a match!")
            else:
                print("   ℹ️  Swipe recorded, no mutual match")
        
        # Step 5: Final check of liked-me endpoint
        print(f"\n🔍 Final check of liked-me endpoint...")
        response = self.session.get(f"{self.api_url}/users/liked-me", timeout=10)
        if response.status_code == 200:
            final_liked = response.json()
            print(f"   ✅ Liked-me endpoint working - {len(final_liked)} users")
            return True
        else:
            print(f"   ❌ Liked-me endpoint failed")
            return False

def main():
    tester = LikedMeWithDataTester()
    success = tester.run_comprehensive_test()
    return 0 if success else 1

if __name__ == "__main__":
    import sys
    sys.exit(main())