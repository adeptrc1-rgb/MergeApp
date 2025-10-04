import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Star, Settings, LogOut, Sparkles, Users, Home, Zap, Heart, MessageCircle, Award } from 'lucide-react';

export default function Profile({ user, logout }) {
  const navigate = useNavigate();

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(user.birth_date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            A Sign
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="text-white/80 hover:text-white transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-2xl mx-auto p-4">
          {/* Profile Header */}
          <div className="bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/10 mb-4">
            <div className="flex items-start gap-4">
              {/* Profile Photo */}
              <div
                className="w-24 h-24 rounded-2xl bg-cover bg-center border-2 border-pink-400/50"
                style={{
                  backgroundImage: `url(${user.photos?.[0] || 'https://via.placeholder.com/200'})`
                }}
              />

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {user.first_name}, {age}
                </h2>
                <div className="flex items-center gap-2 text-white/90 mb-3">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-lg">{user.zodiac_sign}</span>
                </div>

                {/* Angel Number Badge */}
                {user.angel_number && (
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-md px-4 py-2 rounded-full">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-medium">Angel Number: {user.angel_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Free Features */}
          <div className="bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/10 mb-4">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" />
              Your Free Features
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl p-4 border border-pink-400/30">
                <Zap className="w-8 h-8 text-yellow-400 mb-2" />
                <div className="text-2xl font-bold text-white mb-1">
                  {user.profile_boosts || 0}
                </div>
                <div className="text-sm text-white/80">Profile Boosts</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-4 border border-purple-400/30">
                <Heart className="w-8 h-8 text-pink-400 mb-2 fill-pink-400" />
                <div className="text-2xl font-bold text-white mb-1">
                  {user.super_likes || 0}
                </div>
                <div className="text-sm text-white/80">Super Likes</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-4 border border-blue-400/30 col-span-2">
                <MessageCircle className="w-8 h-8 text-blue-400 mb-2" />
                <div className="text-2xl font-bold text-white mb-1">
                  {user.direct_messages || 0}
                </div>
                <div className="text-sm text-white/80">Direct Messages</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/10 mb-4">
            <h3 className="text-xl font-bold text-white mb-4">Your Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Total Matches</span>
                <span className="text-white font-bold text-lg">{user.total_matches || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Responsiveness Score</span>
                <span className="text-white font-bold text-lg">{user.responsiveness_score || 80}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Profile Completion</span>
                <span className="text-white font-bold text-lg">100%</span>
              </div>
            </div>
          </div>

          {/* About Me */}
          {user.bio && (
            <div className="bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/10 mb-4">
              <h3 className="text-xl font-bold text-white mb-3">About Me</h3>
              <p className="text-white/80">{user.bio}</p>
            </div>
          )}

          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <div className="bg-black/30 backdrop-blur-md rounded-3xl p-6 border border-white/10 mb-4">
              <h3 className="text-xl font-bold text-white mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full text-white text-sm border border-white/20"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Logout Button */}
          <Button
            onClick={logout}
            className="w-full bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-400/30 flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentTab="profile" navigate={navigate} />
    </div>
  );
}

// Bottom Navigation Component
function BottomNav({ currentTab, navigate }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/10 safe-area-inset-bottom">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-around">
        <button
          onClick={() => navigate('/discover')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'discover' ? 'text-pink-400' : 'text-white/60 hover:text-white'
          }`}
        >
          <Sparkles className={`w-6 h-6 ${currentTab === 'discover' ? 'fill-pink-400' : ''}`} />
          <span className="text-xs font-medium">Discover</span>
        </button>
        <button
          onClick={() => navigate('/connections')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'connections' ? 'text-pink-400' : 'text-white/60 hover:text-white'
          }`}
        >
          <Users className={`w-6 h-6 ${currentTab === 'connections' ? 'fill-pink-400' : ''}`} />
          <span className="text-xs font-medium">Connections</span>
        </button>
        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            currentTab === 'profile' ? 'text-pink-400' : 'text-white/60 hover:text-white'
          }`}
        >
          <Home className={`w-6 h-6 ${currentTab === 'profile' ? 'fill-pink-400' : ''}`} />
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
}
