const reportsDir = './reports'  // txt + ann
const reportsDemoDir = './reports_demo'  // txt + ann
const uploadsDir = '/tmp/ctakes/uploads'  // only txt
const runDockerScriptPath = '/home/alejandro/code/ictusnet-ctakes/run-docker.sh'
const inputDirAbsolutePath = '/tmp/ctakes/input'  // only txt
const outputDirAbsolutePath = '/tmp/ctakes/output'  // only ann


const express = require('express')
const cors = require('cors')
const multer = require('multer')

const { moveFiles, generateAnnFiles, processBratDirectory } = require('./io')

const app = express()
const port = 3000

app.use(cors())

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, file.originalname)
})
const upload = multer({ storage: storage })

app.get('/', (req, res) => {
  res.send('hello from ictusnet backend in node.js using express')
})

app.get('/demo', (req, res) => {
  const data = processBratDirectory(reportsDemoDir)
  res.json(data)
})

app.get('/reports', (req, res) => {
  const data = processBratDirectory(reportsDir)
  res.json(data)
})

app.post('/upload', upload.array('uploads[]'), (req, res) => {
  res.json({ 'message': 'Files uploaded successfully.' })
})

app.get('/ann', (req, res) => {
  moveFiles(uploadsDir, inputDirAbsolutePath)
  generateAnnFiles(runDockerScriptPath, inputDirAbsolutePath, outputDirAbsolutePath)
  moveFiles(inputDirAbsolutePath, reportsDir)  // txt files
  moveFiles(inputDirAbsolutePath, reportsDir)  // ann files

  // TODO return ann files
  res.json({ 'message': '.ann files generated successfully.' })
})

app.listen(port, () => console.log(`ictusnet backend listening on http://localhost:${port}`))
