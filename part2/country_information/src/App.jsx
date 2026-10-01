import { useState, useEffect } from 'react'
import countriesService from './services/countries'
import CountryList from './components/CountryList'
import CountryDetail from './components/CountryDetail'

const App = () => {
  const [countries, setCountries] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)

  useEffect(() => {
    countriesService.getAll().then((initialCountries) => {
      setCountries(initialCountries)
    })
  }, [])

  const handleSearchChange = (event) => {
    setSearch(event.target.value)
    setSelectedCountry(null)
  }

  const filteredCountries = search.trim()
    ? countries.filter((country) =>
      country.name.common
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
    )
    : []

  return (
    <div className="container">
      <h2>Countries</h2>
      <div className="search-box">
        filter with name <input value={search} onChange={handleSearchChange} />
      </div>

      <div>
        {selectedCountry ? (
          <CountryDetail country={selectedCountry} />
        ) : filteredCountries.length > 10 ? (
          <div>Too many matches, specify another filter</div>
        ) : filteredCountries.length > 1 ? (
          <CountryList
            countries={filteredCountries}
            onSelectCountry={(country) => setSelectedCountry(country)}
          />
        ) : filteredCountries.length === 1 ? (
          <CountryDetail country={filteredCountries[0]} />
        ) : search.trim() ? (
          <div>No matches found</div>
        ) : null}
      </div>
    </div>
  )
}

export default App
