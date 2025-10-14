"""
Daily Horoscope Service
Generates personalized horoscope messages for each zodiac sign
"""

import random
from datetime import date

# Horoscope message templates by zodiac sign
# Each entry has: (short_message, long_message)
HOROSCOPE_TEMPLATES = {
    "Aries": [
        (
            "Your confidence draws others in — speak your truth.",
            "✨ Your confidence feels magnetic today, Aries. The stars align to amplify your natural boldness and courage. This is the perfect time to speak your truth and step into leadership roles. Your pioneering spirit inspires those around you, and your authentic self-expression opens doors you didn't know existed. Trust your instincts, take decisive action, and don't hold back. The universe is backing your bold moves right now."
        ),
        (
            "Fire energy surrounds you — channel passion into action.",
            "🔥 Powerful fire energy courses through your being today. Your ruling planet Mars energizes your ambitions and desires, pushing you toward meaningful action. Channel this passionate intensity into your most important goals. Whether it's a personal project, career move, or relationship milestone, your drive is unstoppable. Others feel your enthusiasm and want to join your journey. Lead with confidence and watch the world respond."
        ),
        (
            "Today's cosmic momentum favors your bold initiatives.",
            "⚡ The cosmic winds are at your back, Aries, creating perfect conditions for launching new ventures and taking calculated risks. Your natural courage is amplified, making this an ideal time to pursue opportunities others might fear. The universe rewards your bravery with unexpected support and resources. Trust your warrior spirit and move forward with conviction. Success follows those who dare, and today, that's you."
        ),
        (
            "Leadership calls — your courage inspires those around you.",
            "💫 Your leadership qualities shine brilliantly under today's celestial configuration. People naturally gravitate toward your energy and vision. Your courage to stand up for what's right and pursue ambitious goals creates a ripple effect, inspiring others to find their own bravery. Step into positions of influence with confidence. Your authentic leadership style, marked by directness and passion, is exactly what's needed right now."
        ),
        (
            "Take that leap — the universe has your back.",
            "🌟 Today calls for bold action and fearless moves, Aries. That leap you've been contemplating? The stars say it's time. The universe is conspiring in your favor, creating safety nets you can't even see yet. Your natural optimism and pioneering spirit are perfectly aligned with cosmic energies. Trust that your instincts are guiding you toward growth and success. Fortune favors the brave, and you're feeling particularly courageous today."
        )
    ],
    "Taurus": [
        "🌿 Ground yourself in nature's rhythm — stability is your superpower.",
        "💚 Venus blesses your relationships. Trust your heart's wisdom.",
        "🌸 Slow and steady wins. Your patience bears fruit today.",
        "✨ Luxury and comfort surround you. Enjoy life's pleasures.",
        "🌙 Your determination moves mountains. Stay the course."
    ],
    "Gemini": [
        "💬 Your words carry magic today — communicate with confidence.",
        "🦋 Curiosity unlocks new doors. Follow your intellectual spark.",
        "⚡ Adaptability is your gift. Flow with changes gracefully.",
        "✨ Social energy peaks. Connect, explore, and express yourself.",
        "🌟 Mercury enhances your wit. Your charm is magnetic."
    ],
    "Cancer": [
        "🌊 Emotional depth is your strength. Honor your feelings today.",
        "💙 Nurture yourself first, then extend love to others.",
        "🌙 The moon guides your intuition. Trust your inner voice.",
        "✨ Home and heart align. Create your sanctuary.",
        "🦀 Your sensitivity is a superpower, not a weakness."
    ],
    "Leo": [
        "👑 Your confidence feels magnetic — speak your truth.",
        "☀️ The spotlight is yours. Shine brightly and authentically.",
        "🔥 Creative fire burns bright. Express your unique brilliance.",
        "✨ Generosity of spirit attracts abundance today.",
        "🌟 Lead with your heart. Others follow your light."
    ],
    "Virgo": [
        "🌾 Precision and care bring success. Trust your meticulous nature.",
        "✨ Your analytical mind sees solutions others miss.",
        "💚 Service to others brings deep fulfillment today.",
        "🌿 Organization creates space for magic. Tend your garden.",
        "⚖️ Balance perfection with compassion for yourself."
    ],
    "Libra": [
        "⚖️ Harmony flows through you. Balance brings peace.",
        "💕 Venus enhances your charm. Relationships blossom.",
        "✨ Your diplomatic grace resolves conflicts beautifully.",
        "🌸 Beauty surrounds you. Appreciate art and elegance.",
        "🦢 Partnership energy peaks. Connect with authenticity."
    ],
    "Scorpio": [
        "🦂 Your intensity is magnetic. Embrace your power today.",
        "🔮 Transformation calls. Trust the process of change.",
        "💜 Deep connections beckon. Vulnerability is strength.",
        "✨ Your intuition runs deep. Follow your instincts.",
        "🌑 Mystery and passion intertwine. Own your magnetism."
    ],
    "Sagittarius": [
        "🏹 Adventure awaits. Aim high and trust your vision.",
        "✨ Optimism is your superpower. Spread joy freely.",
        "🌍 Expansion calls. Explore new horizons with confidence.",
        "🔥 Your enthusiasm is contagious. Inspire others.",
        "⚡ Freedom and truth guide you. Follow your path."
    ],
    "Capricorn": [
        "⛰️ Your discipline builds empires. Stay focused on goals.",
        "✨ Ambition meets opportunity. Take strategic action.",
        "🐐 Perseverance pays off. Your hard work is seen.",
        "💼 Professional success flows. Trust your competence.",
        "🌟 Structure creates freedom. Build your foundation."
    ],
    "Aquarius": [
        "🌊 Innovation flows through you. Think outside the box.",
        "✨ Your unique perspective changes the world.",
        "💡 Humanitarian vision guides you. Inspire change.",
        "⚡ Independence is your gift. Honor your individuality.",
        "🔮 Future-focused energy peaks. Dream big today."
    ],
    "Pisces": [
        "🐠 Your empathy heals others. Trust your compassion.",
        "🌊 Intuitive waves guide you. Surrender to flow.",
        "✨ Creative magic surrounds you. Express your dreams.",
        "💜 Spiritual connection deepens. Meditate and reflect.",
        "🌙 Imagination knows no bounds. Create freely today."
    ]
}

