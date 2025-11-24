import requests
import sys
import json
from datetime import datetime

class RegressionTester:
    def __init__(self, base_url="https://datapp-overhaul.preview.emergentagent.com"):
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

    def run_test(self, name, method, endpoint, expected_status, data=None, use_cookies=True):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        
        try:
            cookies = self.session_cookies if use_cookies else None
            
            if method == 'GET':
                response = requests.get(url, headers=headers, cookies=cookies, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, cookies=cookies, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
                print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
            except:
                response_data = response.text
                print(f"   Response: {response_data[:200]}...")

            if success:
                self.log_test(name, True)
                return True, response_data, response
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}")
                return False, response_data, response

        except Exception as e:
            error_msg = str(e)
            print(f"   Error: {error_msg}")
            self.log_test(name, False, error_msg)
            return False, {}, None

    def run_regression_check(self):
        """Run regression check on key endpoints"""
        print("🚀 Starting Regression Check for Key Endpoints")
        print("=" * 60)

        # Step 1: Authentication
        print("\n" + "=" * 50)
        print("🔐 STEP 1: Authentication")
        print("=" * 50)
        
        login_data = {"email": "regression@test.com"}
        success, response_data, response = self.run_test("Test Login", "POST", "auth/test-login", 200, data=login_data, use_cookies=False)
        
        if not success:
            print("❌ Cannot continue without successful login")
            return 1
            
        if response and response.cookies:
            self.session_cookies = response.cookies
            print(f"   ✅ Session cookies captured successfully")
        else:
            print("   ❌ No cookies received from login")
            return 1

        # Step 2: Auth endpoints
        print("\n" + "=" * 50)
        print("🔒 STEP 2: Auth Endpoints")
        print("=" * 50)
        
        success, user_data, _ = self.run_test("GET /auth/me", "GET", "auth/me", 200)
        if not success:
            return 1

        # Step 3: Spotify endpoints
        print("\n" + "=" * 50)
        print("🎵 STEP 3: Spotify Endpoints")
        print("=" * 50)
        
        self.run_test("GET /spotify/auth-url", "GET", "spotify/auth-url", 200)
        self.run_test("GET /spotify/search (no connection)", "GET", "spotify/search?q=test", 400)
        self.run_test("GET /spotify/top-tracks (no connection)", "GET", "spotify/top-tracks", 400)
        
        # Step 4: Cosmic Wheel endpoints
        print("\n" + "=" * 50)
        print("🎡 STEP 4: Cosmic Wheel Endpoints")
        print("=" * 50)
        
        self.run_test("GET /rewards/cosmic-wheel-status", "GET", "rewards/cosmic-wheel-status", 200)
        
        # Step 5: User endpoints
        print("\n" + "=" * 50)
        print("👥 STEP 5: User Endpoints")
        print("=" * 50)
        
        self.run_test("GET /users/potential-matches", "GET", "users/potential-matches", 200)
        self.run_test("GET /users/trending", "GET", "users/trending", 200)
        
        # Step 6: Match endpoints
        print("\n" + "=" * 50)
        print("💕 STEP 6: Match Endpoints")
        print("=" * 50)
        
        self.run_test("GET /matches", "GET", "matches", 200)
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 REGRESSION CHECK SUMMARY")
        print("=" * 60)
        
        passed_tests = [result for result in self.test_results if result["success"]]
        failed_tests = [result for result in self.test_results if not result["success"]]
        
        print(f"✅ PASSED: {len(passed_tests)}/{self.tests_run} tests")
        print(f"❌ FAILED: {len(failed_tests)}/{self.tests_run} tests")
        
        if failed_tests:
            print("\n❌ Failed Tests Details:")
            for result in failed_tests:
                print(f"   - {result['test']}: {result['details']}")
        
        # Return status
        if len(failed_tests) == 0:
            print("\n🎉 REGRESSION CHECK: PASS")
            return 0
        else:
            print(f"\n⚠️  REGRESSION CHECK: FAIL ({len(failed_tests)} issues)")
            return 1

if __name__ == "__main__":
    tester = RegressionTester()
    exit_code = tester.run_regression_check()
    sys.exit(exit_code)