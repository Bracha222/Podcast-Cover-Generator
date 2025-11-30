import { genAI } from '@google/genai';

const analyzeAudioService = async (audioFileUrl) => {
  try {
    const analysisPrompt = {
      audioFile: audioFileUrl, // URL של קובץ האודיו
      instructions: `Analyze this audio file and provide:
      1. Main topic/content (2-3 sentences)
      2. Mood (energetic/calm/melancholic/happy)
      3. Genre (technology/business/entertainment/news/music)
      4. Target audience
      5. 3-5 keywords`,
    };

    // שליחה ל-Google Gemini API
    const analysis = await genAI.gen('gemini-3-pro-preview', analysisPrompt);
    return analysis; // מחזיר את התוצאה
  } catch (err) {
    throw new Error('Error analyzing audio');
  }
};

export default analyzeAudioService;
