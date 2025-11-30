import express from 'express';
import uploadAudio from '../controllers/upload.js';  // תיקון נתיב יחסית
import generateCover from '../controllers/generate-covers.js';
import analyzeAudio from '../controllers/analyze.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route להעלאת אודיו
app.post('/upload', uploadAudio);

// Route לניתוח אודיו
app.post('/analyze', analyzeAudio);

// Route ליצירת תמונות
app.post('/generate-covers', generateCover);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
