import multer from 'multer';
import path from 'path';

// הגדרת Storage עבור Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // תיקיית העלאה
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    cb(null, Date.now() + fileExtension); // שם קובץ ייחודי עם timestamp
  }
});

// אובייקט Multer להעלאת קבצים
const upload = multer({ storage }).single('audio'); // 'audio' זה שם השדה ב-HTML

const uploadAudio = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error uploading file', details: err });
    }
    res.status(200).json({ message: 'File uploaded successfully', file: req.file });
  });
};

export default uploadAudio;
