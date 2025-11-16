import React, { useEffect } from 'react';
import { CloseIcon } from './Icons';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] relative animate-slide-up text-gray-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-xl font-bold text-white">도움말</h2>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="닫기"
            >
                <CloseIcon />
            </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
            <section>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">이 앱의 개요</h3>
                <p>
                    'AI 배경화면 생성기'는 여러분이 원하는 분위기나 컨셉을 텍스트로 설명하면, AI가 세상에 단 하나뿐인 독창적인 휴대폰 배경화면 이미지를 만들어주는 애플리케이션입니다.
                </p>
            </section>
            
            <section>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">주요 특징</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>맞춤형 생성</strong>: 간단한 텍스트 설명만으로 나만의 이미지를 만들 수 있습니다.</li>
                    <li><strong>휴대폰 최적화</strong>: 모든 이미지는 9:16 세로 비율로 생성되어 대부분의 스마트폰 화면에 잘 맞습니다.</li>
                    <li><strong>다양한 선택지</strong>: 한 번의 요청으로 4가지 버전의 이미지가 생성되어 마음에 드는 것을 고를 수 있습니다.</li>
                    <li><strong>리믹스 기능</strong>: 생성된 이미지의 프롬프트를 기반으로 새로운 아이디어를 탐색할 수 있습니다.</li>
                    <li><strong>간편한 저장</strong>: 마음에 드는 이미지는 버튼 하나로 쉽게 다운로드할 수 있습니다.</li>
                </ul>
            </section>

            <section>
                <h3 className="text-lg font-semibold text-purple-400 mb-2">상세 사용법</h3>
                <ol className="list-decimal list-inside space-y-2">
                    <li><strong>아이디어 입력</strong>: 메인 화면의 입력창에 만들고 싶은 배경화면의 분위기, 색감, 사물 등을 자유롭게 적어주세요. (예: "밤하늘의 오로라, 몽환적인 분위기", "사이버펑크 스타일의 고양이")</li>
                    <li><strong>생성하기</strong>: '배경화면 생성하기' 버튼을 누릅니다.</li>
                    <li><strong>결과 확인</strong>: AI가 잠시 생각한 후 4개의 이미지를 화면에 보여줍니다.</li>
                    <li><strong>크게 보기</strong>: 마음에 드는 이미지를 클릭하면 전체 화면으로 확대해서 볼 수 있습니다.</li>
                    <li><strong>저장 및 리믹스</strong>: 확대된 이미지 화면에서 '다운로드' 버튼으로 이미지를 저장하거나, '리믹스' 버튼을 눌러 현재 프롬프트를 입력창에 다시 불러와 수정 후 새로운 이미지를 만들 수 있습니다.</li>
                </ol>
            </section>
        </div>
        
        <div className="p-4 bg-gray-900/50 rounded-b-xl text-right flex-shrink-0">
             <button
                onClick={onClose}
                className="bg-purple-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-purple-600 transition-colors duration-300"
            >
                닫기
            </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default HelpModal;
