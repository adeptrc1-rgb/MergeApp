#!/usr/bin/env python3
"""Add vibe songs to test user profiles"""

from pymongo import MongoClient
import random

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017")
db = client["astrology_dating_db"]
users_collection = db["users"]

# Sample vibe songs from different genres
VIBE_SONGS = [
    {
        "title": "bad guy",
        "artist": "Billie Eilish",
        "album": "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?",
        "album_art": "https://cdn-images.dzcdn.net/images/cover/6630083f454d48eadb6a9b53f035d734/250x250-000000-80-0-0.jpg",
        "preview_url": "https://cdnt-preview.dzcdn.net/api/1/1/b/5/2/0/b528e07441caa4883c8d1c4b746bf47c.mp3",
        "duration": 194,
        "source": "deezer"
    },
    {
        "title": "Blinding Lights",
        "artist": "The Weeknd",
        "album": "After Hours",
        "album_art": "https://cdn-images.dzcdn.net/images/cover/0c8484dbc6e971671f15446ea2e6a26c/250x250-000000-80-0-0.jpg",
        "preview_url": "https://cdnt-preview.dzcdn.net/api/1/1/f/6/c/0/f6cb8e88c40c8c58e8e1c6d5b0d4a4a5.mp3",
        "duration": 200,
        "source": "deezer"
    },
    {
        "title": "Levitating",
        "artist": "Dua Lipa",
        "album": "Future Nostalgia",
        "album_art": "https://cdn-images.dzcdn.net/images/cover/19a6b0a8e448eaf8ffa81784f0c19465/250x250-000000-80-0-0.jpg",
        "preview_url": "https://cdnt-preview.dzcdn.net/api/1/1/a/8/e/0/a8ea0f27f6f6f6f6f6f6f6f6f6f6f6f6.mp3",
        "duration": 203,
        "source": "deezer"
    },
    {
        "title": "Flowers",
        "artist": "Miley Cyrus",
        "album": "Endless Summer Vacation",
        "album_art": "https://cdn-images.dzcdn.net/images/cover/f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0/250x250-000000-80-0-0.jpg",
        "preview_url": "https://cdnt-preview.dzcdn.net/api/1/1/c/7/d/0/c7da6f0f0f0f0f0f0f0f0f0f0f0f0f0f.mp3",
        "duration": 199,
        "source": "deezer"
    },
    {
        "title": "As It Was",
        "artist": "Harry Styles",
        "album": "Harry's House",
        "album_art": "https://cdn-images.dzcdn.net/images/cover/a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1/250x250-000000-80-0-0.jpg",
        "preview_url": "https://cdnt-preview.dzcdn.net/api/1/1/b/2/c/0/b2cd0f0f0f0f0f0f0f0f0f0f0f0f0f0f.mp3",
        "duration": 167,
        "source": "deezer"
    },
    {
        "title": "Anti-Hero",
        "artist": "Taylor Swift",
        "album": "Midnights",
        "album_art": "https://cdn-images.dzcdn.net/images/cover/b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3/250x250-000000-80-0-0.jpg",
        "preview_url": "https://cdnt-preview.dzcdn.net/api/1/1/d/4/e/0/d4ef0f0f0f0f0f0f0f0f0f0f0f0f0f0f.mp3",
        "duration": 200,
        "source": "deezer"
    },
    {
        "title": "Calm Down",
        "artist": "Rema & Selena Gomez",
        "album": "Rave & Roses",
        "album_art": "https://cdn-images.dzcdn.net/images/cover/c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4/250x250-000000-80-0-0.jpg",
        "preview_url": "https://cdnt-preview.dzcdn.net/api/1/1/e/5/f/0/e5ff0f0f0f0f0f0f0f0f0f0f0f0f0f0f.mp3",
        "duration": 239,
        "source": "deezer"
    },
    {
        "title": "Vampire",
        "artist": "Olivia Rodrigo",
        "album": "GUTS",
        "album_art": "https://cdn-images.dzcdn.net/images/cover/d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5d5/250x250-000000-80-0-0.jpg",
        "preview_url": "https://cdnt-preview.dzcdn.net/api/1/1/f/6/g/0/f6gf0f0f0f0f0f0f0f0f0f0f0f0f0f0f.mp3",
        "duration": 219,
        "source": "deezer"
    }
]

def add_vibe_songs():
    """Add vibe songs to users who don't have one"""
    
    # Get all users without vibe_song
    users_without_vibe = list(users_collection.find(
        {"$or": [{"vibe_song": {"$exists": False}}, {"vibe_song": None}]},
        {"id": 1, "first_name": 1}
    ).limit(20))
    
    if not users_without_vibe:
        print("All users already have vibe songs!")
        return
    
    print(f"Found {len(users_without_vibe)} users without vibe songs")
    
    # Randomly assign vibe songs
    for user in users_without_vibe:
        song = random.choice(VIBE_SONGS)
        
        result = users_collection.update_one(
            {"id": user["id"]},
            {"$set": {"vibe_song": song}}
        )
        
        if result.modified_count > 0:
            print(f"✓ Added '{song['title']}' by {song['artist']} to {user.get('first_name', 'User')}")
        else:
            print(f"✗ Failed to update {user.get('first_name', 'User')}")
    
    print(f"\n✅ Successfully added vibe songs to {len(users_without_vibe)} users!")

if __name__ == "__main__":
    add_vibe_songs()
