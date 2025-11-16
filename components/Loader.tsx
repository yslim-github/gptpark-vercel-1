
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center text-gray-400 mt-16">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-t-purple-500 border-gray-700 rounded-full animate-spin"></div>
        <div className="w-full h-full flex items-center justify-center">
            <i className="fa-solid fa-palette text-3xl text-purple-400 animate-pulse"></i>
        </div>
      </div>
      <p className="mt-4 text-lg font-semibold">AI가 이미지를 생성 중입니다...</p>
      <p className="text-sm">잠시만 기다려 주세요. 멋진 작품이 만들어지고 있습니다.</p>
    </div>
  );
};

export default Loader;
