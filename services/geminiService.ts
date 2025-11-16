
import { GoogleGenAI } from "@google/genai";

export async function testApiKey(apiKey: string): Promise<boolean> {
  if (!apiKey) return false;
  const ai = new GoogleGenAI({ apiKey });
  try {
    // 앱의 주 기능인 이미지 생성을 테스트하여 키 권한까지 확인합니다.
    await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: 'test',
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
      },
    });
    return true;
  } catch (error) {
    console.error("API Key test failed:", error);
    return false;
  }
}

export async function generateWallpapers(prompt: string, apiKey: string): Promise<string[]> {
  // API 키를 인자로 받아 클라이언트를 생성합니다.
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `A beautiful 9:16 mobile phone wallpaper of: ${prompt}. Cinematic, high detail, vibrant colors.`,
      config: {
        numberOfImages: 4,
        outputMimeType: 'image/jpeg',
        aspectRatio: '9:16',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages.map(img => {
        const base64ImageBytes: string = img.image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
      });
    } else {
      throw new Error("No images were generated.");
    }
  } catch (error) {
    console.error("Error generating images with Gemini:", error);
    // UI 레이어에서 오류를 처리할 수 있도록 원본 오류를 다시 throw합니다.
    throw error;
  }
}
