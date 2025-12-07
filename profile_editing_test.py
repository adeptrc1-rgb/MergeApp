#!/usr/bin/env python3
"""
Profile Editing Features Test Suite
Tests the new profile editing endpoints:
1. PUT /api/users/me - Updated profile fields
2. POST /api/users/photos/upload - Cloudinary photo upload
3. PUT /api/users/photos - Update user's photo array
"""

import requests
import json
import sys
import io
from datetime import datetime
import time

class ProfileEditingTester:
    def __init__(self, base_url="https://merge-elite-app.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_cookies = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.uploaded_photos = []  # Track uploaded photos for cleanup

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

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {}
        
        if headers:
            test_headers.update(headers)
        
        # Don't set Content-Type for file uploads
        if not files and 'Content-Type' not in test_headers:
            test_headers['Content-Type'] = 'application/json'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        
        try:
            cookies = self.session_cookies
            
            if method == 'GET':
                response = requests.get(url, headers=test_headers, cookies=cookies, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, headers=test_headers, cookies=cookies, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=test_headers, cookies=cookies, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, cookies=cookies, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, cookies=cookies, timeout=30)

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
        """Setup authentication by logging in"""
        print("🔐 Setting up authentication...")
        
        login_data = {"email": "profiletest@merge.com"}
        success, response_data, response = self.run_test(
            "Test Login for Profile Editing", 
            "POST", 
            "auth/test-login", 
            200, 
            data=login_data
        )
        
        if not success:
            print("❌ Cannot continue without successful login")
            return False
            
        # Store cookies for subsequent tests
        if response and response.cookies:
            self.session_cookies = response.cookies
            print(f"   ✅ Session cookies captured successfully")
            
            # Get user ID from response
            if isinstance(response_data, dict) and "user" in response_data:
                self.user_id = response_data["user"].get("id")
                print(f"   ✅ User ID: {self.user_id}")
            
            return True
        else:
            print("   ❌ No cookies received from login")
            return False

    def test_get_current_user_profile(self):
        """Test getting current user profile to see baseline"""
        print("\n📋 Testing current user profile retrieval...")
        
        success, response_data, response = self.run_test(
            "Get Current User Profile",
            "GET",
            "auth/me",
            200
        )
        
        if success and isinstance(response_data, dict):
            print(f"   ℹ️  Current profile fields: {list(response_data.keys())}")
            
            # Check for profile editing fields
            profile_fields = [
                'first_name', 'industry', 'job_title', 'location', 
                'hometown', 'education', 'show_age', 'show_distance', 
                'discovery_enabled', 'bio', 'interests', 'photos'
            ]
            
            existing_fields = [field for field in profile_fields if field in response_data]
            print(f"   ℹ️  Profile editing fields present: {existing_fields}")
            
            return True, response_data
        
        return False, {}

    def test_update_basic_profile_info(self):
        """Test updating basic profile information"""
        print("\n👤 Testing basic profile info update...")
        
        # Test data for basic profile fields
        update_data = {
            "first_name": "Alex",
            "industry": "Technology",
            "job_title": "Software Engineer",
            "location": "San Francisco, CA",
            "hometown": "Portland, OR",
            "education": "Stanford University"
        }
        
        success, response_data, response = self.run_test(
            "Update Basic Profile Info",
            "PUT",
            "users/me",
            200,
            data=update_data
        )
        
        if success and isinstance(response_data, dict):
            if response_data.get("success"):
                print("   ✅ Basic profile info updated successfully")
                
                # Verify the update by getting the profile again
                verify_success, verify_data, _ = self.run_test(
                    "Verify Basic Profile Update",
                    "GET",
                    "auth/me",
                    200
                )
                
                if verify_success and isinstance(verify_data, dict):
                    # Check if the fields were actually updated
                    updated_correctly = True
                    for field, expected_value in update_data.items():
                        actual_value = verify_data.get(field)
                        if actual_value != expected_value:
                            print(f"   ❌ Field {field}: expected '{expected_value}', got '{actual_value}'")
                            updated_correctly = False
                        else:
                            print(f"   ✅ Field {field}: '{actual_value}'")
                    
                    if updated_correctly:
                        self.log_test("Basic Profile Fields Persistence", True)
                        return True
                    else:
                        self.log_test("Basic Profile Fields Persistence", False, "Some fields not updated correctly")
                        return False
                else:
                    self.log_test("Basic Profile Update Verification", False, "Could not verify update")
                    return False
            else:
                self.log_test("Basic Profile Update Response", False, "Success field not true")
                return False
        
        return False

    def test_update_discovery_settings(self):
        """Test updating discovery settings"""
        print("\n🔍 Testing discovery settings update...")
        
        # Test data for discovery settings
        discovery_data = {
            "show_age": False,
            "show_distance": True,
            "discovery_enabled": True
        }
        
        success, response_data, response = self.run_test(
            "Update Discovery Settings",
            "PUT",
            "users/me",
            200,
            data=discovery_data
        )
        
        if success and isinstance(response_data, dict):
            if response_data.get("success"):
                print("   ✅ Discovery settings updated successfully")
                
                # Verify the update
                verify_success, verify_data, _ = self.run_test(
                    "Verify Discovery Settings Update",
                    "GET",
                    "auth/me",
                    200
                )
                
                if verify_success and isinstance(verify_data, dict):
                    # Check if the discovery settings were updated
                    updated_correctly = True
                    for field, expected_value in discovery_data.items():
                        actual_value = verify_data.get(field)
                        if actual_value != expected_value:
                            print(f"   ❌ Setting {field}: expected {expected_value}, got {actual_value}")
                            updated_correctly = False
                        else:
                            print(f"   ✅ Setting {field}: {actual_value}")
                    
                    if updated_correctly:
                        self.log_test("Discovery Settings Persistence", True)
                        return True
                    else:
                        self.log_test("Discovery Settings Persistence", False, "Some settings not updated correctly")
                        return False
                else:
                    self.log_test("Discovery Settings Update Verification", False, "Could not verify update")
                    return False
            else:
                self.log_test("Discovery Settings Update Response", False, "Success field not true")
                return False
        
        return False

    def test_update_bio_and_interests(self):
        """Test updating bio and interests (original fields)"""
        print("\n📝 Testing bio and interests update...")
        
        # Test data for bio and interests
        bio_interests_data = {
            "bio": "Passionate software engineer who loves hiking, photography, and exploring new technologies. Always up for a good conversation about AI, startups, or the best coffee spots in the city.",
            "interests": ["technology", "hiking", "photography", "coffee", "artificial intelligence", "startups"]
        }
        
        success, response_data, response = self.run_test(
            "Update Bio and Interests",
            "PUT",
            "users/me",
            200,
            data=bio_interests_data
        )
        
        if success and isinstance(response_data, dict):
            if response_data.get("success"):
                print("   ✅ Bio and interests updated successfully")
                
                # Verify the update
                verify_success, verify_data, _ = self.run_test(
                    "Verify Bio and Interests Update",
                    "GET",
                    "auth/me",
                    200
                )
                
                if verify_success and isinstance(verify_data, dict):
                    # Check bio
                    actual_bio = verify_data.get("bio")
                    expected_bio = bio_interests_data["bio"]
                    if actual_bio == expected_bio:
                        print(f"   ✅ Bio updated correctly: {actual_bio[:50]}...")
                    else:
                        print(f"   ❌ Bio mismatch: expected '{expected_bio[:50]}...', got '{actual_bio[:50] if actual_bio else None}...'")
                        self.log_test("Bio Update Persistence", False, "Bio not updated correctly")
                        return False
                    
                    # Check interests
                    actual_interests = verify_data.get("interests", [])
                    expected_interests = bio_interests_data["interests"]
                    if set(actual_interests) == set(expected_interests):
                        print(f"   ✅ Interests updated correctly: {actual_interests}")
                        self.log_test("Bio and Interests Persistence", True)
                        return True
                    else:
                        print(f"   ❌ Interests mismatch: expected {expected_interests}, got {actual_interests}")
                        self.log_test("Interests Update Persistence", False, "Interests not updated correctly")
                        return False
                else:
                    self.log_test("Bio and Interests Update Verification", False, "Could not verify update")
                    return False
            else:
                self.log_test("Bio and Interests Update Response", False, "Success field not true")
                return False
        
        return False

    def test_photo_upload_to_cloudinary(self):
        """Test photo upload to Cloudinary"""
        print("\n📸 Testing photo upload to Cloudinary...")
        
        # Create a simple test image (1x1 pixel PNG)
        # This is a minimal valid PNG file
        png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xdd\x8d\xb4\x1c\x00\x00\x00\x00IEND\xaeB`\x82'
        
        # Create file-like object
        test_file = io.BytesIO(png_data)
        test_file.name = 'test_profile_photo.png'
        
        files = {
            'file': ('test_profile_photo.png', test_file, 'image/png')
        }
        
        success, response_data, response = self.run_test(
            "Upload Photo to Cloudinary",
            "POST",
            "users/photos/upload",
            200,
            files=files
        )
        
        if success and isinstance(response_data, dict):
            if response_data.get("success"):
                photo_url = response_data.get("url")
                public_id = response_data.get("public_id")
                
                if photo_url and public_id:
                    print(f"   ✅ Photo uploaded successfully")
                    print(f"   ℹ️  Photo URL: {photo_url}")
                    print(f"   ℹ️  Public ID: {public_id}")
                    
                    # Store for later use and cleanup
                    self.uploaded_photos.append({
                        "url": photo_url,
                        "public_id": public_id
                    })
                    
                    # Verify the URL is accessible
                    try:
                        photo_response = requests.get(photo_url, timeout=10)
                        if photo_response.status_code == 200:
                            print(f"   ✅ Photo URL is accessible (status: {photo_response.status_code})")
                            self.log_test("Photo Upload and Accessibility", True)
                            return True, photo_url
                        else:
                            print(f"   ❌ Photo URL not accessible (status: {photo_response.status_code})")
                            self.log_test("Photo URL Accessibility", False, f"Status: {photo_response.status_code}")
                            return False, None
                    except Exception as e:
                        print(f"   ❌ Error accessing photo URL: {e}")
                        self.log_test("Photo URL Accessibility", False, str(e))
                        return False, None
                else:
                    self.log_test("Photo Upload Response Fields", False, "Missing URL or public_id in response")
                    return False, None
            else:
                self.log_test("Photo Upload Response", False, "Success field not true")
                return False, None
        
        return False, None

    def test_update_user_photos_array(self):
        """Test updating user's photo array"""
        print("\n🖼️  Testing user photos array update...")
        
        # First, upload a couple of photos
        photo_urls = []
        
        for i in range(2):
            print(f"\n   📸 Uploading test photo {i+1}...")
            
            # Create test image
            png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xdd\x8d\xb4\x1c\x00\x00\x00\x00IEND\xaeB`\x82'
            test_file = io.BytesIO(png_data)
            test_file.name = f'test_photo_{i+1}.png'
            
            files = {
                'file': (f'test_photo_{i+1}.png', test_file, 'image/png')
            }
            
            upload_success, upload_data, _ = self.run_test(
                f"Upload Test Photo {i+1}",
                "POST",
                "users/photos/upload",
                200,
                files=files
            )
            
            if upload_success and isinstance(upload_data, dict) and upload_data.get("success"):
                photo_url = upload_data.get("url")
                public_id = upload_data.get("public_id")
                
                if photo_url:
                    photo_urls.append(photo_url)
                    self.uploaded_photos.append({
                        "url": photo_url,
                        "public_id": public_id
                    })
                    print(f"   ✅ Photo {i+1} uploaded: {photo_url}")
                else:
                    print(f"   ❌ Photo {i+1} upload failed: no URL returned")
                    return False
            else:
                print(f"   ❌ Photo {i+1} upload failed")
                return False
        
        if len(photo_urls) < 2:
            print("   ❌ Could not upload enough photos for array test")
            return False
        
        # Now test updating the photos array
        print(f"\n   🔄 Updating photos array with {len(photo_urls)} photos...")
        
        photos_data = {
            "photos": photo_urls
        }
        
        success, response_data, response = self.run_test(
            "Update User Photos Array",
            "PUT",
            "users/photos",
            200,
            data=photos_data
        )
        
        if success and isinstance(response_data, dict):
            if response_data.get("success"):
                returned_photos = response_data.get("photos", [])
                
                if set(returned_photos) == set(photo_urls):
                    print(f"   ✅ Photos array updated successfully")
                    print(f"   ℹ️  Photos in array: {len(returned_photos)}")
                    
                    # Verify by getting user profile
                    verify_success, verify_data, _ = self.run_test(
                        "Verify Photos Array Update",
                        "GET",
                        "auth/me",
                        200
                    )
                    
                    if verify_success and isinstance(verify_data, dict):
                        profile_photos = verify_data.get("photos", [])
                        
                        if set(profile_photos) == set(photo_urls):
                            print(f"   ✅ Photos array persisted correctly in profile")
                            self.log_test("Photos Array Update and Persistence", True)
                            return True
                        else:
                            print(f"   ❌ Photos array mismatch in profile")
                            print(f"       Expected: {photo_urls}")
                            print(f"       Got: {profile_photos}")
                            self.log_test("Photos Array Persistence", False, "Photos array not persisted correctly")
                            return False
                    else:
                        self.log_test("Photos Array Update Verification", False, "Could not verify photos array update")
                        return False
                else:
                    print(f"   ❌ Photos array mismatch in response")
                    print(f"       Expected: {photo_urls}")
                    print(f"       Got: {returned_photos}")
                    self.log_test("Photos Array Response", False, "Returned photos don't match input")
                    return False
            else:
                self.log_test("Photos Array Update Response", False, "Success field not true")
                return False
        
        return False

    def test_photos_array_validation(self):
        """Test photos array validation (max 6 photos)"""
        print("\n🚫 Testing photos array validation...")
        
        # Test with more than 6 photos (should fail)
        too_many_photos = [
            "https://example.com/photo1.jpg",
            "https://example.com/photo2.jpg", 
            "https://example.com/photo3.jpg",
            "https://example.com/photo4.jpg",
            "https://example.com/photo5.jpg",
            "https://example.com/photo6.jpg",
            "https://example.com/photo7.jpg"  # This should cause failure
        ]
        
        photos_data = {
            "photos": too_many_photos
        }
        
        success, response_data, response = self.run_test(
            "Update Photos Array (Too Many Photos)",
            "PUT",
            "users/photos",
            400,  # Expect 400 Bad Request
            data=photos_data
        )
        
        if success:
            # Check if error message mentions the limit
            if isinstance(response_data, dict):
                error_detail = response_data.get("detail", "")
                if "6 photos" in error_detail or "Maximum" in error_detail:
                    print(f"   ✅ Correctly rejected >6 photos with appropriate error: {error_detail}")
                    self.log_test("Photos Array Max Validation", True)
                    return True
                else:
                    print(f"   ⚠️  Rejected >6 photos but error message unclear: {error_detail}")
                    self.log_test("Photos Array Max Validation", True, "Validation works but error message could be clearer")
                    return True
            else:
                print(f"   ✅ Correctly rejected >6 photos")
                self.log_test("Photos Array Max Validation", True)
                return True
        else:
            self.log_test("Photos Array Max Validation", False, "Did not reject >6 photos")
            return False

    def test_invalid_photo_array_format(self):
        """Test invalid photo array format"""
        print("\n❌ Testing invalid photo array format...")
        
        # Test with non-array data
        invalid_data = {
            "photos": "not_an_array"
        }
        
        success, response_data, response = self.run_test(
            "Update Photos Array (Invalid Format)",
            "PUT",
            "users/photos",
            400,  # Expect 400 Bad Request
            data=invalid_data
        )
        
        if success:
            print(f"   ✅ Correctly rejected invalid photos format")
            self.log_test("Photos Array Format Validation", True)
            return True
        else:
            self.log_test("Photos Array Format Validation", False, "Did not reject invalid photos format")
            return False

    def test_comprehensive_profile_update(self):
        """Test updating all profile fields at once"""
        print("\n🔄 Testing comprehensive profile update...")
        
        # Upload a photo first
        photo_success, photo_url = self.test_photo_upload_to_cloudinary()
        
        if not photo_success:
            print("   ⚠️  Could not upload photo for comprehensive test, continuing without photo")
            photo_url = None
        
        # Comprehensive update data
        comprehensive_data = {
            "first_name": "Jordan",
            "industry": "Design",
            "job_title": "UX Designer", 
            "location": "Austin, TX",
            "hometown": "Denver, CO",
            "education": "Art Center College of Design",
            "show_age": True,
            "show_distance": False,
            "discovery_enabled": True,
            "bio": "Creative UX designer passionate about human-centered design and accessibility. Love exploring new cities, trying local coffee shops, and weekend hiking adventures.",
            "interests": ["design", "ux", "accessibility", "coffee", "hiking", "travel", "art", "photography"]
        }
        
        success, response_data, response = self.run_test(
            "Comprehensive Profile Update",
            "PUT",
            "users/me",
            200,
            data=comprehensive_data
        )
        
        if success and isinstance(response_data, dict):
            if response_data.get("success"):
                print("   ✅ Comprehensive profile update successful")
                
                # Verify all fields were updated
                verify_success, verify_data, _ = self.run_test(
                    "Verify Comprehensive Profile Update",
                    "GET",
                    "auth/me",
                    200
                )
                
                if verify_success and isinstance(verify_data, dict):
                    all_correct = True
                    
                    for field, expected_value in comprehensive_data.items():
                        actual_value = verify_data.get(field)
                        
                        if field == "interests":
                            # For interests, check if sets match (order doesn't matter)
                            if set(actual_value or []) == set(expected_value):
                                print(f"   ✅ {field}: {actual_value}")
                            else:
                                print(f"   ❌ {field}: expected {expected_value}, got {actual_value}")
                                all_correct = False
                        else:
                            if actual_value == expected_value:
                                print(f"   ✅ {field}: {actual_value}")
                            else:
                                print(f"   ❌ {field}: expected '{expected_value}', got '{actual_value}'")
                                all_correct = False
                    
                    if all_correct:
                        self.log_test("Comprehensive Profile Update Persistence", True)
                        return True
                    else:
                        self.log_test("Comprehensive Profile Update Persistence", False, "Some fields not updated correctly")
                        return False
                else:
                    self.log_test("Comprehensive Profile Update Verification", False, "Could not verify update")
                    return False
            else:
                self.log_test("Comprehensive Profile Update Response", False, "Success field not true")
                return False
        
        return False

    def cleanup_uploaded_photos(self):
        """Clean up uploaded photos from Cloudinary"""
        print("\n🧹 Cleaning up uploaded photos...")
        
        for photo in self.uploaded_photos:
            public_id = photo.get("public_id")
            if public_id:
                try:
                    # Try to delete from Cloudinary
                    success, response_data, response = self.run_test(
                        f"Delete Photo {public_id}",
                        "DELETE",
                        f"users/photos/{public_id}",
                        200
                    )
                    
                    if success:
                        print(f"   ✅ Deleted photo: {public_id}")
                    else:
                        print(f"   ⚠️  Could not delete photo: {public_id}")
                except Exception as e:
                    print(f"   ⚠️  Error deleting photo {public_id}: {e}")

    def run_profile_editing_tests(self):
        """Run all profile editing tests"""
        print("🚀 Starting Profile Editing Features Test Suite")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 80)

        # Step 1: Authentication Setup
        print("\n" + "=" * 60)
        print("🔐 STEP 1: Authentication Setup")
        print("=" * 60)
        
        if not self.setup_authentication():
            print("❌ Cannot continue without authentication")
            return 1

        # Step 2: Get baseline profile
        print("\n" + "=" * 60)
        print("📋 STEP 2: Baseline Profile Check")
        print("=" * 60)
        
        baseline_success, baseline_data = self.test_get_current_user_profile()
        if not baseline_success:
            print("❌ Could not get baseline profile")
            return 1

        # Step 3: Test basic profile info update
        print("\n" + "=" * 60)
        print("👤 STEP 3: Basic Profile Info Update")
        print("=" * 60)
        
        if not self.test_update_basic_profile_info():
            print("❌ Basic profile info update failed")

        # Step 4: Test discovery settings update
        print("\n" + "=" * 60)
        print("🔍 STEP 4: Discovery Settings Update")
        print("=" * 60)
        
        if not self.test_update_discovery_settings():
            print("❌ Discovery settings update failed")

        # Step 5: Test bio and interests update
        print("\n" + "=" * 60)
        print("📝 STEP 5: Bio and Interests Update")
        print("=" * 60)
        
        if not self.test_update_bio_and_interests():
            print("❌ Bio and interests update failed")

        # Step 6: Test photo upload
        print("\n" + "=" * 60)
        print("📸 STEP 6: Photo Upload to Cloudinary")
        print("=" * 60)
        
        photo_success, photo_url = self.test_photo_upload_to_cloudinary()
        if not photo_success:
            print("❌ Photo upload failed")

        # Step 7: Test photos array update
        print("\n" + "=" * 60)
        print("🖼️  STEP 7: Photos Array Update")
        print("=" * 60)
        
        if not self.test_update_user_photos_array():
            print("❌ Photos array update failed")

        # Step 8: Test photos array validation
        print("\n" + "=" * 60)
        print("🚫 STEP 8: Photos Array Validation")
        print("=" * 60)
        
        if not self.test_photos_array_validation():
            print("❌ Photos array validation failed")
        
        if not self.test_invalid_photo_array_format():
            print("❌ Invalid photo array format test failed")

        # Step 9: Test comprehensive profile update
        print("\n" + "=" * 60)
        print("🔄 STEP 9: Comprehensive Profile Update")
        print("=" * 60)
        
        if not self.test_comprehensive_profile_update():
            print("❌ Comprehensive profile update failed")

        # Step 10: Cleanup
        print("\n" + "=" * 60)
        print("🧹 STEP 10: Cleanup")
        print("=" * 60)
        
        self.cleanup_uploaded_photos()

        # Print final summary
        print("\n" + "=" * 80)
        print("📊 PROFILE EDITING TESTS SUMMARY")
        print("=" * 80)
        
        passed_tests = [result for result in self.test_results if result["success"]]
        failed_tests = [result for result in self.test_results if not result["success"]]
        
        print(f"✅ PASSED: {len(passed_tests)}/{self.tests_run} tests")
        print(f"❌ FAILED: {len(failed_tests)}/{self.tests_run} tests")
        
        if failed_tests:
            print("\n❌ Failed Tests Details:")
            for result in failed_tests:
                print(f"   - {result['test']}: {result['details']}")
        
        # Test Results Summary
        print("\n📋 Test Results by Category:")
        print("=" * 50)
        
        categories = {
            "Authentication": ["Test Login", "Get Current User"],
            "Basic Profile": ["Update Basic Profile", "Verify Basic Profile"],
            "Discovery Settings": ["Update Discovery Settings", "Verify Discovery Settings"],
            "Bio & Interests": ["Update Bio and Interests", "Verify Bio and Interests"],
            "Photo Upload": ["Upload Photo", "Photo URL Accessibility"],
            "Photos Array": ["Update User Photos Array", "Photos Array Update and Persistence"],
            "Validation": ["Photos Array Max Validation", "Photos Array Format Validation"],
            "Comprehensive": ["Comprehensive Profile Update", "Comprehensive Profile Update Persistence"]
        }
        
        for category, test_keywords in categories.items():
            category_tests = [r for r in self.test_results if any(keyword in r["test"] for keyword in test_keywords)]
            category_passed = len([r for r in category_tests if r["success"]])
            category_total = len(category_tests)
            
            if category_total > 0:
                status = "✅" if category_passed == category_total else "❌" if category_passed == 0 else "⚠️"
                print(f"   {status} {category}: {category_passed}/{category_total}")

        # Return status
        if len(failed_tests) == 0:
            print("\n🎉 PROFILE EDITING TESTS: ALL PASSED")
            return 0
        else:
            print(f"\n⚠️  PROFILE EDITING TESTS: {len(failed_tests)} FAILURES")
            return 1


def main():
    """Main function to run the profile editing tests"""
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = "https://merge-elite-app.preview.emergentagent.com"
    
    tester = ProfileEditingTester(base_url)
    return tester.run_profile_editing_tests()


if __name__ == "__main__":
    sys.exit(main())