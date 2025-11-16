
import React from 'react';
import type { GeneratedImage } from '../types';

interface ImageGridProps {
  images: GeneratedImage[];
  onImageClick: (image: GeneratedImage) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, onImageClick }) => {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {images.map((image, index) => (
        <div
          key={index}
          className="aspect-[9/16] rounded-lg overflow-hidden cursor-pointer group relative shadow-lg"
          onClick={() => onImageClick(image)}
        >
          <img
            src={image.url}
            alt={`Generated wallpaper ${index + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
             <i className="fa-solid fa-expand text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
