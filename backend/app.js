const uploadsDirRelativePath = './uploads'
const uploadsDir = '/tmp/uploads'
const demoDir = './demo'
const runDockerScript = './ictusnet-ctakes/run-docker.sh'

const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

const {
  generateAnnFilesSync,
  parseBratDirectory,
  parseGenericTsv,
} = require('./io')
const { Document } = require('./mongoose')

const multer = require('multer')
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDirRelativePath),
  filename: (req, file, cb) => cb(null, file.originalname)
})
const upload = multer({ storage: storage })

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

app.get('/demo', async (req, res) => {
  // check if demo documents are already in mongodb
  let demoDocuments = await Document.find({ isDemo: true }).sort('filename')
  if (demoDocuments.length === 0) {
    // parse brat demo directory
    const parsedBrat = await parseBratDirectory(demoDir)
    // add the `isDemo` key to each document
    const newDocumentsToBeInserted = parsedBrat.map(d => ({ ...d, isDemo: true }))
    // insert new documents into mongodb
    await Document.create(newDocumentsToBeInserted)
    demoDocuments = Document.find({ isDemo: true }).sort('filename')
  }
  res.send({
    documentCount: demoDocuments.length,
    documents: demoDocuments,
    message: `${demoDocuments.length} demo documents have been loaded.`
  })
})

app.post('/documents', upload.array('files[]'), async (req, res) => {
  generateAnnFilesSync(runDockerScript, uploadsDir, uploadsDir)
  const parsedBrat = await parseBratDirectory(uploadsDir)
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
  const documents = await Document.find({ completed: false }).sort('filename')
  res.json({
    documentCount: documents.length,
    documents: documents,
    message: `${documents.length}' documents have been loaded.`
  })
})

const port = 3000
app.listen(port, () => console.log(`ictusnet backend listening on http://localhost:${port}`))
