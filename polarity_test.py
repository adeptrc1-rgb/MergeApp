#!/usr/bin/env python3
"""
Quick test to verify polarity bonus compatibility system
"""
import requests
import json

def test_polarity_bonus():
    base_url = "https://cosmic-dating.preview.emergentagent.com/api"
    
    # Step 1: Login
    print("🔐 Logging in...")
    login_response = requests.post(f"{base_url}/auth/test-login", 
                                 json={"email": "testuser@asign.com"})
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        return
    
    cookies = login_response.cookies
    print("✅ Login successful")
    
    # Step 2: Get current user data
    print("\n🔍 Getting current user data...")
    me_response = requests.get(f"{base_url}/auth/me", cookies=cookies)
    
    if me_response.status_code != 200:
        print(f"❌ Failed to get user data: {me_response.status_code}")
        return
    
    user_data = me_response.json()
    current_sun = user_data.get("zodiac_sign")
    current_moon = user_data.get("moon_sign")
    current_rising = user_data.get("rising_sign")
    
    print(f"✅ Current user signs:")
    print(f"   Sun: {current_sun}")
    print(f"   Moon: {current_moon}")
    print(f"   Rising: {current_rising}")
    
    # Step 3: Get potential matches
    print("\n💕 Getting potential matches...")
    matches_response = requests.get(f"{base_url}/users/potential-matches", cookies=cookies)
    
    if matches_response.status_code != 200:
        print(f"❌ Failed to get matches: {matches_response.status_code}")
        return
    
    matches = matches_response.json()
    print(f"✅ Found {len(matches)} potential matches")
    
    # Step 4: Analyze polarity relationships
    print("\n🔍 Analyzing polarity relationships...")
    
    # Polarity pairs (opposite signs)
    polar_pairs = {
        "Aries": "Libra", "Taurus": "Scorpio", "Gemini": "Sagittarius",
        "Cancer": "Capricorn", "Leo": "Aquarius", "Virgo": "Pisces",
        "Libra": "Aries", "Scorpio": "Taurus", "Sagittarius": "Gemini",
        "Capricorn": "Cancer", "Aquarius": "Leo", "Pisces": "Virgo"
    }
    
    base_scores = []
    enhanced_scores = []
    polarity_examples = []
    
    for match in matches[:20]:  # Check first 20 matches
        comp_score = match.get("compatibility_score", 0)
        match_sun = match.get("zodiac_sign")
        match_moon = match.get("moon_sign")
        match_rising = match.get("rising_sign")
        
        # Check for polarity relationships
        sun_polarity = (current_sun and match_sun and 
                       polar_pairs.get(current_sun) == match_sun)
        moon_polarity = (current_moon and match_moon and 
                        polar_pairs.get(current_moon) == match_moon)
        rising_polarity = (current_rising and match_rising and 
                          polar_pairs.get(current_rising) == match_rising)
        
        polarity_count = sum([sun_polarity, moon_polarity, rising_polarity])
        
        if polarity_count > 0:
            enhanced_scores.append(comp_score)
            polarity_types = []
            if sun_polarity:
                polarity_types.append("Sun")
            if moon_polarity:
                polarity_types.append("Moon")
            if rising_polarity:
                polarity_types.append("Rising")
            
            polarity_examples.append({
                'name': match.get('first_name'),
                'score': comp_score,
                'sun': match_sun,
                'moon': match_moon,
                'rising': match_rising,
                'polarity_types': polarity_types
            })
            
            print(f"🌟 {match.get('first_name')}: {comp_score} (Polarity: {'+'.join(polarity_types)})")
            print(f"   Signs: {match_sun}/{match_moon}/{match_rising}")
        else:
            base_scores.append(comp_score)
    
    # Step 5: Analysis results
    print(f"\n📊 Analysis Results:")
    print(f"   Base compatibility scores (no polarity): {len(base_scores)} users")
    print(f"   Enhanced scores (with polarity): {len(enhanced_scores)} users")
    
    if base_scores:
        avg_base = sum(base_scores) / len(base_scores)
        print(f"   📈 Base scores average: {avg_base:.1f}")
    
    if enhanced_scores:
        avg_enhanced = sum(enhanced_scores) / len(enhanced_scores)
        print(f"   🌟 Enhanced scores average: {avg_enhanced:.1f}")
        
        if base_scores:
            bonus_diff = avg_enhanced - avg_base
            print(f"   🎯 Polarity bonus effect: +{bonus_diff:.1f} points on average")
            
            if bonus_diff > 0:
                print("   ✅ Polarity bonus system is working!")
            else:
                print("   ⚠️  Polarity bonus may not be working as expected")
        
        # Show specific examples
        print(f"\n🔍 Polarity Examples:")
        for example in polarity_examples[:5]:
            print(f"   {example['name']}: {example['score']} ({'+'.join(example['polarity_types'])} polarity)")
    else:
        print("   ℹ️  No polarity relationships found in sample")
    
    # Step 6: Test trending energies
    print(f"\n🌟 Testing trending energies...")
    trending_response = requests.get(f"{base_url}/users/trending-energies", cookies=cookies)
    
    if trending_response.status_code == 200:
        trending_users = trending_response.json()
        print(f"✅ Found {len(trending_users)} trending users")
        
        if len(trending_users) > 0:
            print("   Top trending users:")
            for user in trending_users[:3]:
                print(f"   - {user.get('first_name')}: Compatibility {user.get('compatibility_score')}, Trending {user.get('trending_energy_score')}")
                print(f"     Signs: {user.get('zodiac_sign')}/{user.get('moon_sign')}/{user.get('rising_sign')}")
        else:
            print("   ℹ️  No users meet trending energy threshold (score >= 60)")
    else:
        print(f"❌ Trending energies failed: {trending_response.status_code}")

if __name__ == "__main__":
    test_polarity_bonus()