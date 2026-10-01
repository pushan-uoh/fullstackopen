import { useState, useEffect } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import personService from './services/persons'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    personService.getAll().then((initialPersons) => {
      setPersons(initialPersons)
    })
  }, [])

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  const addPerson = (event) => {
    event.preventDefault()

    const existingPerson = persons.find(
      (person) => person.name.toLowerCase() === newName.trim().toLowerCase(),
    )

    if (existingPerson) {
      if (
        window.confirm(
          `${existingPerson.name} is already added to phonebook, replace the old number with a new one?`,
        )
      ) {
        const changedPerson = { ...existingPerson, number: newNumber }

        personService
          .update(existingPerson.id, changedPerson)
          .then((returnedPerson) => {
            setPersons(
              persons.map((person) =>
                person.id !== existingPerson.id ? person : returnedPerson,
              ),
            )
            setNewName('')
            setNewNumber('')
          })
          .catch(() => {
            alert(
              `Information of '${existingPerson.name}' has already been removed from server`,
            )
            setPersons(persons.filter((p) => p.id !== existingPerson.id))
          })
      }
      return
    }

    const newPerson = {
      name: newName,
      number: newNumber,
    }

    personService.create(newPerson).then((returnedPerson) => {
      setPersons(persons.concat(returnedPerson))
      setNewName('')
      setNewNumber('')
    })
  }

  const deletePerson = (id, name) => {
    if (window.confirm(`Delete ${name} ?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter((person) => person.id !== id))
        })
        .catch(() => {
          alert(`Information of '${name}' has already been removed from server`)
          setPersons(persons.filter((person) => person.id !== id))
        })
    }
  }

  const personsToShow = filter
    ? persons.filter((person) =>
      person.name.toLowerCase().includes(filter.toLowerCase()),
    )
    : persons

  return (
    <div>
      <h2>Phonebook</h2>
      <Filter filter={filter} handleFilterChange={handleFilterChange} />

      <h3>Add a new</h3>
      <PersonForm
        addPerson={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />

      <h3>Numbers</h3>
      <Persons persons={personsToShow} handleDelete={deletePerson} />
    </div>
  )
}

export default App
