// paths constants
const uploadsDir = './uploads'
const ctakesDir = '/tmp/ctakes'  // must have 777 permissions so ctakes can write ann files inside it
const runDockerScript = './ictusnet-ctakes/run-docker.sh'

// build the server app
const express = require('express')
const app = express()

// cross-origin-resource-sharing enabled to allow http requests
// from different IP addresses than the server where this node app is running
const cors = require('cors')
app.use(cors())

// input/output filesystem operations
const {
  generateAnnFilesSync,
  parseBratDirectory,
  parseGenericTsv,
} = require('./io')

// make sure that directories for uploads and ctakes exist
const {
  createPublicDirIfNotExists,
  copyFiles,
  moveFiles,
} = require('./helpers')
createPublicDirIfNotExists(uploadsDir)
createPublicDirIfNotExists(ctakesDir)

// database
const { Document } = require('./mongoose')
require('./init-demo')

// file upload
const fs = require('fs')
const multer = require('multer')
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, file.originalname)
})
const upload = multer({ storage: storage })

// endpoints
app.get('/', (req, res) => {
  res.send('hello from ictusnet backend in node.js using express')
})
app.get('/variables', (req, res) => {
  const variables = parseGenericTsv('./variables/variables.tsv')
  res.send(variables)
})
app.get('/options', (req, res) => {
  const options = parseGenericTsv('./variables/options.tsv')
  res.send(options)
})
app.post('/documents', upload.array('files[]'), async (req, res) => {
  // moveFiles(uploadsDir, ctakesDir)
  copyFiles(uploadsDir, ctakesDir)
  generateAnnFilesSync(runDockerScript, ctakesDir, ctakesDir)
  const parsedBrat = await parseBratDirectory(ctakesDir)
  // add the `completed` key to each document
  const newDocuments = parsedBrat.map(d => ({ ...d, completed: false }))
  const insertedDocuments = await Document.create(newDocuments)
  res.json({
    documentCount: insertedDocuments.length,
    documents: insertedDocuments,
    message: `Finished! Medical document files have been:
  (1) uploaded successfully to '${uploadsDir}' directory,
  (2) generated '.ann' files from uploaded '.txt' files,
  (3) converted to JSON and inserted into local MongoDB instance.`
  })
})
app.get('/documents', async (req, res) => {
  const documents = await Document.find({ filename: { $not: /^demo-/ } }).sort('filename')
  res.json({
    documentCount: documents.length,
    documents: documents,
    message: `${documents.length}' documents have been loaded.`
  })
})
app.get('/demo', async (req, res) => {
  const documents = await Document.find({ filename: /^demo-/ }).sort('filename')
  res.json({
    documentCount: documents.length,
    documents: documents,
    message: `${documents.length}' documents have been loaded.`
  })
})

// start the server
const port = 3000
app.listen(port, () => console.log(`ictusnet backend listening on http://localhost:${port}`))
