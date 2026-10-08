const Notification = ({ message, type = 'success' }) => {
  if (message === null || message === undefined) {
    return null
  }

  const text = typeof message === 'object' ? message.message || message.text : message
  const messageType = typeof message === 'object' ? message.type || type : type

  if (!text) {
    return null
  }

  return (
    <div className={messageType === 'error' ? 'error' : 'success'}>
      {text}
    </div>
  )
}

export default Notification
