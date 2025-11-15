import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import uuid

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['dating_app']

# Diverse test profiles with AI-generated content
test_profiles = [
    {
        "id": str(uuid.uuid4()),
        "email": f"emma.chen@test.com",
        "first_name": "Emma",
        "last_name": "Chen",
        "birth_date": "1994-05-15",
        "zodiac_sign": "Taurus",
        "photos": ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80"],
        "bio": "Product designer by day, pottery enthusiast by night. Always up for spontaneous road trips and trying new coffee shops. Currently obsessed with sci-fi novels and indie music.",
        "interests": ["design", "pottery", "coffee", "sci-fi", "indie music", "road trips", "hiking", "photography"],
        "profile_completed": True,
        "lifestyle_factors": {
            "occupation": "Product Designer",
            "exercise_frequency": 3,
            "social_battery": 7
        },
        "deal_breakers": {
            "relationship_goals": "Long-term relationship"
        },
        "preferences": {
            "music": "Indie, Alternative Rock, Lo-fi"
        },
        "education": {
            "college": "Parsons School of Design",
            "degree": "BFA in Design"
        },
        "hometown": "San Francisco, CA"
    },
    {
        "id": str(uuid.uuid4()),
        "email": f"marcus.wright@test.com",
        "first_name": "Marcus",
        "last_name": "Wright",
        "birth_date": "1992-09-22",
        "zodiac_sign": "Virgo",
        "photos": ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80"],
        "bio": "Software engineer who believes the best code is written with a good playlist. Weekend warrior on the basketball court. Love exploring new cuisines and debating the best sci-fi universes.",
        "interests": ["coding", "basketball", "sci-fi", "food", "music production", "gaming", "hiking", "travel"],
        "profile_completed": True,
        "lifestyle_factors": {
            "occupation": "Software Engineer",
            "exercise_frequency": 4,
            "social_battery": 6
        },
        "deal_breakers": {
            "relationship_goals": "Long-term relationship"
        },
        "preferences": {
            "music": "Hip-Hop, Electronic, R&B"
        },
        "education": {
            "college": "MIT",
            "degree": "BS in Computer Science"
        },
        "hometown": "Boston, MA"
    },
    {
        "id": str(uuid.uuid4()),
        "email": f"sofia.martinez@test.com",
        "first_name": "Sofia",
        "last_name": "Martinez",
        "birth_date": "1995-12-03",
        "zodiac_sign": "Sagittarius",
        "photos": ["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80"],
        "bio": "Documentary filmmaker capturing stories that matter. Yoga instructor on weekends. Plant mom to 37 green babies. Always planning my next adventure abroad.",
        "interests": ["filmmaking", "yoga", "plants", "travel", "photography", "meditation", "sustainability", "cooking"],
        "profile_completed": True,
        "lifestyle_factors": {
            "occupation": "Documentary Filmmaker",
            "exercise_frequency": 5,
            "social_battery": 8
        },
        "deal_breakers": {
            "relationship_goals": "Long-term relationship"
        },
        "preferences": {
            "music": "World Music, Folk, Indie"
        },
        "education": {
            "college": "NYU Tisch",
            "degree": "MFA in Film"
        },
        "hometown": "Austin, TX"
    },
    {
        "id": str(uuid.uuid4()),
        "email": f"alex.kim@test.com",
        "first_name": "Alex",
        "last_name": "Kim",
        "birth_date": "1993-07-18",
        "zodiac_sign": "Cancer",
        "photos": ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"],
        "bio": "Data scientist turning numbers into insights. Amateur chef experimenting with fusion cuisine. Board game addict and trivia night champion. Looking for someone to explore hidden speakeasies with.",
        "interests": ["data science", "cooking", "board games", "trivia", "craft beer", "jazz", "reading", "travel"],
        "profile_completed": True,
        "lifestyle_factors": {
            "occupation": "Data Scientist",
            "exercise_frequency": 3,
            "social_battery": 5
        },
        "deal_breakers": {
            "relationship_goals": "Long-term relationship"
        },
        "preferences": {
            "music": "Jazz, Soul, Electronic"
        },
        "education": {
            "college": "Stanford University",
            "degree": "MS in Statistics"
        },
        "hometown": "Seattle, WA"
    },
    {
        "id": str(uuid.uuid4()),
        "email": f"maya.patel@test.com",
        "first_name": "Maya",
        "last_name": "Patel",
        "birth_date": "1996-03-25",
        "zodiac_sign": "Aries",
        "photos": ["https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80"],
        "bio": "Marketing strategist by day, stand-up comedy student by night. Terrible at sports but amazing at making people laugh. Obsessed with true crime podcasts and spontaneous karaoke sessions.",
        "interests": ["marketing", "comedy", "podcasts", "karaoke", "true crime", "writing", "concerts", "brunch"],
        "profile_completed": True,
        "lifestyle_factors": {
            "occupation": "Marketing Strategist",
            "exercise_frequency": 2,
            "social_battery": 9
        },
        "deal_breakers": {
            "relationship_goals": "Long-term relationship"
        },
        "preferences": {
            "music": "Pop, R&B, Alternative"
        },
        "education": {
            "college": "USC Marshall",
            "degree": "BS in Marketing"
        },
        "hometown": "Los Angeles, CA"
    },
    {
        "id": str(uuid.uuid4()),
        "email": f"jordan.lee@test.com",
        "first_name": "Jordan",
        "last_name": "Lee",
        "birth_date": "1991-11-08",
        "zodiac_sign": "Scorpio",
        "photos": ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80"],
        "bio": "Architect designing spaces that inspire. Rock climbing enthusiast scaling new heights every weekend. Vinyl collector with questionable taste according to my friends. Let's grab coffee and talk about design philosophy.",
        "interests": ["architecture", "rock climbing", "vinyl records", "design", "coffee", "museums", "urban exploration", "photography"],
        "profile_completed": True,
        "lifestyle_factors": {
            "occupation": "Architect",
            "exercise_frequency": 5,
            "social_battery": 6
        },
        "deal_breakers": {
            "relationship_goals": "Long-term relationship"
        },
        "preferences": {
            "music": "Rock, Alternative, Classic"
        },
        "education": {
            "college": "Columbia GSAPP",
            "degree": "M.Arch"
        },
        "hometown": "Portland, OR"
    },
    {
        "id": str(uuid.uuid4()),
        "email": f"aisha.johnson@test.com",
        "first_name": "Aisha",
        "last_name": "Johnson",
        "birth_date": "1994-08-14",
        "zodiac_sign": "Leo",
        "photos": ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"],
        "bio": "Environmental lawyer fighting the good fight. Sunset chaser and beach volleyball player. Always have a book in my bag and a witty comeback ready. Looking for someone who cares about making a difference.",
        "interests": ["environmental law", "beach volleyball", "reading", "sustainability", "ocean conservation", "travel", "yoga", "cooking"],
        "profile_completed": True,
        "lifestyle_factors": {
            "occupation": "Environmental Lawyer",
            "exercise_frequency": 4,
            "social_battery": 7
        },
        "deal_breakers": {
            "relationship_goals": "Long-term relationship"
        },
        "preferences": {
            "music": "R&B, Afrobeat, Soul"
        },
        "education": {
            "college": "Yale Law School",
            "degree": "JD"
        },
        "hometown": "Miami, FL"
    },
    {
        "id": str(uuid.uuid4()),
        "email": f"ryan.nakamura@test.com",
        "first_name": "Ryan",
        "last_name": "Nakamura",
        "birth_date": "1995-02-28",
        "zodiac_sign": "Pisces",
        "photos": ["https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&q=80"],
        "bio": "Music producer crafting beats in my home studio. Coffee snob who takes latte art way too seriously. Love late-night philosophical debates and exploring hidden music venues.",
        "interests": ["music production", "coffee", "philosophy", "concerts", "DJing", "photography", "anime", "gaming"],
        "profile_completed": True,
        "lifestyle_factors": {
            "occupation": "Music Producer",
            "exercise_frequency": 2,
            "social_battery": 5
        },
        "deal_breakers": {
            "relationship_goals": "Long-term relationship"
        },
        "preferences": {
            "music": "Electronic, Hip-Hop, Lo-fi"
        },
        "education": {
            "college": "Berklee College of Music",
            "degree": "BM in Music Production"
        },
        "hometown": "San Diego, CA"
    }
]

async def create_profiles():
    print("Creating diverse test profiles...")
    
    for profile in test_profiles:
        # Check if user already exists
        existing = await db.users.find_one({"email": profile["email"]})
        if existing:
            print(f"✓ Profile already exists: {profile['first_name']} {profile['last_name']}")
            continue
        
        # Insert new profile
        await db.users.insert_one(profile)
        print(f"✓ Created profile: {profile['first_name']} {profile['last_name']} - {profile['lifestyle_factors']['occupation']}")
    
    print(f"\n✓ Total profiles created: {len(test_profiles)}")
    print("\nProfile Summary:")
    for p in test_profiles:
        print(f"  • {p['first_name']} {p['last_name']} - {p['lifestyle_factors']['occupation']}")
        print(f"    Interests: {', '.join(p['interests'][:4])}...")
        print(f"    Music: {p['preferences']['music']}")
        print()

if __name__ == "__main__":
    asyncio.run(create_profiles())
