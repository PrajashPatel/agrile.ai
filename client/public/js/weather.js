import fetchWeather from './weatherAPI.js';

const geminiApiKey = 'AIzaSyBb8QoxuBSsuw4Wl6KsI-UxW0NQL1BwZs4'; // Replace this

async function getFarmingAdvice(prompt) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) throw new Error('Gemini API request failed');
  const result = await response.json();
  const advice = result.candidates?.[0]?.content?.parts?.[0]?.text.trim() || 'No advice received.';
  return advice.replace(/```html|```/g, ''); // Remove ```html and ```
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const resultSection = document.querySelector('#result');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const city = form.city.value;

    try {
      const response = await fetch('/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city }),
      });

      const data = await response.json();

      if (data.weatherData) {
        const currentDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        resultSection.innerHTML = `
          <p><strong>City:</strong> ${data.weatherData.name}</p>
          <p><strong>Temperature:</strong> ${data.weatherData.main.temp}°C</p>
          <p><strong>Condition:</strong> ${data.weatherData.weather[0].description}</p>
          <p><strong>Humidity:</strong> ${data.weatherData.main.humidity}%</p>
          <div class="advice-section">
            <h3>Farming Advice for ${data.weatherData.name} - ${currentDate}</h3>
            ${data.advice} <!-- Insert advice as raw HTML -->
          </div>
        `;
      } else {
        resultSection.innerHTML = `<p>${data.advice}</p>`;
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      resultSection.innerHTML = '<p>Failed to fetch weather data. Please try again.</p>';
    }
  });
});
