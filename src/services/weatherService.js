import * as Location from 'expo-location';

// Hava durumu kaynakları
const WEATHER_SOURCES = {
  OPENWEATHER: 'openweather',
  WEATHERKIT: 'weatherkit', // iOS 16+ için Apple WeatherKit
  DEMO: 'demo'
};

// OpenWeatherMap API - Ücretsiz API key almak için: https://openweathermap.org/api
// Key, EXPO_PUBLIC_OPENWEATHER_API_KEY ortam değişkeninden okunur (bkz. .env.example).
// Tanımlı değilse aşağıdaki fonksiyonlar otomatik olarak demo veriye düşer.
const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Demo veriler - Konum izni olmadığında veya API hatası durumunda
const DEMO_WEATHER_DATA = {
  temperature: 18,
  condition: 'sunny',
  description: 'Açık',
  icon: '☀️',
  city: 'Demo'
};

// Hava durumu koşullarını dil bazlı çevir
const getWeatherCondition = (condition, language = 'tr') => {
  const conditions = {
    'tr': {
      'clear': 'Açık',
      'sunny': 'Güneşli',
      'clouds': 'Bulutlu',
      'rain': 'Yağmurlu',
      'drizzle': 'Çiseleyen',
      'snow': 'Karlı',
      'thunderstorm': 'Fırtınalı',
      'mist': 'Sisli',
      'fog': 'Sisli',
      'haze': 'Puslu',
      'smoke': 'Dumanlı'
    },
    'en': {
      'clear': 'Clear',
      'sunny': 'Sunny',
      'clouds': 'Cloudy',
      'rain': 'Rainy',
      'drizzle': 'Drizzle',
      'snow': 'Snowy',
      'thunderstorm': 'Stormy',
      'mist': 'Misty',
      'fog': 'Foggy',
      'haze': 'Hazy',
      'smoke': 'Smoky'
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
    'drizzle': '🌦️',
    'snow': '❄️',
    'thunderstorm': '⛈️',
    'mist': '🌫️',
    'fog': '🌫️',
    'haze': '🌫️',
    'smoke': '💨'
  };
  return icons[condition] || '🌤️';
};

// Konum izni iste
const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('❌ Konum izni hatası:', error);
    return false;
  }
};

// Kullanıcının mevcut konumunu al
const getUserLocation = async () => {
  try {
    const hasPermission = await requestLocationPermission();
    
    if (!hasPermission) {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeout: 10000, // 10 saniye timeout
      maximumAge: 60000 // 1 dakika cache
    });

    console.log('📍 GPS konumu alındı:', {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };
  } catch (error) {
    console.error('❌ Konum alma hatası:', error);
    return null;
  }
};

