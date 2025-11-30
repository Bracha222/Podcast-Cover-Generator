// services/generateCover.js
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
});


/**
 * topic   – נושא הפודקאסט
 * mood    – אווירה (energetic, calm, deep, וכו')
 * keywords – מערך של מילים חשובות
 *
 * מחזיר אובייקט עם:
 *  { imageBase64, mimeType }
 */
const generateCoverService = async (topic, mood, keywords) => {
  try {
    // עדיף לתת לפרומפט להיות טקסט נורמלי, לא JSON גולמי
    const prompt = `
You are a professional art director designing a square podcast cover (1:1).
Create a clean, modern, minimalist cover.

Podcast topic: ${topic || 'Unknown topic'}
Mood: ${mood || 'neutral'}
Keywords: ${Array.isArray(keywords) ? keywords.join(', ') : keywords || ''}

Design constraints:
- Layout: strong, readable title area and clear hierarchy
- Style: minimalist, high-contrast, suitable for Spotify / Apple Podcasts
- No small unreadable text, no clutter
- Make sure the design works well as a small thumbnail.
`;

    // יצירת תמונה עם Gemini 3 Pro Image Preview
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: [prompt],
      config: {
        // דרישה: imageConfig עם יחס ותמונה 2K
        imageConfig: {
          aspectRatio: '1:1',
          imageSize: '2K',
        },
        // אופציונלי – לבקש בפירוש גם טקסט וגם תמונה, אבל מה שמעניין אותנו זה ה־IMAGE
        responseModalities: ['IMAGE'],
      },
    });

    const candidates = response.candidates || [];
    if (!candidates.length) {
      throw new Error('No candidates returned from Gemini');
    }

    const parts = candidates[0].content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData);

    if (!imagePart || !imagePart.inlineData?.data) {
      throw new Error('No image data returned from Gemini');
    }

    const imageBase64 = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || 'image/png';

    // כאן את מחליטה אם:
    // - לשמור לקובץ פיזי
    // - להחזיר כ־base64 ל־client
    // - להעלות ל־Cloud Storage ולהחזיר URL

    return { imageBase64, mimeType };
  } catch (err) {
    console.error('Error in generateCoverService:', err);
    throw new Error('Error generating cover');
  }
};

export default generateCoverService;
