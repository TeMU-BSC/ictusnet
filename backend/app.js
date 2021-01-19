const uploadsDir = './uploads'  // uploads direcory must be a relative path so it can work with multer middleware
const demoDir = './brat_demo'
const productionDir = './brat_production'
const runDockerScript = './ictusnet-ctakes/run-docker.sh'

const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

const { generateAnnFilesSync, parseBratDirectory } = require('./io')
const { Document } = require('./mongoose')
const { moveFiles } = require('./helpers')

const multer = require('multer')
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, file.originalname)
})
const upload = multer({ storage: storage })

app.get('/', (req, res) => {
  res.send('hello from ictusnet backend in node.js using express')
})

app.post('/documents', upload.array('files[]'), async (req, res) => {
  generateAnnFilesSync(runDockerScript, uploadsDir, uploadsDir)
  const parsedDocuments = await parseBratDirectory(uploadsDir)
  // add the `completed` key to each document
  const newDocuments = parsedDocuments.map(d => ({ ...d, completed: false }))
  const insertedDocuments = await Document.create(newDocuments)
  moveFiles(uploadsDir, productionDir)
  res.json({
    documentCount: insertedDocuments.length,
    documents: insertedDocuments,
    message: `Finished! Medical document files have been:
  (1) uploaded successfully to '${uploadsDir}' directory,
  (2) generated '.ann' files from uploaded '.txt' files,
  (3) converted to JSON and inserted into local MongoDB instance, and
  (4) '.txt' and '.ann' files have been moved to '${productionDir}' directory.`
  })
})

app.get('/documents', async (req, res) => {
  const isDemo = JSON.parse(req.query.isDemo.toLowerCase())
  let pendingDocuments
  if (isDemo) {
    pendingDocuments = await parseBratDirectory(demoDir)
    // pendingDocuments = await Document.find({ isDemo: true }).sort('filename')
  } else {
    pendingDocuments = await Document.find({ completed: false }).sort('filename')
  }
  res.json(pendingDocuments)
})

const port = 3000
app.listen(port, () => console.log(`ictusnet backend listening on http://localhost:${port}`))
