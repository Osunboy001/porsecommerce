export function errorHandler(error, _req, res, _next) {
  if (error.status && error.status < 500) {
    res.status(error.status).json({ error: error.message })
    return
  }

  if (error.code === 11000) {
    res.status(409).json({ error: 'A record with these details already exists' })
    return
  }

  console.error(error)
  res.status(500).json({ error: 'Internal server error' })
}
