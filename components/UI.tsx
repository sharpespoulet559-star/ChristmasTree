import React, { useRef } from 'react';
import { AppMode } from '../types';

interface UIProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  onUploadImages: (urls: string[]) => void; // Changed to accept array
  selectedPhoto: string | null;
  onClosePhoto: () => void;
  toggleFullScreen: () => void;
}

const UI: React.FC<UIProps> = ({ 
  currentMode, 
  setMode, 
  onUploadImages, 
  selectedPhoto,
  onClosePhoto,
  toggleFullScreen
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Process multiple files
      const promises = Array.from(files).map((file: File) => {
        return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    resolve(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        });
      });

      Promise.all(promises).then(images => {
        if (images.length > 0) {
            onUploadImages(images);
        }
      });
    }
    // Reset input so same files can be selected again if needed
    if (event.target) event.target.value = '';
  };

  return (
    <>
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-3 items-end">
        {/* Full Screen */}
        <button 
          onClick={toggleFullScreen}
          className="bg-white/10 backdrop-blur-md p-2 rounded-full hover:bg-white/20 transition text-white border border-white/20"
          title="Toggle Fullscreen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>

        {/* Upload Image */}
        <div className="flex flex-col items-end">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            multiple // 1. Support batch upload
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition transform font-semibold flex items-center gap-2"
          >
            <span>📷 Upload Photos</span>
          </button>
        </div>
      </div>

      {/* Bottom Mode Switchers - Only Tree and Galaxy */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 bg-black/40 backdrop-blur-xl rounded-2xl p-2 flex gap-4 border border-white/10 shadow-2xl transition-all hover:bg-black/60">
        <ModeButton 
          active={currentMode === AppMode.TREE} 
          onClick={() => setMode(AppMode.TREE)} 
          label="🎄 Christmas Tree"
        />
        <ModeButton 
          active={currentMode === AppMode.GALAXY} 
          onClick={() => setMode(AppMode.GALAXY)} 
          label="🌌 Galaxy"
        />
      </div>

      {/* Lightbox Modal for Photo with Silky Transition */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-700 ease-out ${selectedPhoto ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClosePhoto}
      >
        <div 
          className={`relative p-2 rounded-xl shadow-[0_0_100px_rgba(255,215,0,0.3)] transform transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) ${selectedPhoto ? 'scale-100 translate-y-0 opacity-100' : 'scale-50 translate-y-20 opacity-0'}`}
          onClick={(e) => e.stopPropagation()} 
        >
            {selectedPhoto && (
                <>
                    <button 
                    onClick={onClosePhoto}
                    className="absolute -top-10 -right-10 bg-white/10 hover:bg-white/30 text-white rounded-full w-10 h-10 flex items-center justify-center transition backdrop-blur-sm border border-white/20"
                    >
                    ✕
                    </button>
                    {/* Photo Frame Effect */}
                    <div className="bg-gradient-to-br from-yellow-200 to-yellow-600 p-[3px] rounded-lg shadow-2xl">
                        <div className="bg-black rounded-md overflow-hidden relative group">
                            <img 
                                src={selectedPhoto} 
                                alt="Memory" 
                                className="max-h-[85vh] max-w-[90vw] object-contain block shadow-inner" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                    </div>
                </>
            )}
        </div>
      </div>
    </>
  );
};

const ModeButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-500 transform ${
      active 
        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white scale-105 shadow-[0_0_15px_rgba(129,140,248,0.5)]' 
        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:scale-105'
    }`}
  >
    {label}
  </button>
);

export default UI;