#!/usr/bin/env python3
"""
Merge Wheel (Cosmic Wheel) Backend Test
Tests the cosmic wheel endpoints with proper authentication flow
"""

import requests
import json
import sys
import tempfile
import os
from datetime import datetime

class CosmicWheelTester:
    def __init__(self, base_url="https://merge-datingapp.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.cookies_file = "/tmp/cookies.txt"
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

    def test_login_and_save_cookies(self):
        """Test POST /api/auth/test-login and save cookies"""
        print("\n🔍 Testing POST /api/auth/test-login...")
        
        url = f"{self.api_url}/auth/test-login"
        data = {"email": "test@example.com"}
        
        try:
            # Use curl to save cookies properly
            import subprocess
            
            curl_cmd = [
                'curl', '-s', '-c', self.cookies_file,
                '-H', 'Content-Type: application/json',
                '-d', json.dumps(data),
                '-X', 'POST',
                url
            ]
            
            result = subprocess.run(curl_cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode != 0:
                self.log_test("Test Login", False, f"Curl failed: {result.stderr}")
                return False
            
            try:
                response_data = json.loads(result.stdout)
            except json.JSONDecodeError:
                self.log_test("Test Login", False, f"Invalid JSON response: {result.stdout}")
                return False
            
            print(f"   Response: {json.dumps(response_data, indent=2)}")
            
            # Check if login was successful
            if response_data.get("success") == True:
                # Verify cookies file was created
                if os.path.exists(self.cookies_file):
                    with open(self.cookies_file, 'r') as f:
                        cookies_content = f.read()
                        print(f"   Cookies saved: {len(cookies_content)} bytes")
                        if "session_token" in cookies_content:
                            print("   ✅ Session token found in cookies")
                        else:
                            print("   ⚠️  No session_token found in cookies")
                    
                    self.log_test("Test Login", True, "Login successful and cookies saved")
                    return True
                else:
                    self.log_test("Test Login", False, "Cookies file not created")
                    return False
            else:
                self.log_test("Test Login", False, f"Login failed: {response_data}")
                return False
                
        except Exception as e:
            self.log_test("Test Login", False, f"Exception: {str(e)}")
            return False

    def test_cosmic_wheel_status(self):
        """Test GET /api/rewards/cosmic-wheel-status with cookies"""
        print("\n🔍 Testing GET /api/rewards/cosmic-wheel-status...")
        
        if not os.path.exists(self.cookies_file):
            self.log_test("Cosmic Wheel Status", False, "No cookies file available")
            return False
        
        url = f"{self.api_url}/rewards/cosmic-wheel-status"
        
        try:
            import subprocess
            
            curl_cmd = [
                'curl', '-s', '-b', self.cookies_file,
                '-H', 'Content-Type: application/json',
                url
            ]
            
            result = subprocess.run(curl_cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode != 0:
                self.log_test("Cosmic Wheel Status", False, f"Curl failed: {result.stderr}")
                return False
            
            try:
                response_data = json.loads(result.stdout)
            except json.JSONDecodeError:
                self.log_test("Cosmic Wheel Status", False, f"Invalid JSON response: {result.stdout}")
                return False
            
            print(f"   Response: {json.dumps(response_data, indent=2)}")
            
            # Check for required fields
            required_fields = ["can_spin", "cooldown_hours", "spin_streak", "spins_today", "max_spins"]
            missing_fields = [field for field in required_fields if field not in response_data]
            
            if missing_fields:
                self.log_test("Cosmic Wheel Status", False, f"Missing fields: {missing_fields}")
                return False
            
            # Verify field types
            if not isinstance(response_data.get("can_spin"), bool):
                self.log_test("Cosmic Wheel Status", False, "can_spin is not boolean")
                return False
            
            if not isinstance(response_data.get("cooldown_hours"), (int, float)):
                self.log_test("Cosmic Wheel Status", False, "cooldown_hours is not numeric")
                return False
            
            if not isinstance(response_data.get("spin_streak"), int):
                self.log_test("Cosmic Wheel Status", False, "spin_streak is not integer")
                return False
            
            if not isinstance(response_data.get("spins_today"), int):
                self.log_test("Cosmic Wheel Status", False, "spins_today is not integer")
                return False
            
            if not isinstance(response_data.get("max_spins"), int):
                self.log_test("Cosmic Wheel Status", False, "max_spins is not integer")
                return False
            
            print(f"   ✅ Can spin: {response_data['can_spin']}")
            print(f"   ✅ Cooldown hours: {response_data['cooldown_hours']}")
            print(f"   ✅ Spin streak: {response_data['spin_streak']}")
            print(f"   ✅ Spins today: {response_data['spins_today']}")
            print(f"   ✅ Max spins: {response_data['max_spins']}")
            
            self.log_test("Cosmic Wheel Status", True, "All required fields present with correct types")
            return response_data
                
        except Exception as e:
            self.log_test("Cosmic Wheel Status", False, f"Exception: {str(e)}")
            return False

    def test_spin_cosmic_wheel(self, can_spin=None):
        """Test POST /api/rewards/spin-cosmic-wheel with cookies"""
        print("\n🔍 Testing POST /api/rewards/spin-cosmic-wheel...")
        
        if not os.path.exists(self.cookies_file):
            self.log_test("Spin Cosmic Wheel", False, "No cookies file available")
            return False
        
        url = f"{self.api_url}/rewards/spin-cosmic-wheel"
        
        try:
            import subprocess
            
            curl_cmd = [
                'curl', '-s', '-b', self.cookies_file,
                '-H', 'Content-Type: application/json',
                '-X', 'POST',
                url
            ]
            
            result = subprocess.run(curl_cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode != 0:
                self.log_test("Spin Cosmic Wheel", False, f"Curl failed: {result.stderr}")
                return False
            
            try:
                response_data = json.loads(result.stdout)
            except json.JSONDecodeError:
                self.log_test("Spin Cosmic Wheel", False, f"Invalid JSON response: {result.stdout}")
                return False
            
            print(f"   Response: {json.dumps(response_data, indent=2)}")
            
            # If we know can_spin is False, expect 400 error
            if can_spin == False:
                if "detail" in response_data and ("No spins remaining" in str(response_data["detail"]) or "Cooldown active" in str(response_data["detail"])):
                    print("   ✅ Correctly prevented spin when not allowed")
                    self.log_test("Spin Cosmic Wheel (Not Allowed)", True, "Proper error when spinning not allowed")
                    return True
                else:
                    self.log_test("Spin Cosmic Wheel (Not Allowed)", False, f"Expected proper error, got: {response_data}")
                    return False
            
            # If can_spin is True or unknown, expect success
            if "reward" in response_data and "tier" in response_data:
                reward = response_data["reward"]
                tier = response_data["tier"]
                
                print(f"   ✅ Spin successful!")
                print(f"   ✅ Reward: {reward}")
                print(f"   ✅ Tier: {tier}")
                
                # Verify reward structure
                if isinstance(reward, dict) and "type" in reward and "label" in reward:
                    self.log_test("Spin Cosmic Wheel", True, f"Spin successful - {reward.get('label')} ({tier})")
                    return True
                else:
                    self.log_test("Spin Cosmic Wheel", False, f"Invalid reward structure: {reward}")
                    return False
            else:
                # Check if it's an error response
                if "detail" in response_data:
                    if can_spin == True:
                        self.log_test("Spin Cosmic Wheel", False, f"Unexpected error when spin should be allowed: {response_data['detail']}")
                        return False
                    else:
                        print(f"   ℹ️  Spin not allowed: {response_data['detail']}")
                        self.log_test("Spin Cosmic Wheel (Not Allowed)", True, "Proper error handling")
                        return True
                else:
                    self.log_test("Spin Cosmic Wheel", False, f"Missing reward/tier fields: {response_data}")
                    return False
                
        except Exception as e:
            self.log_test("Spin Cosmic Wheel", False, f"Exception: {str(e)}")
            return False

    def test_authentication_required(self):
        """Test that endpoints return 401 without authentication"""
        print("\n🔍 Testing authentication requirements...")
        
        endpoints = [
            ("GET", "rewards/cosmic-wheel-status"),
            ("POST", "rewards/spin-cosmic-wheel")
        ]
        
        for method, endpoint in endpoints:
            url = f"{self.api_url}/{endpoint}"
            
            try:
                import subprocess
                
                if method == "GET":
                    curl_cmd = ['curl', '-s', '-w', '%{http_code}', url]
                else:
                    curl_cmd = ['curl', '-s', '-w', '%{http_code}', '-X', method, url]
                
                result = subprocess.run(curl_cmd, capture_output=True, text=True, timeout=30)
                
                if result.returncode != 0:
                    self.log_test(f"Auth Required {method} {endpoint}", False, f"Curl failed: {result.stderr}")
                    continue
                
                # Extract HTTP status code (last 3 characters)
                output = result.stdout
                if len(output) >= 3:
                    status_code = output[-3:]
                    response_body = output[:-3]
                    
                    if status_code == "401":
                        print(f"   ✅ {method} /{endpoint} correctly returns 401 without auth")
                        self.log_test(f"Auth Required {method} {endpoint}", True, "Correctly requires authentication")
                    else:
                        print(f"   ❌ {method} /{endpoint} returned {status_code}, expected 401")
                        self.log_test(f"Auth Required {method} {endpoint}", False, f"Expected 401, got {status_code}")
                else:
                    self.log_test(f"Auth Required {method} {endpoint}", False, "Could not parse response")
                    
            except Exception as e:
                self.log_test(f"Auth Required {method} {endpoint}", False, f"Exception: {str(e)}")

    def run_cosmic_wheel_tests(self):
        """Run the complete cosmic wheel test suite"""
        print("🚀 Starting Merge Wheel (Cosmic Wheel) Backend Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)

        # Step 1: Test authentication requirements (without cookies)
        print("\n" + "=" * 50)
        print("🔒 STEP 1: Authentication Requirements")
        print("=" * 50)
        self.test_authentication_required()

        # Step 2: Login and save cookies
        print("\n" + "=" * 50)
        print("🔐 STEP 2: Login and Save Cookies")
        print("=" * 50)
        login_success = self.test_login_and_save_cookies()
        
        if not login_success:
            print("❌ Cannot continue without successful login")
            return 1

        # Step 3: Test cosmic wheel status
        print("\n" + "=" * 50)
        print("🎡 STEP 3: Cosmic Wheel Status")
        print("=" * 50)
        wheel_status = self.test_cosmic_wheel_status()
        
        if not wheel_status:
            print("❌ Cannot continue without wheel status")
            return 1

        # Step 4: Test cosmic wheel spin
        print("\n" + "=" * 50)
        print("🎰 STEP 4: Cosmic Wheel Spin")
        print("=" * 50)
        can_spin = wheel_status.get("can_spin", False) if isinstance(wheel_status, dict) else False
        self.test_spin_cosmic_wheel(can_spin)

        # Cleanup
        if os.path.exists(self.cookies_file):
            os.remove(self.cookies_file)
            print(f"\n🧹 Cleaned up cookies file")

        # Print summary
        print("\n" + "=" * 60)
        print("📊 COSMIC WHEEL TEST SUMMARY")
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
            print("\n🎉 COSMIC WHEEL TESTS: PASS")
            return 0
        else:
            print(f"\n⚠️  COSMIC WHEEL TESTS: FAIL ({len(failed_tests)} issues)")
            return 1

if __name__ == "__main__":
    tester = CosmicWheelTester()
    exit_code = tester.run_cosmic_wheel_tests()
    sys.exit(exit_code)