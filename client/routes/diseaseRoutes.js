import express from 'express';
import multer from 'multer';
import path from 'path';
import { detectDisease } from '../public/js/diseasecontroller.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/detect-disease', upload.single('image'), detectDisease);

export default router;
