import { useState, useEffect } from 'react'
import weatherService from '../services/weather'

const Weather = ({ capital, countryCode }) => {
  const [weather, setWeather] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!capital) return

    weatherService
      .getWeather(capital, countryCode)
      .then((data) => {
        setWeather(data)
        setError(null)
      })
      .catch((err) => {
        console.error('Failed to load weather data', err)
        setError('Could not load weather data')
      })
  }, [capital, countryCode])

  if (error) {
    return <div>{error}</div>
  }

  if (!weather) {
    return <div>Loading weather...</div>
  }

  const iconCode = weather.weather[0]?.icon
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`

  return (
    <div className="weather-card">
      <h2>Weather in {capital}</h2>
      <div>temperature {weather.main.temp} Celsius</div>
      {iconCode && (
        <img
          className="weather-icon"
          src={iconUrl}
          alt={weather.weather[0]?.description || 'weather icon'}
        />
      )}
      <div>wind {weather.wind.speed} m/s</div>
    </div>
  )
}

export default Weather
