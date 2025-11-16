
import React, { useState, useEffect, useCallback } from 'react';
import type { ApiKey } from '../types';
import { encrypt, decrypt } from '../services/cryptoService';
import { testApiKey } from '../services/geminiService';
import { CloseIcon } from './Icons';

interface ApiKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSetActiveKey: (key: string) => void;
  currentActiveKey: string | null;
}

const API_KEYS_STORAGE_KEY = 'apiKeys';

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ isOpen, onClose, onSetActiveKey, currentActiveKey }) => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newApiKey, setNewApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [testResults, setTestResults] = useState<Record<string, 'testing' | 'valid' | 'invalid' | null>>({});
  const [decryptedKeys, setDecryptedKeys] = useState<Record<string, string>>({});

  const loadKeys = useCallback(async () => {
    setIsLoading(true);
    const storedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
    const loadedKeys: ApiKey[] = storedKeys ? JSON.parse(storedKeys) : [];
    setKeys(loadedKeys);
    
    const decrypted: Record<string, string> = {};
    for (const key of loadedKeys) {
      try {
        decrypted[key.id] = await decrypt(key.encryptedKey);
      } catch (e) {
        console.error(`Failed to decrypt key ${key.id}`);
      }
    }
    setDecryptedKeys(decrypted);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadKeys();
    }
  }, [isOpen, loadKeys]);

  const saveKeys = (updatedKeys: ApiKey[]) => {
    setKeys(updatedKeys);
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(updatedKeys));
  };

  const handleTestKey = useCallback(async (keyId: string) => {
    const plainTextKey = decryptedKeys[keyId];
    if (!plainTextKey) return;

    setTestResults(prev => ({ ...prev, [keyId]: 'testing' }));
    const isValid = await testApiKey(plainTextKey);
    setTestResults(prev => ({ ...prev, [keyId]: isValid ? 'valid' : 'invalid' }));
  }, [decryptedKeys]);

  const handleAddKey = async () => {
    if (!newApiKey.trim()) return;
    const trimmedKey = newApiKey.trim();
    setNewApiKey('');

    if (Object.values(decryptedKeys).includes(trimmedKey)) {
        alert("이 API 키는 이미 존재합니다.");
        return;
    }

    const id = Date.now().toString();
    const partialKey = `${trimmedKey.slice(0, 4)}...${trimmedKey.slice(-4)}`;
    
    try {
      const encryptedKey = await encrypt(trimmedKey);
      const newKeyEntry: ApiKey = { id, encryptedKey, partialKey };
      
      const updatedDecrypted = { ...decryptedKeys, [id]: trimmedKey };
      setDecryptedKeys(updatedDecrypted);
      
      const updatedKeys = [...keys, newKeyEntry];
      saveKeys(updatedKeys);

      setTestResults(prev => ({ ...prev, [id]: 'testing' }));
      const isValid = await testApiKey(trimmedKey);
      setTestResults(prev => ({ ...prev, [id]: isValid ? 'valid' : 'invalid' }));
      
      if (isValid && keys.length === 0) {
        handleSetActiveKey(id);
      }
    } catch (e) {
        console.error("Failed to encrypt new key", e);
        alert("키를 암호화하는 데 실패했습니다.");
    }
  };

  const handleDeleteKey = (keyId: string) => {
    const keyToDelete = decryptedKeys[keyId];
    if (keyToDelete === currentActiveKey) {
        onSetActiveKey('');
    }
    const updatedKeys = keys.filter(key => key.id !== keyId);
    saveKeys(updatedKeys);
    
    const updatedDecrypted = { ...decryptedKeys };
    delete updatedDecrypted[keyId];
    setDecryptedKeys(updatedDecrypted);
  };

  const handleSetActiveKey = (keyId: string) => {
    const keyToSet = decryptedKeys[keyId];
    if (keyToSet) {
        onSetActiveKey(keyToSet);
        onClose();
    }
  };

  if (!isOpen) return null;

  const renderTestStatus = (keyId: string) => {
    const status = testResults[keyId];
    switch (status) {
      case 'testing':
        return <span className="text-yellow-400 text-sm">테스트 중...</span>;
      case 'valid':
        return <span className="text-green-400 text-sm">✓ 유효함</span>;
      case 'invalid':
        return <span className="text-red-400 text-sm">✗ 유효하지 않음</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] relative animate-slide-up text-gray-300 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">API 키 관리</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="닫기"><CloseIcon /></button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="space-y-2">
            <label htmlFor="apiKeyInput" className="font-semibold">새 API 키 추가</label>
            <div className="flex gap-2">
              <input
                id="apiKeyInput"
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="Google AI API 키를 여기에 붙여넣으세요"
                className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
              />
              <button onClick={handleAddKey} className="bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors">추가</button>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">저장된 키</h3>
            {isLoading ? <p>키를 불러오는 중...</p> : (
              <div className="space-y-3">
                {keys.length === 0 ? <p className="text-gray-500">저장된 API 키가 없습니다.</p> : keys.map(key => (
                  <div key={key.id} className="bg-gray-700 p-3 rounded-lg flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex-grow min-w-[150px]">
                        <p className="font-mono">{key.partialKey}</p>
                        {decryptedKeys[key.id] === currentActiveKey && <span className="text-xs text-green-400 font-bold">활성</span>}
                    </div>
                    <div className="flex items-center gap-3">
                        {renderTestStatus(key.id)}
                        <button onClick={() => handleTestKey(key.id)} className="text-gray-400 hover:text-white text-lg" title="연결 테스트">
                            <i className="fa-solid fa-plug-circle-check"></i>
                        </button>
                         <button
                            onClick={() => handleSetActiveKey(key.id)}
                            className="bg-blue-500 text-white text-xs font-bold py-1 px-2 rounded hover:bg-blue-600 disabled:opacity-50"
                            disabled={decryptedKeys[key.id] === currentActiveKey}
                        >
                            사용
                        </button>
                        <button onClick={() => handleDeleteKey(key.id)} className="text-red-400 hover:text-red-300 text-lg" title="삭제">
                            <i className="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-gray-900/50 rounded-b-xl text-right">
          <button onClick={onClose} className="bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors">닫기</button>
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

export default ApiKeyManager;
