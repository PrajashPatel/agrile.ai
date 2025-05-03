export default async function fetchWeather(city) {
    const apiKey = '853ef4084ff58dd1856b5a66e4cc0085';  // Replace with your actual key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather fetch failed');
    return await response.json();
  }
  