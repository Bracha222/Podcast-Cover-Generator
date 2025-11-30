// routes/audio.js
import express from 'express';
import uploadAudio from '../controllers/upload.js';
import generateCover from '../controllers/generate-covers.js';
import analyzeAudio from '../controllers/analyze.js';

const router = express.Router();

// Route להעלאת אודיו
router.post('/upload', uploadAudio);

// Route לניתוח אודיו
router.post('/analyze', analyzeAudio);

// Route ליצירת תמונות
router.post('/generate-covers', generateCover);

export default router;
