const Notification = ({ notification }) => {
  if (notification === null) {
    return null
  }

  const { message, type } = notification

  const style = {
    color: type === 'error' ? 'red' : 'green',
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  }

  return (
    <div style={style} className={type}>
      {message}
    </div>
  )
}

export default Notification
