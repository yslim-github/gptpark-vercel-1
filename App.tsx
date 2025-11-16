
import React, { useState, useCallback } from 'react';
import { generateWallpapers } from './services/geminiService';
import type { GeneratedImage } from './types';
import ImageGrid from './components/ImageGrid';
import ImageModal from './components/ImageModal';
import Loader from './components/Loader';
import { SparklesIcon, QuestionMarkCircleIcon } from './components/Icons';
import HelpModal from './components/HelpModal';

// aistudio 객체에 대한 타입 선언
// FIX: Moved the `AIStudio` interface into the `declare global` block to resolve a TypeScript error about subsequent property declarations. This ensures the type is correctly scoped for augmenting the global `Window` interface.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isKeyReady, setIsKeyReady] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  const handleSelectKey = async () => {
    setError(null);
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // 키 선택 후에는 키가 준비되었다고 가정
        setIsKeyReady(true);
      }
    } catch (e) {
      console.error('API 키 선택 창을 여는 중 오류 발생:', e);
      setError('API 키를 설정하는 중 문제가 발생했습니다.');
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImages([]);

    try {
      const generatedImages = await generateWallpapers(prompt);
      setImages(generatedImages.map(url => ({ url, prompt })));
    } catch (err: any) {
      // API 키 관련 오류 감지
      if (err.message && (err.message.includes('API key not valid') || err.message.includes('Requested entity was not found'))) {
        setError('API 키가 유효하지 않습니다. 다시 선택해주세요.');
        setIsKeyReady(false); // 키 선택 화면으로 돌아가기
      } else {
        setError('이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading]);

  const handleSelectImage = (image: GeneratedImage) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };
  
  const handleOpenHelpModal = () => setIsHelpModalOpen(true);
  const handleCloseHelpModal = () => setIsHelpModalOpen(false);

  const handleRemix = (remixPrompt: string) => {
    setPrompt(remixPrompt);
    handleCloseModal();
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-wallpaper-${Date.now()}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isKeyReady) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            API 키 설정
          </h1>
          <p className="text-gray-300 mb-6">
            AI 배경화면을 생성하려면 Google AI API 키가 필요합니다. 아래 버튼을 클릭하여 API 키를 선택하거나 새로 생성하세요.
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline ml-1">
              API 사용 요금 정보
            </a>
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 active:scale-100"
          >
            API 키 선택하기
          </button>
          {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 sm:p-6 text-gray-100 font-sans">
      <header className="w-full max-w-2xl text-center mb-6 relative">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          AI 배경화면 생성기
        </h1>
        <p className="text-gray-400 mt-2">나만의 특별한 휴대폰 배경화면을 만들어 보세요.</p>
         <button
          onClick={handleOpenHelpModal}
          className="absolute top-0 right-0 p-1 text-gray-400 hover:text-white transition-colors"
          aria-label="도움말"
        >
          <QuestionMarkCircleIcon />
        </button>
      </header>

      <main className="w-full max-w-2xl flex-grow flex flex-col items-center">
        <div className="w-full sticky top-4 z-10 bg-gray-900/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-700">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="예: 비 오는 서정적인 도시 풍경, 네온사인, 8k"
            className="w-full p-3 bg-gray-800 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300 resize-none text-white placeholder-gray-500"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-100"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                생성 중...
              </>
            ) : (
              <>
                <SparklesIcon />
                배경화면 생성하기
              </>
            )}
          </button>
        </div>

        <div className="w-full mt-8 flex-grow">
          {error && <p className="text-center text-red-400">{error}</p>}
          
          {isLoading && <Loader />}
          
          {!isLoading && images.length === 0 && (
            <div className="text-center text-gray-500 mt-16">
              <p>원하는 배경화면 스타일을 설명해주세요.</p>
              <p className="text-sm mt-1">멋진 아이디어가 작품이 됩니다.</p>
            </div>
          )}

          <ImageGrid images={images} onImageClick={handleSelectImage} />
        </div>
      </main>

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={handleCloseModal}
          onDownload={handleDownload}
          onRemix={handleRemix}
        />
      )}
      
      <HelpModal isOpen={isHelpModalOpen} onClose={handleCloseHelpModal} />
    </div>
  );
};

export default App;
