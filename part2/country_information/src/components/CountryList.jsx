const CountryList = ({ countries, onSelectCountry }) => {
  return (
    <div>
      {countries.map((country) => (
        <div key={country.cca3 || country.name.common} className="country-item">
          <span>{country.name.common}</span>
          <button onClick={() => onSelectCountry(country)}>show</button>
        </div>
      ))}
    </div>
  )
}

export default CountryList
