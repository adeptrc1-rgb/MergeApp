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
            "✨ Your confidence feels magnetic today, Aries. The stars align powerfully to amplify your natural boldness, courage, and pioneering spirit. Mars, your ruling planet, charges your energy field with an irresistible dynamic force that others can't help but notice and admire. This is the perfect time to speak your truth without hesitation, step boldly into leadership roles you've been considering, and let your authentic voice be heard in spaces where it matters most. Your pioneering spirit doesn't just inspire those around you—it awakens something dormant within them, giving others permission to be brave too. Every word you speak carries weight and authority today. Your authentic self-expression opens doors you didn't even know existed, creating opportunities that align perfectly with your highest path. The universe is literally rearranging circumstances in your favor. Trust your warrior instincts completely, take decisive action on that idea you've been refining, and absolutely don't hold back your natural intensity. Remember, you were born to lead, to initiate, to be first. The universe is backing your bold moves right now with cosmic force, so move forward with the confidence that's your birthright."
        ),
        (
            "Fire energy surrounds you — channel passion into action.",
            "🔥 Powerful fire energy courses through your entire being today, Aries. You're literally radiating heat and intensity that others can feel the moment you enter a room. Your ruling planet Mars energizes not just your ambitions and desires, but ignites a deep, primal drive toward meaningful action and tangible results. This isn't just motivation—it's a burning need to create, build, and make things happen in the physical world. Channel this passionate intensity into your most important goals and watch how quickly obstacles dissolve under the force of your will. Whether it's a personal creative project that's been calling to you, a career move you've been strategizing, or a relationship milestone you're ready to initiate, your drive is absolutely unstoppable right now. The cosmic winds are literally pushing you forward. Others feel your enthusiasm like a contagious fire—they want to join your journey, support your vision, and bask in your energetic glow. Your natural leadership doesn't demand or force; it simply inspires others to rise to their own potential. Lead with confidence today, trust that your passion has purpose, and watch how the world responds by opening doors, offering resources, and aligning circumstances in your favor. Your fire isn't meant to be contained—let it burn bright."
        ),
        (
            "Today's cosmic momentum favors your bold initiatives.",
            "⚡ The cosmic winds are powerfully at your back today, Aries, creating absolutely perfect conditions for launching new ventures, taking calculated risks, and stepping into territories others consider too dangerous or uncertain. Your natural courage—that quality that makes you the first to try, the first to dare, the first to leap—is amplified tenfold by celestial support. This is the ideal time to pursue opportunities that others might fear or hesitate over. While they're still analyzing and overthinking, you're already in motion, already creating results. The universe rewards your bravery with unexpected support, synchronistic meetings, surprise resources, and doors opening at exactly the right moment. Trust your warrior spirit completely today. That inner voice telling you to move forward? It's not reckless—it's your soul recognizing divine timing. Move forward with conviction, knowing that your instincts are being guided by forces beyond the visible. Success doesn't just follow those who dare—it actively seeks them out, and today, that's you. Your pioneering nature is being cosmically supported. The risks you take now plant seeds that will grow into your future success. Don't let fear of the unknown hold you back. You were built for this kind of courageous action. The universe is literally conspiring to help you succeed."
        ),
        (
            "Leadership calls — your courage inspires those around you.",
            "💫 Your natural leadership qualities shine with brilliant intensity under today's powerful celestial configuration, Aries. It's not just that you're capable of leading—it's that people are actively seeking your guidance, vision, and direction right now. They naturally gravitate toward your confident energy, your clear sense of purpose, and your unwavering vision for what's possible. Your courage to stand up for what's right, to pursue ambitious goals even when the path is unclear, and to speak truth even when it's uncomfortable creates a ripple effect that reaches far beyond what you can see. When you act bravely, you give others permission to find their own courage. When you stand firm in your values, you inspire others to clarify their own. Your authentic leadership style—marked by directness, passion, enthusiasm, and genuine care for collective success—is exactly what's needed in this moment. Step confidently into positions of influence, whether that's in your workplace, community, family, or social circles. Don't diminish your natural authority or apologize for taking up space. The world needs leaders who act from integrity and courage rather than ego and fear. Your particular brand of leadership—pioneering, bold, honest, protective—creates safety for others to take their own risks. Today, recognize that your courage isn't just for you—it's a gift that elevates everyone around you."
        ),
        (
            "Take that leap — the universe has your back.",
            "🌟 Today calls for bold, decisive action and fearless moves, Aries. That leap you've been contemplating, analyzing, and preparing for? The stars are literally screaming: it's time. Stop waiting for perfect conditions, complete certainty, or universal approval. The universe is conspiring in your favor right now, creating safety nets, backup plans, and support systems you can't even see yet but that will catch you and propel you forward. Your natural optimism isn't naivety—it's soul-level knowing that you're being guided and protected. Your pioneering spirit that makes you want to be first, try new things, and venture into unknown territory is perfectly aligned with cosmic energies supporting expansion, growth, and new beginnings. Trust completely that your instincts are guiding you toward your highest path and greatest growth. That inner knowing isn't random—it's divine guidance speaking through your intuition. Fortune doesn't just favor the brave—it actively seeks them out, and you're radiating that courageous frequency right now. The universe responds to action, not intention alone. Every step you take into the unknown activates cosmic support. Every risk you take from authentic courage (not ego) multiplies your opportunities. You're not being reckless—you're being called forward by your own future success. Your soul knows the truth: playing it safe isn't actually safer; it just keeps you stuck. Today, trust yourself enough to leap. The net will appear—it always does for those brave enough to jump."
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
