import generateCoverService from '../services/generateCover.js';

const generateCover = async (req, res) => {
  try {
    // קבלת נתונים מהלקוח (נושא, מצב רוח, מילות מפתח)
    const { topic, mood, keywords } = req.body;

    // קריאה לשירות ליצירת תמונה
    const coverImage = await generateCoverService(topic, mood, keywords);

    // החזרת התמונה ללקוח
    res.status(200).json({ image: coverImage });
  } catch (err) {
    // טיפול בשגיאה במקרה של כישלון בתהליך
    res.status(500).json({ error: 'Error generating cover', details: err.message });
  }
};

export default generateCover;
