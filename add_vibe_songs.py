import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def add_vibe_songs():
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(MONGO_URL)
    db = client['dating_app']
    
    # Check current users
    users = await db.users.find({}).to_list(length=None)
    print(f'Found {len(users)} users in database\n')
    
    for user in users:
        has_vibe = 'vibe_song' in user
        print(f'{user.get("first_name", "Unknown")}: has vibe_song = {has_vibe}')
    
    # Universal vibe song for all users
    universal_song = {
        'title': 'Blinding Lights',
        'artist': 'The Weeknd',
        'preview_url': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        'album_art': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80'
    }
    
    # Update ALL users with vibe song
    result = await db.users.update_many(
        {},
        {'$set': {'vibe_song': universal_song}}
    )
    
    print(f'\n✓ Updated {result.modified_count} users with vibe song')
    print('All profiles now have "My Vibe" section!')
    
    client.close()

if __name__ == "__main__":
    asyncio.run(add_vibe_songs())
