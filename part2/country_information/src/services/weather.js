import axios from 'axios'

const apiKey = import.meta.env.VITE_WEATHER_API_KEY
const baseUrl = 'https://api.openweathermap.org/data/2.5/weather'

const getWeather = (city, countryCode) => {
  const query = countryCode ? `${city},${countryCode}` : city
  const request = axios.get(
    `${baseUrl}?q=${encodeURIComponent(query)}&units=metric&appid=${apiKey}`,
  )
  return request.then((response) => response.data)
}

export default {
  getWeather,
}
