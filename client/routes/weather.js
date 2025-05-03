import express from 'express';

const router = express.Router();

// Mock function to fetch weather data (replace with actual API call)
async function fetchWeatherData(city) {
  if (!city) throw new Error('City is required');
  // Simulate weather data
  return {
    name: city,
    main: { temp: 25, humidity: 60 },
    weather: [{ description: 'clear sky' }],
  };
}

// Route to serve the weather partial
router.get('/partial', async (req, res) => {
  try {
    const city = req.query.city || 'Default City'; // Default city if none provided
    const weatherData = await fetchWeatherData(city);
    const advice = 'Based on the weather, irrigation is recommended today.';
    
    // Ensure the template exists and render it
    res.render('partials/weather-form', { weatherData, advice });
  } catch (error) {
    console.error('Error fetching weather data:', error.message);

    // Send a fallback response if rendering fails
    res.status(500).send('Failed to load weather data or render the template.');
  }
});

export { router }; // Named export
