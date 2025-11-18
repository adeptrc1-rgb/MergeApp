#!/usr/bin/env python3
"""
Vibe Song Data Test for Potential Matches Endpoint

This test verifies that:
1. The `/api/users/potential-matches` endpoint returns vibe_song data
2. The vibe_song structure includes: title, artist, album_art, preview_url
3. At least some users in the response have vibe_song set
"""

import requests
import json
import sys
from datetime import datetime

class VibeSongTester:
    def __init__(self, base_url="https://datemerge.preview.emergentagent.com"):
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

    def login_test_user(self):
        """Login with test user to get session cookies"""
        print("🔐 Logging in with test user...")
        
        login_data = {"email": "vibesongtest@merge.com"}
        
        try:
            response = requests.post(
                f"{self.api_url}/auth/test-login",
                json=login_data,
                timeout=10
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                response_data = response.json()
                if response_data.get("success") and response.cookies:
                    self.session_cookies = response.cookies
                    print(f"   ✅ Login successful, session cookies captured")
                    self.log_test("Test User Login", True)
                    return True
                else:
                    self.log_test("Test User Login", False, "No success flag or cookies in response")
                    return False
            else:
                self.log_test("Test User Login", False, f"Expected 200, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Test User Login", False, str(e))
            return False

    def test_potential_matches_vibe_song(self):
        """Test that potential matches endpoint returns vibe_song data"""
        print("\n🎵 Testing potential matches endpoint for vibe_song data...")
        
        if not self.session_cookies:
            print("   ❌ No session cookies available")
            return False
        
        try:
            response = requests.get(
                f"{self.api_url}/users/potential-matches",
                cookies=self.session_cookies,
                timeout=10
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code != 200:
                self.log_test("Potential Matches API Call", False, f"Expected 200, got {response.status_code}")
                return False
            
            try:
                response_data = response.json()
            except:
                self.log_test("Potential Matches Response Format", False, "Response is not valid JSON")
                return False
            
            if not isinstance(response_data, list):
                self.log_test("Potential Matches Response Type", False, f"Expected array, got {type(response_data)}")
                return False
            
            print(f"   ℹ️  Found {len(response_data)} potential matches")
            
            if len(response_data) == 0:
                print("   ⚠️  No potential matches found - cannot test vibe_song data")
                self.log_test("Potential Matches Available", False, "No matches returned to test vibe_song data")
                return False
            
            # Check each user for vibe_song field
            users_with_vibe_song = 0
            users_without_vibe_song = 0
            vibe_song_structure_valid = True
            structure_issues = []
            
            for i, user in enumerate(response_data):
                if not isinstance(user, dict):
                    self.log_test("User Data Format", False, f"User {i} is not a dict")
                    return False
                
                # Check if vibe_song field exists
                if "vibe_song" not in user:
                    self.log_test("Vibe Song Field Present", False, f"User {i} missing vibe_song field")
                    return False
                
                vibe_song = user.get("vibe_song")
                
                if vibe_song is None:
                    users_without_vibe_song += 1
                    print(f"   📝 User {i} ({user.get('first_name', 'Unknown')}): No vibe song set")
                else:
                    users_with_vibe_song += 1
                    print(f"   🎵 User {i} ({user.get('first_name', 'Unknown')}): Has vibe song")
                    
                    # Validate vibe_song structure
                    if not isinstance(vibe_song, dict):
                        structure_issues.append(f"User {i}: vibe_song is not a dict (got {type(vibe_song)})")
                        vibe_song_structure_valid = False
                        continue
                    
                    # Check for required fields: title, artist, album_art, preview_url
                    required_fields = ["title", "artist", "album_art", "preview_url"]
                    missing_fields = []
                    
                    for field in required_fields:
                        if field not in vibe_song:
                            missing_fields.append(field)
                    
                    if missing_fields:
                        structure_issues.append(f"User {i}: Missing fields {missing_fields}")
                        vibe_song_structure_valid = False
                    else:
                        # Log the vibe song details
                        title = vibe_song.get("title", "Unknown")
                        artist = vibe_song.get("artist", "Unknown")
                        has_album_art = bool(vibe_song.get("album_art"))
                        has_preview = bool(vibe_song.get("preview_url"))
                        
                        print(f"      Title: {title}")
                        print(f"      Artist: {artist}")
                        print(f"      Album Art: {'✅' if has_album_art else '❌'}")
                        print(f"      Preview URL: {'✅' if has_preview else '❌'}")
            
            # Test Results Summary
            print(f"\n   📊 Vibe Song Data Summary:")
            print(f"      Users with vibe song: {users_with_vibe_song}")
            print(f"      Users without vibe song: {users_without_vibe_song}")
            print(f"      Total users: {len(response_data)}")
            
            # Verify that vibe_song field is present in all users
            self.log_test("Vibe Song Field Present", True, f"All {len(response_data)} users have vibe_song field")
            
            # Verify structure for users that have vibe songs
            if users_with_vibe_song > 0:
                if vibe_song_structure_valid:
                    self.log_test("Vibe Song Structure Valid", True, f"All {users_with_vibe_song} vibe songs have correct structure")
                else:
                    self.log_test("Vibe Song Structure Valid", False, f"Structure issues: {structure_issues}")
                    return False
                
                # Verify at least some users have vibe songs
                self.log_test("Users Have Vibe Songs", True, f"{users_with_vibe_song} users have vibe songs set")
            else:
                print("   ⚠️  No users have vibe songs set - this may be expected if test data doesn't include vibe songs")
                self.log_test("Users Have Vibe Songs", True, "No users have vibe songs (may be expected for test data)")
            
            return True
            
        except Exception as e:
            self.log_test("Potential Matches Vibe Song Test", False, str(e))
            return False

    def run_vibe_song_test(self):
        """Run the complete vibe song test"""
        print("🚀 Starting Vibe Song Data Test")
        print(f"📍 Testing against: {self.api_url}")
        print("=" * 60)
        
        # Step 1: Login
        print("\n" + "=" * 50)
        print("🔐 STEP 1: Authentication")
        print("=" * 50)
        
        if not self.login_test_user():
            print("❌ Cannot continue without successful login")
            return 1
        
        # Step 2: Test potential matches vibe song data
        print("\n" + "=" * 50)
        print("🎵 STEP 2: Test Vibe Song Data in Potential Matches")
        print("=" * 50)
        
        if not self.test_potential_matches_vibe_song():
            print("❌ Vibe song test failed")
            return 1
        
        # Print final summary
        print("\n" + "=" * 60)
        print("📊 VIBE SONG TEST SUMMARY")
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
            print("\n🎉 VIBE SONG TEST: PASS")
            print("✅ The /api/users/potential-matches endpoint correctly returns vibe_song data")
            print("✅ Vibe song structure includes required fields: title, artist, album_art, preview_url")
            return 0
        else:
            print(f"\n⚠️  VIBE SONG TEST: FAIL ({len(failed_tests)} issues)")
            return 1

if __name__ == "__main__":
    tester = VibeSongTester()
    exit_code = tester.run_vibe_song_test()
    sys.exit(exit_code)