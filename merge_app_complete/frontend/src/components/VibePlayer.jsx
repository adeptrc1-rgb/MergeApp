import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

export default function VibePlayer({ song }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  // song object structure: { title, artist, preview_url, album_art }

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    
    audioRef.current.currentTime = percentage * audioRef.current.duration;
    setProgress(percentage * 100);
  };

  if (!song || !song.preview_url) return null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#171717', border: '1px solid #262626' }}>
      {/* Album Art */}
      {song.album_art && (
        <div 
          className="w-12 h-12 rounded-lg bg-cover bg-center flex-shrink-0"
          style={{ backgroundImage: `url(${song.album_art})` }}
        />
      )}

      {/* Song Info & Controls */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex-1 min-w-0 mr-2">
            <p className="text-sm font-medium truncate" style={{ color: '#FAFAFA' }}>
              {song.title || 'Untitled'}
            </p>
            <p className="text-xs truncate" style={{ color: '#A3A3A3' }}>
              {song.artist || 'Unknown Artist'}
            </p>
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: isPlaying 
                ? 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)'
                : '#262626',
              border: isPlaying ? 'none' : '1px solid #404040'
            }}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" style={{ color: '#FFFFFF' }} />
            ) : (
              <Play className="w-4 h-4" style={{ color: '#FFFFFF', marginLeft: '2px' }} />
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div 
          className="w-full h-1 rounded-full cursor-pointer relative overflow-hidden"
          style={{ backgroundColor: '#262626' }}
          onClick={handleProgressClick}
        >
          <div
            className="absolute top-0 left-0 h-full transition-all"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)',
              boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)'
            }}
          />
        </div>
      </div>

      {/* Audio Element */}
      <audio ref={audioRef} src={song.preview_url} preload="metadata" />
    </div>
  );
}
