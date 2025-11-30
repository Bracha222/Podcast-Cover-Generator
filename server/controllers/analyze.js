import analyzeAudioService from '../services/analyzeAudio.js';

const analyzeAudio = async (req, res) => {
  try {
    const audioFileUrl = req.body.audioFileUrl; // קובץ האודיו שהועלה (ה-URL שלו)
    const analysis = await analyzeAudioService(audioFileUrl); // פנייה לשירות לניתוח האודיו
    res.status(200).json(analysis); // החזרת תוצאה ללקוח
  } catch (err) {
    res.status(500).json({ error: 'Error analyzing audio', details: err.message });
  }
};

export default analyzeAudio;

