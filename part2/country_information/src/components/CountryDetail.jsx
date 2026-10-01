import Weather from './Weather'

const CountryDetail = ({ country }) => {
  const capital = country.capital?.[0]
  const languages = Object.values(country.languages || {})
  const flagUrl = country.flags?.png || country.flags?.svg
  const flagAlt = country.flags?.alt || `Flag of ${country.name.common}`

  return (
    <div className="country-detail">
      <h1>{country.name.common}</h1>
      <div>capital {country.capital ? country.capital.join(', ') : 'N/A'}</div>
      <div>area {country.area}</div>

      <h3>languages:</h3>
      <ul>
        {languages.map((language) => (
          <li key={language}>{language}</li>
        ))}
      </ul>

      {flagUrl && (
        <img className="flag-img" src={flagUrl} alt={flagAlt} width="160" />
      )}

      {capital && <Weather capital={capital} countryCode={country.cca2} />}
    </div>
  )
}

export default CountryDetail
