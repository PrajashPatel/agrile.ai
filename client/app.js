import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import signupRouter from './routes/signup.js';
import multer from 'multer';
import { router as weatherRoutes } from './routes/weather.js';
import { marked } from 'marked';
import dotenv from 'dotenv';
dotenv.config();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const geminiApiKey = process.env.GEMINI_API_KEY;
const flaskApiUrl = process.env.FLASK_API_URL;

app.post('/weather', async (req, res) => {
  const city = req.body.city;
  const apiKey = '853ef4084ff58dd1856b5a66e4cc0085';

  try {
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    const weatherData = weatherResponse.data;
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const prompt = `Give plain text farming advice based on this weather:\nCity: ${city}\nDate: ${today}\nTemperature: ${weatherData.main.temp}°C\nHumidity: ${weatherData.main.humidity}%\nCondition: ${weatherData.weather[0].description}\nAvoid markdown formatting. Do not wrap content in code blocks or mention any specific past date. Just give clean, readable advice.`;

    const advice = await getFarmingAdvice(prompt);
    res.render('partials/weather-result', { weatherData, advice });
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    res.render('partials/weather-result', { weatherData: null, advice: 'Unable to fetch weather data. Please try again.' });
  }
});

async function getFarmingAdvice(prompt) {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
    {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    },
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );

  if (!response.data.candidates || response.data.candidates.length === 0) {
    return 'No advice received from Gemini API.';
  }

  return response.data.candidates[0].content.parts[0].text || 'No advice available.';
}

const sanitizeAdvice = (advice) => {
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(advice);
  if (isHtml) {
    return advice;
  }
  return marked(advice);
};

app.get('/', (req, res) => {
  res.render('landing');
});

app.get('/landing', (req, res) => {
  res.render('landing');
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

app.get('/logout', (req, res) => {
  res.redirect('/login');
});

app.get('/crop/partial', (req, res) => {
  res.render('partials/crop-form');
});

app.get('/weather/partial', (req, res) => {
  res.render('partials/weather-form');
});

app.get('/disease/partial', (req, res) => {
  res.render('partials/disease');
});

app.get('/weather', (req, res) => {
  res.render('weather');
});

app.get('/disease', (req, res) => {
  res.render('disease');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/crop', (req, res) => {
  res.render('crop');
});

app.get('/load/:section', (req, res) => {
  const section = req.params.section;
  res.render(`partials/${section}`);
});

app.use('/', signupRouter);
app.use('/weather', weatherRoutes);

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const dataPath = path.join(__dirname, 'users.json');
  let users = [];

  if (fs.existsSync(dataPath)) {
    users = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  }

  const user = users.find(u => u.email === email);

  if (user && user.password === password) {
    res.redirect('/dashboard');
  } else {
    res.render('login', { error: 'Invalid email or password' });
  }
});

app.post('/recommend-crop', async (req, res) => {
  const { pH_Value, Rainfall, Temperature, Humidity } = req.body;

  try {
    const response = await axios.post('http://127.0.0.1:5000/predict', {
      pH_Value,
      Rainfall,
      Temperature,
      Humidity
    });

    const data = response.data;

    if (data.predicted_crop) {
      res.render('partials/crop-result', { recommendedCrop: data.predicted_crop, error: null });
    } else {
      res.render('partials/crop-result', { recommendedCrop: null, error: 'Failed to get a valid crop recommendation.' });
    }
  } catch (error) {
    console.error('Error fetching from Flask API:', error.message);
    res.render('partials/crop-result', { recommendedCrop: null, error: 'Error while fetching recommendation.' });
  }
});

app.post('/upload-image', upload.single('image'), async (req, res) => {
  const rawPath = req.file.path;
  const imagePath = rawPath.replace(/\\/g, '/');
  const imageBuffer = fs.readFileSync(imagePath);
  const imageBase64 = imageBuffer.toString('base64');

  const geminPrompt = `Analyze the following image and identify any plant disease if visible.\n\n1. Provide a short disease description (2-3 lines).\n2. Suggest short-term solutions and long-term prevention.\n\nRespond in the format:\n---\nDisease Description:\n<your description>\n\nAdvice:\n<your advice>\n---`;
  const geminiPrompt = `
You are a plant disease identification expert.

analyze the image and provide a detailed response.

Based on the image, generate:
what could be the possible disease to plant. and also,
1. A short plant disease description (2-3 lines, avoid vague suggestions like "need more info").
2. Detailed farming advice including likely causes, short-term solutions, and long-term prevention.

Respond in this exact format:
---
Disease Description:
<your description here>

Advice:
<your farming advice here>
---
    `;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`,
      {
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageBase64
                }
              },
              {
                text: geminiPrompt
              }
            ]
          }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const rawText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const diseaseMatch = rawText.match(/Disease Description:\s*(.+?)\nAdvice:/s);
    const adviceMatch = rawText.match(/Advice:\s*(.+)/s);

    const imageDescription = diseaseMatch ? diseaseMatch[1].trim() : 'No clear disease detected.';
    const rawAdvice = adviceMatch ? adviceMatch[1].trim() : 'No advice generated.';

    const advice = sanitizeAdvice(rawAdvice);

    res.render('partials/disease', {
      imageDescription,
      advice,
      error: null,
      isAjax: req.xhr
    });
  } catch (error) {
    console.error('Gemini API error:', error.message);
    res.render('partials/disease', {
      imageDescription: '',
      advice: '',
      error: 'Failed to fetch advice from Gemini.',
      isAjax: req.xhr
    });
  }
});

// Middleware to set AJAX context
app.use((req, res, next) => {
  res.locals.isAjax = req.xhr;
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Sorry, that route does not exist.');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
