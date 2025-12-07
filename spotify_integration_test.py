import requests
import sys
import json
from datetime import datetime
import time

class SpotifyIntegrationTester:
    def __init__(self, base_url="https://merge-elite-app.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_cookies = None
        self.user_id = None
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

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, use_cookies=True):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        
        try:
            cookies = self.session_cookies if use_cookies else None
            
            if method == 'GET':
                response = requests.get(url, headers=test_headers, cookies=cookies, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, cookies=cookies, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, cookies=cookies, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, cookies=cookies, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
                print(f"   Response: {json.dumps(response_data, indent=2)[:300]}...")
            except:
                response_data = response.text
                print(f"   Response: {response_data[:300]}...")

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

    def setup_authentication(self):
        """Setup authentication for testing"""
        print("🔐 Setting up authentication...")
        login_data = {"email": "spotify_test_user@asign.com"}
        success, response_data, response = self.run_test("Test Login for Spotify", "POST", "auth/test-login", 200, data=login_data, use_cookies=False)
        
        if success and response and response.cookies:
            self.session_cookies = response.cookies
            print(f"   ✅ Session cookies captured successfully")
            return True
        else:
            print("   ❌ Failed to get session cookies")
            return False

    def test_spotify_auth_url(self):
        """Test GET /api/spotify/auth-url - Get Spotify OAuth URL"""
        print("\n" + "=" * 50)
        print("🎵 TEST 1: GET /api/spotify/auth-url")
        print("=" * 50)
        
        success, response_data, response = self.run_test(
            "Spotify Auth URL", 
            "GET", 
            "spotify/auth-url", 
            200
        )
        
        if success and isinstance(response_data, dict):
            auth_url = response_data.get("auth_url")
            if auth_url and "spotify.com" in auth_url and "authorize" in auth_url:
                print(f"   ✅ Valid Spotify OAuth URL returned")
                print(f"   🔗 URL: {auth_url[:100]}...")
                self.log_test("Spotify Auth URL Format", True, "Valid Spotify OAuth URL format")
                return True
            else:
                self.log_test("Spotify Auth URL Format", False, f"Invalid auth URL: {auth_url}")
                return False
        return success

    def test_spotify_callback_no_code(self):
        """Test GET /api/spotify/callback without code parameter"""
        print("\n" + "=" * 50)
        print("🎵 TEST 2a: GET /api/spotify/callback (No Code)")
        print("=" * 50)
        
        success, response_data, response = self.run_test(
            "Spotify Callback (No Code)", 
            "GET", 
            "spotify/callback", 
            422  # Should fail without code parameter
        )
        
        if success:
            print("   ✅ Correctly rejected callback without code parameter")
            return True
        return success

    def test_spotify_callback_invalid_code(self):
        """Test GET /api/spotify/callback with invalid code"""
        print("\n" + "=" * 50)
        print("🎵 TEST 2b: GET /api/spotify/callback (Invalid Code)")
        print("=" * 50)
        
        success, response_data, response = self.run_test(
            "Spotify Callback (Invalid Code)", 
            "GET", 
            "spotify/callback?code=invalid_test_code_12345", 
            302  # Should redirect on error
        )
        
        if success:
            print("   ✅ Correctly handled invalid code with redirect")
            return True
        else:
            # Alternative: might return 400 or 500 for invalid code
            alt_success, _, _ = self.run_test(
                "Spotify Callback (Invalid Code - Alt)", 
                "GET", 
                "spotify/callback?code=invalid_test_code_12345", 
                400
            )
            if alt_success:
                print("   ✅ Correctly handled invalid code with 400 error")
                return True
        return success

    def test_spotify_search_not_connected(self):
        """Test GET /api/spotify/search when user not connected to Spotify"""
        print("\n" + "=" * 50)
        print("🎵 TEST 3a: GET /api/spotify/search (Not Connected)")
        print("=" * 50)
        
        success, response_data, response = self.run_test(
            "Spotify Search (Not Connected)", 
            "GET", 
            "spotify/search?q=test", 
            400  # Should fail if not connected
        )
        
        if success and isinstance(response_data, dict):
            error_detail = response_data.get("detail", "")
            if "not connected" in error_detail.lower() or "spotify" in error_detail.lower():
                print("   ✅ Correctly rejected search when not connected to Spotify")
                self.log_test("Spotify Search Error Message", True, f"Proper error: {error_detail}")
                return True
            else:
                self.log_test("Spotify Search Error Message", False, f"Unexpected error: {error_detail}")
                return False
        return success

    def test_spotify_search_no_query(self):
        """Test GET /api/spotify/search without query parameter"""
        print("\n" + "=" * 50)
        print("🎵 TEST 3b: GET /api/spotify/search (No Query)")
        print("=" * 50)
        
        success, response_data, response = self.run_test(
            "Spotify Search (No Query)", 
            "GET", 
            "spotify/search", 
            422  # Should fail without q parameter
        )
        
        if success:
            print("   ✅ Correctly rejected search without query parameter")
            return True
        return success

    def test_spotify_top_tracks_not_connected(self):
        """Test GET /api/spotify/top-tracks when user not connected"""
        print("\n" + "=" * 50)
        print("🎵 TEST 4: GET /api/spotify/top-tracks (Not Connected)")
        print("=" * 50)
        
        success, response_data, response = self.run_test(
            "Spotify Top Tracks (Not Connected)", 
            "GET", 
            "spotify/top-tracks", 
            400  # Should fail if not connected
        )
        
        if success and isinstance(response_data, dict):
            error_detail = response_data.get("detail", "")
            if "not connected" in error_detail.lower() or "spotify" in error_detail.lower():
                print("   ✅ Correctly rejected top tracks when not connected to Spotify")
                self.log_test("Spotify Top Tracks Error Message", True, f"Proper error: {error_detail}")
                return True
            else:
                self.log_test("Spotify Top Tracks Error Message", False, f"Unexpected error: {error_detail}")
                return False
        return success

    def test_set_vibe_song_no_data(self):
        """Test POST /api/spotify/set-vibe-song without vibe_song data"""
        print("\n" + "=" * 50)
        print("🎵 TEST 5a: POST /api/spotify/set-vibe-song (No Data)")
        print("=" * 50)
        
        success, response_data, response = self.run_test(
            "Set Vibe Song (No Data)", 
            "POST", 
            "spotify/set-vibe-song", 
            400,  # Should fail without vibe_song
            data={}
        )
        
        if success and isinstance(response_data, dict):
            error_detail = response_data.get("detail", "")
            if "vibe_song" in error_detail.lower() and "required" in error_detail.lower():
                print("   ✅ Correctly rejected request without vibe_song data")
                self.log_test("Set Vibe Song Validation", True, f"Proper validation: {error_detail}")
                return True
            else:
                self.log_test("Set Vibe Song Validation", False, f"Unexpected error: {error_detail}")
                return False
        return success

    def test_set_vibe_song_valid_data(self):
        """Test POST /api/spotify/set-vibe-song with valid vibe_song data"""
        print("\n" + "=" * 50)
        print("🎵 TEST 5b: POST /api/spotify/set-vibe-song (Valid Data)")
        print("=" * 50)
        
        vibe_song_data = {
            "vibe_song": {
                "id": "test_track_id_12345",
                "name": "Test Song",
                "artist": "Test Artist",
                "album": "Test Album",
                "album_art": "https://example.com/album_art.jpg",
                "preview_url": "https://example.com/preview.mp3",
                "spotify_uri": "spotify:track:test_track_id_12345",
                "duration_ms": 180000
            }
        }
        
        success, response_data, response = self.run_test(
            "Set Vibe Song (Valid Data)", 
            "POST", 
            "spotify/set-vibe-song", 
            200,
            data=vibe_song_data
        )
        
        if success and isinstance(response_data, dict):
            if response_data.get("success") and "vibe_song" in response_data:
                returned_song = response_data.get("vibe_song")
                if returned_song and returned_song.get("name") == "Test Song":
                    print("   ✅ Successfully set vibe song with valid data")
                    print(f"   🎵 Song: {returned_song.get('name')} by {returned_song.get('artist')}")
                    self.log_test("Set Vibe Song Success", True, "Vibe song set successfully")
                    return True
                else:
                    self.log_test("Set Vibe Song Response", False, f"Unexpected vibe_song in response: {returned_song}")
                    return False
            else:
                self.log_test("Set Vibe Song Response Format", False, f"Missing success or vibe_song in response: {response_data}")
                return False
        return success

    def test_spotify_disconnect(self):
        """Test DELETE /api/spotify/disconnect"""
        print("\n" + "=" * 50)
        print("🎵 TEST 6: DELETE /api/spotify/disconnect")
        print("=" * 50)
        
        success, response_data, response = self.run_test(
            "Spotify Disconnect", 
            "DELETE", 
            "spotify/disconnect", 
            200
        )
        
        if success and isinstance(response_data, dict):
            if response_data.get("success") and "disconnected" in response_data.get("message", "").lower():
                print("   ✅ Successfully disconnected Spotify")
                self.log_test("Spotify Disconnect Success", True, "Spotify disconnected successfully")
                return True
            else:
                self.log_test("Spotify Disconnect Response", False, f"Unexpected response: {response_data}")
                return False
        return success

    def test_user_model_spotify_fields(self):
        """Test that User model includes Spotify fields"""
        print("\n" + "=" * 50)
        print("🎵 TEST 7: User Model Spotify Fields")
        print("=" * 50)
        
        success, response_data, response = self.run_test(
            "User Model Spotify Fields", 
            "GET", 
            "auth/me", 
            200
        )
        
        if success and isinstance(response_data, dict):
            # Check for Spotify-related fields in user model
            spotify_fields = [
                "spotify_connected",
                "spotify_access_token", 
                "spotify_refresh_token",
                "spotify_token_expires",
                "vibe_song"
            ]
            
            missing_fields = []
            present_fields = []
            
            for field in spotify_fields:
                if field in response_data:
                    present_fields.append(field)
                    print(f"   ✅ {field}: {response_data.get(field, 'None')}")
                else:
                    missing_fields.append(field)
                    print(f"   ❌ {field}: MISSING")
            
            if len(missing_fields) == 0:
                print("   ✅ All Spotify fields present in User model")
                self.log_test("User Model Spotify Fields", True, f"All {len(spotify_fields)} Spotify fields present")
                return True
            else:
                self.log_test("User Model Spotify Fields", False, f"Missing fields: {missing_fields}")
                return False
        return success

    def test_authentication_requirements(self):
        """Test that all Spotify endpoints require authentication"""
        print("\n" + "=" * 50)
        print("🎵 TEST 8: Authentication Requirements")
        print("=" * 50)
        
        endpoints_to_test = [
            ("spotify/auth-url", "GET"),
            ("spotify/search?q=test", "GET"),
            ("spotify/top-tracks", "GET"),
            ("spotify/set-vibe-song", "POST"),
            ("spotify/disconnect", "DELETE")
        ]
        
        all_passed = True
        
        for endpoint, method in endpoints_to_test:
            print(f"\n   Testing {method} {endpoint} without auth...")
            success, response_data, response = self.run_test(
                f"Auth Required - {method} {endpoint}", 
                method, 
                endpoint, 
                401,  # Should require authentication
                use_cookies=False
            )
            
            if not success:
                print(f"   ❌ {endpoint} did not require authentication")
                all_passed = False
            else:
                print(f"   ✅ {endpoint} correctly requires authentication")
        
        if all_passed:
            self.log_test("Spotify Endpoints Auth Requirements", True, "All endpoints require authentication")
        else:
            self.log_test("Spotify Endpoints Auth Requirements", False, "Some endpoints don't require authentication")
        
        return all_passed

    def run_comprehensive_spotify_test(self):
        """Run comprehensive Spotify integration tests"""
        print("🚀 Starting Spotify Integration Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)

        # Step 1: Setup Authentication
        print("\n" + "=" * 50)
        print("🔐 STEP 1: Authentication Setup")
        print("=" * 50)
        
        if not self.setup_authentication():
            print("❌ Cannot continue without authentication")
            return 1

        # Step 2: Test Authentication Requirements
        print("\n" + "=" * 50)
        print("🔒 STEP 2: Authentication Requirements")
        print("=" * 50)
        
        # First test without auth, then with auth
        self.test_authentication_requirements()

        # Step 3: Test Spotify Auth URL Generation
        print("\n" + "=" * 50)
        print("🔗 STEP 3: Spotify OAuth URL Generation")
        print("=" * 50)
        
        self.test_spotify_auth_url()

        # Step 4: Test Spotify Callback Handling
        print("\n" + "=" * 50)
        print("🔄 STEP 4: Spotify OAuth Callback Handling")
        print("=" * 50)
        
        self.test_spotify_callback_no_code()
        self.test_spotify_callback_invalid_code()

        # Step 5: Test Spotify Search (Not Connected)
        print("\n" + "=" * 50)
        print("🔍 STEP 5: Spotify Search (User Not Connected)")
        print("=" * 50)
        
        self.test_spotify_search_not_connected()
        self.test_spotify_search_no_query()

        # Step 6: Test Spotify Top Tracks (Not Connected)
        print("\n" + "=" * 50)
        print("🎵 STEP 6: Spotify Top Tracks (User Not Connected)")
        print("=" * 50)
        
        self.test_spotify_top_tracks_not_connected()

        # Step 7: Test Set Vibe Song
        print("\n" + "=" * 50)
        print("💖 STEP 7: Set Vibe Song")
        print("=" * 50)
        
        self.test_set_vibe_song_no_data()
        self.test_set_vibe_song_valid_data()

        # Step 8: Test Spotify Disconnect
        print("\n" + "=" * 50)
        print("🔌 STEP 8: Spotify Disconnect")
        print("=" * 50)
        
        self.test_spotify_disconnect()

        # Step 9: Test User Model Spotify Fields
        print("\n" + "=" * 50)
        print("👤 STEP 9: User Model Spotify Fields")
        print("=" * 50)
        
        self.test_user_model_spotify_fields()

        # Print final summary
        print("\n" + "=" * 60)
        print("📊 SPOTIFY INTEGRATION TEST SUMMARY")
        print("=" * 60)
        
        passed_tests = [result for result in self.test_results if result["success"]]
        failed_tests = [result for result in self.test_results if not result["success"]]
        
        print(f"✅ PASSED: {len(passed_tests)}/{self.tests_run} tests")
        print(f"❌ FAILED: {len(failed_tests)}/{self.tests_run} tests")
        
        if failed_tests:
            print("\n❌ Failed Tests Details:")
            for result in failed_tests:
                print(f"   - {result['test']}: {result['details']}")
        
        # Detailed analysis
        print("\n" + "=" * 60)
        print("📋 DETAILED ANALYSIS")
        print("=" * 60)
        
        print("\n🎯 Expected Results Analysis:")
        print("✅ Auth URL endpoint should work without Spotify connection")
        print("✅ Search/top-tracks should fail with proper error when not connected")
        print("✅ Set vibe song should work with valid data structure")
        print("✅ All endpoints should require authentication")
        print("✅ User model should include all Spotify fields")
        print("✅ Error messages should be clear and informative")
        
        # Return status
        if len(failed_tests) == 0:
            print("\n🎉 SPOTIFY INTEGRATION TEST: PASS")
            return 0
        else:
            print(f"\n⚠️  SPOTIFY INTEGRATION TEST: FAIL ({len(failed_tests)} issues)")
            return 1

if __name__ == "__main__":
    tester = SpotifyIntegrationTester()
    exit_code = tester.run_comprehensive_spotify_test()
    sys.exit(exit_code)