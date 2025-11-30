import { genAI } from '@google/genai';

const generateCoverService = async (topic, mood, keywords) => {
  try {
    const prompt = {
      topic,
      mood,
      style: 'minimalist', // ניתן לשנות את הסגנון לפי הצורך
      keywords,
    };

    const imageConfig = {
      aspectRatio: '1:1',
      imageSize: '2K',
    };

    // שליחה ל-Google Gemini API
    const coverImage = await genAI.gen('gemini-3-pro-image-preview', prompt, imageConfig);
    return coverImage; // מחזיר את התמונה
  } catch (err) {
    throw new Error('Error generating cover');
  }
};

export default generateCoverService;
