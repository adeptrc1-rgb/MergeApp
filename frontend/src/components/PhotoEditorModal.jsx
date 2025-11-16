import React, { useState } from 'react';
import { X, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

export default function PhotoEditorModal({ currentPhotos = [], onSave, onClose }) {
  const [photos, setPhotos] = useState(currentPhotos);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [error, setError] = useState('');

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (photos.length + files.length > 6) {
      setError('Maximum 6 photos allowed');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${API}/users/photos/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true
        });

        return response.data.url;
      });

      const newPhotoUrls = await Promise.all(uploadPromises);
      setPhotos(prev => [...prev, ...newPhotoUrls]);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload photos. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;

    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedIndex];
    
    // Remove from old position
    newPhotos.splice(draggedIndex, 1);
    // Insert at new position
    newPhotos.splice(index, 0, draggedPhoto);
    
    setPhotos(newPhotos);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = async () => {
    try {
      await onSave(photos);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      setError('Failed to save photos. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-black border border-white/20 rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h3 className="text-2xl font-light text-white mb-1">Edit Photos</h3>
            <p className="text-white/60 text-sm">Add up to 6 photos. Drag to reorder.</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Photos Grid */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className="relative aspect-square rounded-xl overflow-hidden group cursor-move border-2 border-white/10 hover:border-purple-400/50 transition-all"
                style={{
                  opacity: draggedIndex === index ? 0.5 : 1
                }}
              >
                <img 
                  src={photo} 
                  alt={`Photo ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                
                {/* Photo Number Badge */}
                <div className="absolute top-2 left-2 bg-black/80 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {index + 1}
                </div>
                
                {/* Main Photo Badge */}
                {index === 0 && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Main
                  </div>
                )}
                
                {/* Delete Button */}
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute bottom-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                {/* Drag Handle Indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <div className="text-white text-xs bg-black/60 px-3 py-1 rounded-full">
                    Drag to reorder
                  </div>
                </div>
              </div>
            ))}
            
            {/* Upload Slot */}
            {photos.length < 6 && (
              <label className="relative aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-purple-400/50 flex flex-col items-center justify-center cursor-pointer group transition-all bg-white/5 hover:bg-white/10">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-white/60 text-sm">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-white/80 text-sm font-medium">Add Photo</span>
                    <span className="text-white/40 text-xs">{6 - photos.length} remaining</span>
                  </>
                )}
              </label>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-start gap-3">
              <ImageIcon className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-white/60">
                <p className="mb-2"><strong className="text-white/80">Tips for great photos:</strong></p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>First photo is your main profile picture</li>
                  <li>Show your face clearly in at least 2 photos</li>
                  <li>Include photos that show your interests and personality</li>
                  <li>Drag photos to reorder them</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10 rounded-xl py-3 font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl py-3 font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={photos.length === 0}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
