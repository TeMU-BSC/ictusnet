const fs = require('fs')

const express = require('express')
const cors = require('cors')
const multer = require('multer')

const { runCtakesDocker, moveFiles, processBratDirectory } = require('./io')

const app = express()
const port = 3000

app.use(cors())

const dir = './ctakes/input'
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => cb(null, file.originalname)
})
const upload = multer({ storage: storage })

app.get('/', (req, res) => {
  res.send('hello from express')
})

app.get('/demo', (req, res) => {
  const data = processBratDirectory('./demo')
  res.json(data)
})

app.get('/reports', (req, res) => {
  const data = processBratDirectory('./reports')
  res.json(data)
})

app.post('/upload', upload.array('uploads[]'), (req, res) => {
  runCtakesDocker('/home/alejandro/code/ictusnet-ctakes/run-docker.sh',
    '/home/alejandro/code/ictusnet/backend/ctakes/input',
    '/home/alejandro/code/ictusnet/backend/ctakes/output'
  )
  moveFiles('./ctakes/input', './ctakes/output', './reports')
  res.json({ 'message': `Files uploaded successfully to "${dir}".` })
})

app.listen(port, () => console.log(`ictusnet backend listening on http://localhost:${port}`))
