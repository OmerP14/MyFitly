// Hava durumu servisi - OpenWeatherMap API kullanarak
const API_KEY = 'your_api_key_here'; // Gerçek API key'i buraya ekleyin
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Demo veriler - API key olmadan test için
const DEMO_WEATHER_DATA = {
  temperature: 18,
  condition: 'sunny',
  description: 'Açık',
  icon: '☀️'
};

// Hava durumu koşullarını dil bazlı çevir
const getWeatherCondition = (condition, language = 'tr') => {
  const conditions = {
    'tr': {
      'clear': 'Açık',
      'sunny': 'Güneşli',
      'clouds': 'Bulutlu',
      'rain': 'Yağmurlu',
      'snow': 'Karlı',
      'thunderstorm': 'Fırtınalı',
      'mist': 'Sisli',
      'fog': 'Sisli',
      'haze': 'Puslu'
    },
    'en': {
      'clear': 'Clear',
      'sunny': 'Sunny',
      'clouds': 'Cloudy',
      'rain': 'Rainy',
      'snow': 'Snowy',
      'thunderstorm': 'Stormy',
      'mist': 'Misty',
      'fog': 'Foggy',
      'haze': 'Hazy'
    }
  };
  return conditions[language]?.[condition] || (language === 'tr' ? 'Bilinmiyor' : 'Unknown');
};

// Hava durumu ikonlarını belirle
const getWeatherIcon = (condition) => {
  const icons = {
    'clear': '☀️',
    'sunny': '☀️',
    'clouds': '☁️',
    'rain': '🌧️',
    'snow': '❄️',
    'thunderstorm': '⛈️',
    'mist': '🌫️',
    'fog': '🌫️',
    'haze': '🌫️'
  };
  return icons[condition] || '🌤️';
};

// Gerçek hava durumu verilerini al (API key gerekli)
export const getCurrentWeather = async (city = 'Istanbul', language = 'tr') => {
  try {
    // API key yoksa demo veri döndür
    if (API_KEY === 'your_api_key_here') {
      const demoData = getDemoWeather(language);
      return demoData;
    }

    const langCode = language === 'tr' ? 'tr' : 'en';
    const response = await fetch(
      `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=${langCode}`
    );
    
    if (!response.ok) {
      throw new Error('Hava durumu verisi alınamadı');
    }
    
    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main.toLowerCase(),
      description: getWeatherCondition(data.weather[0].main.toLowerCase(), language),
      icon: getWeatherIcon(data.weather[0].main.toLowerCase())
    };
  } catch (error) {
    console.error('Hava durumu hatası:', error);
    // Hata durumunda demo veri döndür
    return getDemoWeather(language);
  }
};

// Demo hava durumu verilerini döndür (API key olmadan)
export const getDemoWeather = (language = 'tr') => {
  const demoConditions = {
    'tr': [
      { temperature: 18, condition: 'sunny', description: 'Güneşli', icon: '☀️' },
      { temperature: 22, condition: 'clear', description: 'Açık', icon: '☀️' },
      { temperature: 15, condition: 'clouds', description: 'Bulutlu', icon: '☁️' },
      { temperature: 12, condition: 'rain', description: 'Yağmurlu', icon: '🌧️' },
      { temperature: 25, condition: 'sunny', description: 'Güneşli', icon: '☀️' }
    ],
    'en': [
      { temperature: 18, condition: 'sunny', description: 'Sunny', icon: '☀️' },
      { temperature: 22, condition: 'clear', description: 'Clear', icon: '☀️' },
      { temperature: 15, condition: 'clouds', description: 'Cloudy', icon: '☁️' },
      { temperature: 12, condition: 'rain', description: 'Rainy', icon: '🌧️' },
      { temperature: 25, condition: 'sunny', description: 'Sunny', icon: '☀️' }
    ]
  };
  
  const conditions = demoConditions[language] || demoConditions['tr'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  return randomCondition;
};

export default {
  getCurrentWeather,
  getDemoWeather
};
