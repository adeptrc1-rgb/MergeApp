#!/usr/bin/env python3
"""
Focused Backend Test for A Sign Astrology Dating App
Tests the specific endpoints mentioned in the review request
"""

import requests
import json
import sys
from datetime import datetime

class ASignBackendTester:
    def __init__(self, base_url="https://zodiac-dating.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_cookies = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def make_request(self, method, endpoint, data=None, use_cookies=False):
        """Make HTTP request to API"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        print(f"\n🔍 {method} {url}")
        
        try:
            cookies = self.session_cookies if use_cookies else None
            
            if method == 'GET':
                response = requests.get(url, headers=headers, cookies=cookies, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, cookies=cookies, timeout=10)
            
            print(f"   Status: {response.status_code}")
            
            try:
                response_data = response.json()
                print(f"   Response: {json.dumps(response_data, indent=2)[:300]}...")
            except:
                response_data = response.text
                print(f"   Response: {response_data[:200]}...")

            return response.status_code, response_data, response
            
        except Exception as e:
            print(f"   Error: {str(e)}")
            return None, {}, None

    def test_auth_health(self):
        """Test GET /api/auth/health"""
        status, data, response = self.make_request('GET', 'auth/health')
        
        if status == 200:
            if isinstance(data, dict) and ('ok' in data or 'time' in data):
                self.log_test("Auth Health", True)
                return True
            else:
                self.log_test("Auth Health", False, "Invalid response format")
                return False
        else:
            self.log_test("Auth Health", False, f"Expected 200, got {status}")
            return False

    def test_auth_test_login(self):
        """Test POST /api/auth/test-login with testuser@asign.com"""
        login_data = {"email": "testuser@asign.com"}
        status, data, response = self.make_request('POST', 'auth/test-login', data=login_data)
        
        if status == 200:
            if isinstance(data, dict) and data.get("success"):
                # Store session cookies
                if response and response.cookies:
                    self.session_cookies = response.cookies
                    print(f"   ✅ Session cookies captured")
                
                self.log_test("Auth Test Login", True)
                return True
            else:
                self.log_test("Auth Test Login", False, "No success field in response")
                return False
        else:
            self.log_test("Auth Test Login", False, f"Expected 200, got {status}")
            return False

    def test_auth_me(self):
        """Test GET /api/auth/me with session cookies"""
        if not self.session_cookies:
            self.log_test("Auth Me", False, "No session cookies available")
            return False
            
        status, data, response = self.make_request('GET', 'auth/me', use_cookies=True)
        
        if status == 200:
            if isinstance(data, dict) and 'id' in data and 'email' in data:
                print(f"   ✅ User authenticated: {data.get('email')}")
                self.log_test("Auth Me", True)
                return True
            else:
                self.log_test("Auth Me", False, "Missing user data in response")
                return False
        else:
            self.log_test("Auth Me", False, f"Expected 200, got {status}")
            return False

    def test_potential_matches(self):
        """Test GET /api/users/potential-matches"""
        if not self.session_cookies:
            self.log_test("Potential Matches", False, "No session cookies available")
            return False
            
        status, data, response = self.make_request('GET', 'users/potential-matches', use_cookies=True)
        
        if status == 200:
            if isinstance(data, list):
                print(f"   ✅ Found {len(data)} potential matches")
                
                # Check structure of matches if any exist
                if len(data) > 0:
                    first_match = data[0]
                    required_fields = ["id", "first_name", "zodiac_sign", "compatibility_score"]
                    missing_fields = [field for field in required_fields if field not in first_match]
                    
                    if missing_fields:
                        self.log_test("Potential Matches", False, f"Missing fields: {missing_fields}")
                        return False
                    
                    print(f"   ✅ Sample match: {first_match.get('first_name')} ({first_match.get('zodiac_sign')}) - {first_match.get('compatibility_score')}% compatible")
                
                self.log_test("Potential Matches", True)
                return True
            else:
                self.log_test("Potential Matches", False, f"Expected array, got {type(data)}")
                return False
        else:
            self.log_test("Potential Matches", False, f"Expected 200, got {status}")
            return False

    def test_matches(self):
        """Test GET /api/matches"""
        if not self.session_cookies:
            self.log_test("Matches", False, "No session cookies available")
            return False
            
        status, data, response = self.make_request('GET', 'matches', use_cookies=True)
        
        if status == 200:
            if isinstance(data, list):
                print(f"   ✅ Found {len(data)} matches")
                self.log_test("Matches", True)
                return True
            else:
                self.log_test("Matches", False, f"Expected array, got {type(data)}")
                return False
        else:
            self.log_test("Matches", False, f"Expected 200, got {status}")
            return False

    def test_cosmic_wheel_status(self):
        """Test GET /api/rewards/cosmic-wheel-status"""
        if not self.session_cookies:
            self.log_test("Cosmic Wheel Status", False, "No session cookies available")
            return False
            
        status, data, response = self.make_request('GET', 'rewards/cosmic-wheel-status', use_cookies=True)
        
        if status == 200:
            if isinstance(data, dict):
                required_fields = ["can_spin", "cooldown_hours", "spin_streak", "spins_today", "max_spins"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Cosmic Wheel Status", False, f"Missing fields: {missing_fields}")
                    return False
                
                print(f"   ✅ Can spin: {data.get('can_spin')}")
                print(f"   ✅ Cooldown: {data.get('cooldown_hours')} hours")
                print(f"   ✅ Streak: {data.get('spin_streak')}")
                print(f"   ✅ Spins today: {data.get('spins_today')}/{data.get('max_spins')}")
                
                self.log_test("Cosmic Wheel Status", True)
                return True
            else:
                self.log_test("Cosmic Wheel Status", False, f"Expected dict, got {type(data)}")
                return False
        else:
            self.log_test("Cosmic Wheel Status", False, f"Expected 200, got {status}")
            return False

    def test_cosmic_wheel_spin(self):
        """Test POST /api/rewards/spin-cosmic-wheel"""
        if not self.session_cookies:
            self.log_test("Cosmic Wheel Spin", False, "No session cookies available")
            return False
            
        status, data, response = self.make_request('POST', 'rewards/spin-cosmic-wheel', use_cookies=True)
        
        # Can be 200 (successful spin) or 400 (no spins available)
        if status == 200:
            if isinstance(data, dict) and "reward" in data:
                reward = data.get("reward", {})
                print(f"   ✅ Spin successful! Reward: {reward.get('label', 'Unknown')}")
                self.log_test("Cosmic Wheel Spin", True)
                return True
            else:
                self.log_test("Cosmic Wheel Spin", False, "Missing reward in response")
                return False
        elif status == 400:
            # This is expected if user has no spins available
            print(f"   ✅ Spin blocked (expected): {data.get('detail', 'No spins available')}")
            self.log_test("Cosmic Wheel Spin", True, "Correctly blocked when no spins available")
            return True
        else:
            self.log_test("Cosmic Wheel Spin", False, f"Expected 200 or 400, got {status}")
            return False

    def test_cosmic_wheel_reset(self):
        """Test POST /api/rewards/reset-cosmic-wheel (dev endpoint)"""
        if not self.session_cookies:
            self.log_test("Cosmic Wheel Reset", False, "No session cookies available")
            return False
            
        status, data, response = self.make_request('POST', 'rewards/reset-cosmic-wheel', use_cookies=True)
        
        if status == 200:
            if isinstance(data, dict) and data.get("success"):
                print(f"   ✅ Cosmic wheel reset successful")
                self.log_test("Cosmic Wheel Reset", True)
                return True
            else:
                self.log_test("Cosmic Wheel Reset", False, "No success field in response")
                return False
        else:
            self.log_test("Cosmic Wheel Reset", False, f"Expected 200, got {status}")
            return False

    def test_horoscope_today(self):
        """Test GET /api/horoscope/today"""
        if not self.session_cookies:
            self.log_test("Horoscope Today", False, "No session cookies available")
            return False
            
        status, data, response = self.make_request('GET', 'horoscope/today', use_cookies=True)
        
        if status == 200:
            if isinstance(data, dict):
                required_fields = ["sign", "message", "message_long"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_test("Horoscope Today", False, f"Missing fields: {missing_fields}")
                    return False
                
                print(f"   ✅ Sign: {data.get('sign')}")
                print(f"   ✅ Message: {data.get('message')[:50]}...")
                
                self.log_test("Horoscope Today", True)
                return True
            else:
                self.log_test("Horoscope Today", False, f"Expected dict, got {type(data)}")
                return False
        else:
            self.log_test("Horoscope Today", False, f"Expected 200, got {status}")
            return False

    def run_all_tests(self):
        """Run all the tests specified in the review request"""
        print("🚀 Starting A Sign Backend API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)

        # Step 1: Auth Endpoints
        print("\n" + "=" * 50)
        print("🔐 AUTH ENDPOINTS")
        print("=" * 50)
        
        self.test_auth_health()
        self.test_auth_test_login()
        
        if self.session_cookies:
            self.test_auth_me()
        else:
            print("⚠️  Skipping authenticated tests - no session cookies")
            return 1

        # Step 2: User/Match Endpoints
        print("\n" + "=" * 50)
        print("💕 USER/MATCH ENDPOINTS")
        print("=" * 50)
        
        self.test_potential_matches()
        self.test_matches()

        # Step 3: Cosmic Wheel Endpoints
        print("\n" + "=" * 50)
        print("🎡 COSMIC WHEEL ENDPOINTS")
        print("=" * 50)
        
        self.test_cosmic_wheel_status()
        self.test_cosmic_wheel_reset()  # Reset first to ensure we can spin
        self.test_cosmic_wheel_spin()

        # Step 4: Horoscope Endpoint
        print("\n" + "=" * 50)
        print("🌟 HOROSCOPE ENDPOINT")
        print("=" * 50)
        
        self.test_horoscope_today()

        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        print(f"✅ PASSED: {self.tests_passed}/{self.tests_run} tests")
        print(f"❌ FAILED: {self.tests_run - self.tests_passed}/{self.tests_run} tests")
        
        if self.tests_passed < self.tests_run:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   - {result['test']}: {result['details']}")
        
        return 0 if self.tests_passed == self.tests_run else 1

if __name__ == "__main__":
    tester = ASignBackendTester()
    exit_code = tester.run_all_tests()
    sys.exit(exit_code)