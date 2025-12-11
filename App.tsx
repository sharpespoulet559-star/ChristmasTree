import React, { useState, useEffect } from 'react';
import Scene from './components/Scene';
import UI from './components/UI';
import { AppMode, ParticleData } from './types';
import { PRELOADED_IMAGES } from './constants';

export const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.TREE);
  const [userImages, setUserImages] = useState<string[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Load configuration images
  useEffect(() => {
    const urls = PRELOADED_IMAGES.map(img => img.url);
    setUserImages(prev => {
        // Initial load deduplication
        return Array.from(new Set([...prev, ...urls]));
    });
  }, []);

  // Update to handle batch upload array with DEDUPLICATION
  const handleUploadImages = (urls: string[]) => {
    setUserImages(prev => {
        // Create a new unique list combining existing images and new uploads
        const uniqueImages = Array.from(new Set([...prev, ...urls]));
        return uniqueImages;
    });
  };

  const handleSelectPhoto = (data: ParticleData) => {
    if (typeof data.content === 'string') {
      setSelectedPhoto(data.content);
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-[#050510]">
      <Scene 
        mode={mode} 
        userImages={userImages} 
        onSelectPhoto={(data: any) => handleSelectPhoto(data)}
      />
      
      <UI 
        currentMode={mode}
        setMode={setMode}
        onUploadImages={handleUploadImages}
        selectedPhoto={selectedPhoto}
        onClosePhoto={() => setSelectedPhoto(null)}
        toggleFullScreen={toggleFullScreen}
      />
    </div>
  );
};