def get_daily_horoscope(zodiac_sign: str, date_str: str = None) -> dict:
    """
    Get daily horoscope for a zodiac sign
    
    Args:
        zodiac_sign: User's zodiac sign (e.g., "Leo")
        date_str: Optional date string (YYYY-MM-DD), defaults to today
    
    Returns:
        Dict with horoscope message
    """
    if not date_str:
        date_str = date.today().isoformat()
    
    # Normalize zodiac sign
    zodiac_sign = zodiac_sign.strip().title()
    
    if zodiac_sign not in HOROSCOPE_TEMPLATES:
        zodiac_sign = "Aries"  # Fallback
    
    messages = HOROSCOPE_TEMPLATES[zodiac_sign]
    
    # Rotate through messages based on day of year for variety
    from datetime import datetime
    date_obj = datetime.fromisoformat(date_str)
    day_of_year = date_obj.timetuple().tm_yday
    message_index = day_of_year % len(messages)
    
    # Handle both tuple (short, long) and simple string formats
    selected = messages[message_index]
    if isinstance(selected, tuple):
        short_msg, long_msg = selected
    else:
        # Fallback for old format - use same message for both
        short_msg = long_msg = selected
    
    return {
        "date": date_str,
        "sign": zodiac_sign,
        "message_short": short_msg,
        "message_long": long_msg,
        "emoji": get_zodiac_emoji(zodiac_sign),
        "constellation": get_zodiac_constellation_name(zodiac_sign)
    }

def get_zodiac_emoji(zodiac_sign: str) -> str:
    """Get emoji/symbol for zodiac sign"""
    emoji_map = {
        "Aries": "♈",
        "Taurus": "♉",
        "Gemini": "♊",
        "Cancer": "♋",
        "Leo": "♌",
        "Virgo": "♍",
        "Libra": "♎",
        "Scorpio": "♏",
        "Sagittarius": "♐",
        "Capricorn": "♑",
        "Aquarius": "♒",
        "Pisces": "♓"
    }
    return emoji_map.get(zodiac_sign, "✧")


def get_zodiac_constellation_name(zodiac_sign: str) -> str:
    """Get constellation identifier for zodiac sign (for SVG icon lookup)"""
    constellation_map = {
        "Aries": "aries",
        "Taurus": "taurus",
        "Gemini": "gemini",
        "Cancer": "cancer",
        "Leo": "leo",
        "Virgo": "virgo",
        "Libra": "libra",
        "Scorpio": "scorpio",
        "Sagittarius": "sagittarius",
        "Capricorn": "capricorn",
        "Aquarius": "aquarius",
        "Pisces": "pisces"
    }
    return constellation_map.get(zodiac_sign, "aries")

def get_all_daily_horoscopes(date_str: str = None) -> dict:
    """Get horoscopes for all 12 zodiac signs"""
    if not date_str:
        date_str = date.today().isoformat()
    
    horoscopes = {}
    for sign in HOROSCOPE_TEMPLATES.keys():
        horoscopes[sign] = get_daily_horoscope(sign, date_str)
    
    return horoscopes
