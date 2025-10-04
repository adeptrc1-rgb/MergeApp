#!/usr/bin/env python3
"""
Comprehensive test for the /api/users/liked-me endpoint with proper session handling
"""

import requests
import json
from datetime import datetime

class LikedMeEndpointTester:
    def __init__(self, base_url="https://starsign-date.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session = requests.Session()  # Use session to handle cookies
        self.user_id = None

    def test_login_and_get_session(self):
        """Login with test user and get session cookie"""
        print("🔍 Testing login and session creation...")
        
        login_data = {"email": "testuser@asign.com"}
        response = self.session.post(
            f"{self.api_url}/auth/test-login",
            json=login_data,
            timeout=10
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
            
            if data.get("success") and "user_id" in data:
                self.user_id = data["user_id"]
                print(f"   ✅ Login successful! User ID: {self.user_id}")
                
                # Check if session cookie was set
                cookies = self.session.cookies
                if 'session_token' in cookies:
                    print(f"   ✅ Session cookie set: {cookies['session_token'][:20]}...")
                else:
                    print("   ⚠️  No session cookie found")
                
                return True
            else:
                print("   ❌ Login failed - invalid response format")
                return False
        else:
            print(f"   ❌ Login failed with status {response.status_code}")
            return False

    def test_auth_me_with_session(self):
        """Test /auth/me endpoint with session cookie"""
        print("\n🔍 Testing /auth/me with session...")
        
        response = self.session.get(f"{self.api_url}/auth/me", timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Authentication working! User: {data.get('name', 'Unknown')}")
            return True
        else:
            print(f"   ❌ Authentication failed: {response.text}")
            return False

    def test_liked_me_endpoint(self):
        """Test the /users/liked-me endpoint"""
        print("\n🔍 Testing /users/liked-me endpoint...")
        
        response = self.session.get(f"{self.api_url}/users/liked-me", timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Liked-me endpoint working!")
            print(f"   Response type: {type(data)}")
            
            if isinstance(data, list):
                print(f"   Number of users who liked me: {len(data)}")
                if len(data) > 0:
                    print(f"   Sample user: {data[0].get('name', 'Unknown')} ({data[0].get('id', 'No ID')})")
                else:
                    print("   No users have liked this test user yet")
            else:
                print(f"   Unexpected response format: {data}")
            
            return True
        else:
            try:
                error_data = response.json()
                print(f"   ❌ Liked-me endpoint failed: {error_data}")
            except:
                print(f"   ❌ Liked-me endpoint failed: {response.text}")
            return False

    def test_potential_matches_endpoint(self):
        """Test the /users/potential-matches endpoint for comparison"""
        print("\n🔍 Testing /users/potential-matches endpoint for comparison...")
        
        response = self.session.get(f"{self.api_url}/users/potential-matches", timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Potential matches endpoint working!")
            print(f"   Number of potential matches: {len(data) if isinstance(data, list) else 'Not a list'}")
            return True
        else:
            try:
                error_data = response.json()
                print(f"   ❌ Potential matches failed: {error_data}")
            except:
                print(f"   ❌ Potential matches failed: {response.text}")
            return False

    def run_comprehensive_test(self):
        """Run all tests in sequence"""
        print("🚀 Starting Comprehensive Liked-Me Endpoint Test")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Step 1: Login and get session
        if not self.test_login_and_get_session():
            print("❌ Cannot proceed without valid session")
            return False
        
        # Step 2: Verify authentication works
        if not self.test_auth_me_with_session():
            print("❌ Session authentication not working")
            return False
        
        # Step 3: Test the liked-me endpoint
        liked_me_success = self.test_liked_me_endpoint()
        
        # Step 4: Test potential matches for comparison
        potential_matches_success = self.test_potential_matches_endpoint()
        
        print("\n" + "=" * 60)
        print("📊 Test Results:")
        print(f"   Login & Session: ✅")
        print(f"   Authentication: ✅")
        print(f"   Liked-Me Endpoint: {'✅' if liked_me_success else '❌'}")
        print(f"   Potential Matches: {'✅' if potential_matches_success else '❌'}")
        
        if liked_me_success:
            print("\n🎉 Liked-Me endpoint is working correctly!")
            return True
        else:
            print("\n⚠️ Liked-Me endpoint has issues")
            return False

def main():
    tester = LikedMeEndpointTester()
    success = tester.run_comprehensive_test()
    return 0 if success else 1

if __name__ == "__main__":
    import sys
    sys.exit(main())