// Koordinatlara göre hava durumu al
export const getWeatherByCoordinates = async (latitude, longitude, language = 'tr') => {
  try {
    // API key kontrolü
    if (!API_KEY || API_KEY === 'your_api_key_here') {
      return getDemoWeather(language);
    }

    const langCode = language === 'tr' ? 'tr' : 'en';
    const url = `${BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=${langCode}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      let apiMsg = '';
      try {
        const body = await response.json();
        apiMsg = body?.message || '';
      } catch {}
      console.warn(`⚠️ OpenWeather API hata: ${response.status} ${response.statusText} ${apiMsg}`);
      return getDemoWeather(language);
    }
    
    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main.toLowerCase(),
      description: getWeatherCondition(data.weather[0].main.toLowerCase(), language),
      icon: getWeatherIcon(data.weather[0].main.toLowerCase()),
      city: data.name || (language === 'tr' ? 'Konum' : 'Location'),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6) // m/s to km/h
    };
  } catch (error) {
    console.warn('⚠️ Hava durumu API hatası:', error?.message || String(error));
    return getDemoWeather(language);
  }
};

// Şehir adına göre hava durumu al (yedek metod)
export const getWeatherByCity = async (city = 'Istanbul', language = 'tr') => {
  try {
    // API key kontrolü
    if (!API_KEY || API_KEY === 'your_api_key_here') {
      return getDemoWeather(language);
    }

    const langCode = language === 'tr' ? 'tr' : 'en';
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=${langCode}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      let apiMsg = '';
      try {
        const body = await response.json();
        apiMsg = body?.message || '';
      } catch {}
      console.warn(`⚠️ OpenWeather API hata: ${response.status} ${response.statusText} ${apiMsg}`);
      return getDemoWeather(language);
    }
    
    const data = await response.json();
    
    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main.toLowerCase(),
      description: getWeatherCondition(data.weather[0].main.toLowerCase(), language),
      icon: getWeatherIcon(data.weather[0].main.toLowerCase()),
      city: data.name,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6)
    };
  } catch (error) {
    console.warn('⚠️ Hava durumu API hatası:', error?.message || String(error));
    return getDemoWeather(language);
  }
};

// iOS WeatherKit kullanarak hava durumu al (iOS 16+)
const getWeatherFromWeatherKit = async (latitude, longitude, language = 'tr') => {
  try {
    // WeatherKit sadece native iOS uygulamalarında çalışır
    // React Native/Expo'da direkt erişim yok
    return null;
  } catch (error) {
    console.error('❌ WeatherKit hatası:', error);
    return null;
  }
};

// Ana hava durumu fonksiyonu - Otomatik konum bazlı
export const getCurrentWeather = async (language = 'tr') => {
  try {
    // Önce kullanıcının konumunu almaya çalış
    const location = await getUserLocation();
    
    if (location) {
      
      // Önce WeatherKit'i dene (iOS 16+)
      try {
        const weatherKitData = await getWeatherFromWeatherKit(location.latitude, location.longitude, language);
        if (weatherKitData) {
          return { success: true, data: weatherKitData, source: 'weatherkit' };
        }
      } catch (weatherKitError) {
      }
      
      // WeatherKit başarısızsa OpenWeatherMap'i dene
      try {
        const weather = await getWeatherByCoordinates(location.latitude, location.longitude, language);
        return { success: true, data: weather, source: 'openweather' };
      } catch (weatherError) {
        console.error('❌ OpenWeatherMap hatası:', weatherError);
        // API hatası durumunda demo veri döndür
        return { success: true, data: getDemoWeather(language), source: 'demo' };
      }
    }

    // Konum alınamazsa demo veri döndür
    return { success: true, data: getDemoWeather(language), source: 'demo' };
    
  } catch (error) {
    console.error('❌ Hava durumu genel hatası:', error);
    // Hata durumunda demo veri döndür
    return { success: true, data: getDemoWeather(language), source: 'demo' };
  }
};

// Demo hava durumu verilerini döndür (Konum izni olmadan)
export const getDemoWeather = (language = 'tr') => {
  const demoConditions = {
    'tr': [
      { temperature: 18, condition: 'sunny', description: 'Güneşli', icon: '☀️', city: 'İstanbul' },
      { temperature: 22, condition: 'clear', description: 'Açık', icon: '☀️', city: 'İstanbul' },
      { temperature: 15, condition: 'clouds', description: 'Bulutlu', icon: '☁️', city: 'İstanbul' },
      { temperature: 12, condition: 'rain', description: 'Yağmurlu', icon: '🌧️', city: 'İstanbul' },
      { temperature: 25, condition: 'sunny', description: 'Güneşli', icon: '☀️', city: 'İstanbul' }
    ],
    'en': [
      { temperature: 18, condition: 'sunny', description: 'Sunny', icon: '☀️', city: 'Istanbul' },
      { temperature: 22, condition: 'clear', description: 'Clear', icon: '☀️', city: 'Istanbul' },
      { temperature: 15, condition: 'clouds', description: 'Cloudy', icon: '☁️', city: 'Istanbul' },
      { temperature: 12, condition: 'rain', description: 'Rainy', icon: '🌧️', city: 'Istanbul' },
      { temperature: 25, condition: 'sunny', description: 'Sunny', icon: '☀️', city: 'Istanbul' }
    ]
  };
  
  const conditions = demoConditions[language] || demoConditions['tr'];
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  return randomCondition;
};

export default {
  getCurrentWeather,
  getWeatherByCoordinates,
  getWeatherByCity,
  getDemoWeather,
  requestLocationPermission,
  getUserLocation
};
