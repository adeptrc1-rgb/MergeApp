import React, { useState, useEffect } from 'react';
import { X, Music, Search, TrendingUp, Check } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

export default function SpotifyConnect({ user, onClose, onVibeSongSet }) {
  const [view, setView] = useState('main'); // 'main', 'search', 'top-tracks'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [playingPreview, setPlayingPreview] = useState(null);
  const [audioPlayer, setAudioPlayer] = useState(null);

  useEffect(() => {
    // Check if we have a vibe song already
    if (user.vibe_song) {
      setSelectedSong(user.vibe_song);
    }

    // Check for Spotify callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('spotify') === 'connected') {
      // Spotify just connected, show top tracks
      setView('top-tracks');
      loadTopTracks();
    }

    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
      }
    };
  }, []);

  const connectSpotify = async () => {
    try {
      const response = await axios.get(`${API}/spotify/auth-url`);
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error('Error connecting Spotify:', error);
      alert('Failed to connect Spotify. Please try again.');
    }
  };

  const loadTopTracks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/spotify/top-tracks`);
      setTopTracks(response.data.tracks);
    } catch (error) {
      console.error('Error loading top tracks:', error);
      alert('Failed to load your top tracks.');
    } finally {
      setLoading(false);
    }
  };

  const searchSongs = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API}/spotify/search`, {
        params: { q: searchQuery }
      });
      setSearchResults(response.data.tracks);
      setView('search');
    } catch (error) {
      console.error('Error searching songs:', error);
      alert('Failed to search songs.');
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

  const selectVibeSong = async (track) => {
    try {
      const response = await axios.post(`${API}/spotify/set-vibe-song`, {
        vibe_song: {
          track_name: track.name,
          artist: track.artist,
          album: track.album,
          album_art: track.album_art,
          preview_url: track.preview_url,
          spotify_uri: track.spotify_uri
        }
      });

      if (response.data.success) {
        setSelectedSong(response.data.vibe_song);
        onVibeSongSet && onVibeSongSet(response.data.vibe_song);
        alert('Vibe song set successfully! 🎵');
        onClose();
      }
    } catch (error) {
      console.error('Error setting vibe song:', error);
      alert('Failed to set vibe song.');
    }
  };

  const disconnectSpotify = async () => {
    if (!confirm('Are you sure you want to disconnect Spotify?')) return;

    try {
      await axios.delete(`${API}/spotify/disconnect`);
      alert('Spotify disconnected successfully');
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error disconnecting Spotify:', error);
      alert('Failed to disconnect Spotify.');
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
                alt={track.name}
                className="w-12 h-12 rounded"
              />
            )}

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-white text-sm font-medium truncate">{track.name}</h4>
              <p className="text-white/60 text-xs truncate">{track.artist}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Preview Button */}
              {track.preview_url && (
                <button
                  onClick={() => playingPreview === track.preview_url ? stopPreview() : playPreview(track.preview_url)}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                  title="Play preview"
                >
                  {playingPreview === track.preview_url ? '⏸️' : '▶️'}
                </button>
              )}

              {/* Select Button */}
              <button
                onClick={() => selectVibeSong(track)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:scale-105 transition-transform"
              >
                {selectedSong?.spotify_uri === track.spotify_uri ? (
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
            <Music className="w-6 h-6 text-green-500" />
            <div>
              <h3 className="text-2xl font-light text-white">My Vibe Song</h3>
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
          {!user.spotify_connected ? (
            // Not connected view
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-light text-white mb-2">Connect Your Spotify</h3>
              <p className="text-white/60 mb-6">
                Choose a song from your Spotify library to showcase on your profile
              </p>
              <button
                onClick={connectSpotify}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium transition-colors inline-flex items-center gap-2"
              >
                <Music className="w-5 h-5" />
                Connect Spotify
              </button>
            </div>
          ) : (
            // Connected view
            <>
              {view === 'main' && (
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchSongs()}
                      placeholder="Search for a song..."
                      className="flex-1 bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400"
                    />
                    <button
                      onClick={searchSongs}
                      disabled={loading}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Browse Options */}
                  <button
                    onClick={() => { setView('top-tracks'); loadTopTracks(); }}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-left transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      <div>
                        <h4 className="text-white font-medium">Your Top Tracks</h4>
                        <p className="text-white/60 text-sm">Browse your most played songs</p>
                      </div>
                    </div>
                  </button>

                  {/* Current Vibe Song */}
                  {selectedSong && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-400/30">
                      <h4 className="text-white/80 text-sm uppercase tracking-wide mb-2">Current Vibe Song</h4>
                      <div className="flex items-center gap-3">
                        {selectedSong.album_art && (
                          <img src={selectedSong.album_art} alt={selectedSong.track_name} className="w-16 h-16 rounded" />
                        )}
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{selectedSong.track_name}</h3>
                          <p className="text-white/60 text-sm">{selectedSong.artist}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Disconnect Button */}
                  <button
                    onClick={disconnectSpotify}
                    className="w-full text-red-400 hover:text-red-300 text-sm transition-colors mt-4"
                  >
                    Disconnect Spotify
                  </button>
                </div>
              )}

              {view === 'search' && (
                <div>
                  <button
                    onClick={() => setView('main')}
                    className="text-purple-400 hover:text-purple-300 mb-4 text-sm"
                  >
                    ← Back
                  </button>
                  <h4 className="text-white text-lg font-medium mb-4">Search Results</h4>
                  {loading ? (
                    <div className="text-center py-8 text-white/60">Loading...</div>
                  ) : searchResults.length > 0 ? (
                    renderTrackList(searchResults)
                  ) : (
                    <div className="text-center py-8 text-white/60">No results found</div>
                  )}
                </div>
              )}

              {view === 'top-tracks' && (
                <div>
                  <button
                    onClick={() => setView('main')}
                    className="text-purple-400 hover:text-purple-300 mb-4 text-sm"
                  >
                    ← Back
                  </button>
                  <h4 className="text-white text-lg font-medium mb-4">Your Top Tracks</h4>
                  {loading ? (
                    <div className="text-center py-8 text-white/60">Loading...</div>
                  ) : topTracks.length > 0 ? (
                    renderTrackList(topTracks)
                  ) : (
                    <div className="text-center py-8 text-white/60">No top tracks found</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
