import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import apiRouter from './routers/index.js'
import { notFound } from './middlewares/notFound.middleware.js'
import { errorHandler } from './middlewares/error.middleware.js'

const app = express()

app.use(cors({ origin: env.webUrl }))
app.use(express.json())

app.use('/api', apiRouter)

app.use(notFound)
app.use(errorHandler)

export default app
