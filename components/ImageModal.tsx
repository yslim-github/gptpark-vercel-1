
import React, { useEffect } from 'react';
import type { GeneratedImage } from '../types';
import { DownloadIcon, RemixIcon, CloseIcon } from './Icons';

interface ImageModalProps {
  image: GeneratedImage;
  onClose: () => void;
  onDownload: (url: string) => void;
  onRemix: (prompt: string) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, onClose, onDownload, onRemix }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl flex flex-col w-full max-w-sm max-h-[95vh] relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-grow p-4 flex items-center justify-center overflow-hidden">
            <img 
                src={image.url} 
                alt="Selected wallpaper" 
                className="max-w-full max-h-full object-contain rounded-lg"
            />
        </div>
        
        <div className="p-4 bg-gray-900/50 rounded-b-xl flex justify-around items-center gap-2">
            <button 
                onClick={() => onDownload(image.url)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300 transform hover:scale-105"
            >
                <DownloadIcon />
                다운로드
            </button>
            <button 
                onClick={() => onRemix(image.prompt)}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors duration-300 transform hover:scale-105"
            >
                <RemixIcon />
                리믹스
            </button>
        </div>

        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-white text-gray-800 rounded-full h-8 w-8 flex items-center justify-center shadow-lg hover:bg-gray-200 transition-transform transform hover:scale-110"
          aria-label="닫기"
        >
          <CloseIcon />
        </button>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }

        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ImageModal;
