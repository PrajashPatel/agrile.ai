import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

export const detectDisease = async (req, res) => {
  try {
    console.log('detectDisease function called');

    const imagePath = req.file?.path;

    if (!imagePath) {
      return res.render('disease', { result: null, error: 'No image uploaded. Please upload an image.' });
    }

    if (!fs.existsSync(imagePath)) {
      return res.render('disease', { result: null, error: 'Image file not found. Please upload a valid image.' });
    }

    // Convert image to base64
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    const prompt = 'Describe the plant health condition based on this image. Is there any visible disease?';

    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(geminiApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Image
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return res.render('disease', { result: null, error: 'Failed to get a response from Gemini API.' });
    }

    const result = await response.json();
    const caption = result?.candidates?.[0]?.content?.parts?.[0]?.text || 'No description available.';

    res.render('disease', { result: caption, error: null });

  } catch (error) {
    console.error('Error during disease detection:', error);
    res.render('disease', { result: null, error: 'Failed to analyze image.' });
  }
};
