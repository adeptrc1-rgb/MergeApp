import React, { useState, useEffect } from 'react';
import { X, Music, Search, Check } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

export default function MusicConnect({ user, onClose, onAnthemSet }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [playingPreview, setPlayingPreview] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState(null);

  useEffect(() => {
    // Check if we have an anthem already
    if (user.vibe_song) {
      setSelectedSong(user.vibe_song);
    }

    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
      }
    };
  }, []);

  const searchSongs = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API}/music/search`, {
        params: { q: searchQuery, limit: 20 }
      });
      setSearchResults(response.data.tracks);
    } catch (error) {
      console.error('Error searching songs:', error);
      alert('Failed to search songs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const playPreview = (previewUrl) => {
    if (!previewUrl) {
      alert('No preview available for this track');
      return;
    }

    // Stop current audio if playing
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }

    // Play new preview
    const audio = new Audio(previewUrl);
    audio.volume = 0.5;
    audio.play();
    setAudioPlayer(audio);
    setPlayingPreview(previewUrl);

    audio.onended = () => {
      setPlayingPreview(null);
    };
  };

  const stopPreview = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
      setPlayingPreview(null);
    }
  };

  const selectAnthem = async (track) => {
    try {
      const response = await axios.post(`${API}/music/set-anthem`, {
        anthem: {
          title: track.title,
          artist: track.artist,
          album: track.album,
          album_art: track.album_art,
          preview_url: track.preview_url,
          duration: track.duration,
          source: track.source
        }
      });

      if (response.data.success) {
        setSelectedSong(response.data.anthem);
        onAnthemSet && onAnthemSet(response.data.anthem);
        alert('Music anthem set successfully! 🎵');
        onClose();
      }
    } catch (error) {
      console.error('Error setting anthem:', error);
      alert('Failed to set music anthem.');
    }
  };

  const removeAnthem = async () => {
    if (!confirm('Are you sure you want to remove your music anthem?')) return;

    try {
      await axios.delete(`${API}/music/remove-anthem`);
      setSelectedSong(null);
      alert('Music anthem removed successfully');
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error removing anthem:', error);
      alert('Failed to remove anthem.');
    }
  };

  const renderTrackList = (tracks) => (
    <div className="space-y-2">
      {tracks.map((track) => (
        <div
          key={track.id}
          className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-purple-400/50 transition-all"
        >
          <div className="flex items-center gap-3">
            {/* Album Art */}
            {track.album_art && (
              <img
                src={track.album_art}
                alt={track.title}
                className="w-12 h-12 rounded"
              />
            )}

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-white text-sm font-medium truncate">{track.title}</h4>
              <p className="text-white/60 text-xs truncate">{track.artist}</p>
              {track.album && (
                <p className="text-white/40 text-xs truncate">{track.album}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Preview Button */}
              {track.preview_url && (
                <button
                  onClick={() => playingPreview === track.preview_url ? stopPreview() : playPreview(track.preview_url)}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                  title="Play 30-second preview"
                >
                  {playingPreview === track.preview_url ? '⏸️' : '▶️'}
                </button>
              )}

              {/* Select Button */}
              <button
                onClick={() => selectAnthem(track)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:scale-105 transition-transform"
              >
                {selectedSong?.title === track.title && selectedSong?.artist === track.artist ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" /> Current
                  </span>
                ) : (
                  'Select'
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-black border border-white/20 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Music className="w-6 h-6 text-purple-400" />
            <div>
              <h3 className="text-2xl font-light text-white">My Vibe</h3>
              <p className="text-white/60 text-sm">Choose a song that represents you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Universal Search Bar */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-400/30 mb-4">
              <p className="text-white/80 text-sm mb-3">
                🌍 <strong>Universal Access:</strong> Search any song from around the world. No account needed!
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchSongs()}
                  placeholder="Search for any song, artist, or album..."
                  className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400"
                />
                <button
                  onClick={searchSongs}
                  disabled={loading}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Current Anthem */}
            {selectedSong && (
              <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30 mb-4">
                <h4 className="text-white/80 text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  Current Anthem
                </h4>
                <div className="flex items-center gap-3">
                  {selectedSong.album_art && (
                    <img src={selectedSong.album_art} alt={selectedSong.title} className="w-16 h-16 rounded" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{selectedSong.title}</h3>
                    <p className="text-white/60 text-sm">{selectedSong.artist}</p>
                    {selectedSong.album && (
                      <p className="text-white/40 text-xs">{selectedSong.album}</p>
                    )}
                  </div>
                  {selectedSong.preview_url && (
                    <button
                      onClick={() => playingPreview === selectedSong.preview_url ? stopPreview() : playPreview(selectedSong.preview_url)}
                      className="text-purple-400 hover:text-purple-300 text-2xl"
                    >
                      {playingPreview === selectedSong.preview_url ? '⏸️' : '▶️'}
                    </button>
                  )}
                </div>
                <button
                  onClick={removeAnthem}
                  className="w-full text-red-400 hover:text-red-300 text-sm transition-colors mt-3"
                >
                  Remove Anthem
                </button>
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div>
                <h4 className="text-white text-lg font-medium mb-4">Search Results</h4>
                {renderTrackList(searchResults)}
              </div>
            )}

            {/* Empty State */}
            {searchResults.length === 0 && !loading && searchQuery && (
              <div className="text-center py-12 text-white/60">
                <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No results found. Try a different search!</p>
              </div>
            )}

            {/* Initial State */}
            {searchResults.length === 0 && !searchQuery && !selectedSong && (
              <div className="text-center py-12 text-white/60">
                <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Search for your vibe song</p>
                <p className="text-sm">Find any song from around the world</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
