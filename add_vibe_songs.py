import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def add_vibe_songs():
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(MONGO_URL)
    db = client['dating_app']
    
    # Example vibe song structure
    # Note: These are placeholder URLs - will need real Spotify/Apple Music integration
    example_song = {
        'title': 'Levitating',
        'artist': 'Dua Lipa',
        'preview_url': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',  # Placeholder preview
        'album_art': 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&q=80'
    }
    
    # Update test user (Star) with vibe song
    result = await db.users.update_one(
        {'first_name': 'Star'},
        {'$set': {'vibe_song': example_song}}
    )
    
    if result.modified_count > 0:
        print('✓ Added vibe song for Star')
    else:
        print('✗ Could not update Star (user not found or no changes)')
    
    # Update Emma if exists
    emma_song = {
        'title': 'Electric Feel',
        'artist': 'MGMT',
        'preview_url': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        'album_art': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80'
    }
    
    result2 = await db.users.update_one(
        {'first_name': 'Emma'},
        {'$set': {'vibe_song': emma_song}}
    )
    
    if result2.modified_count > 0:
        print('✓ Added vibe song for Emma')
    
    client.close()
    print('\nVibe songs added! Ready to test the player.')

if __name__ == "__main__":
    asyncio.run(add_vibe_songs())
