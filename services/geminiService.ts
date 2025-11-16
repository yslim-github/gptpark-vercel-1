
import { GoogleGenAI } from "@google/genai";

export async function generateWallpapers(prompt: string): Promise<string[]> {
  // 호출 시마다 새 클라이언트 인스턴스를 생성하여 최신 API 키를 사용합니다.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
