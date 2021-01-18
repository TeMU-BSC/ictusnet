// uploads direcory must be a relative path so it can work with multer
const demoDir = './documents/demo'
const uploadsDir = './documents/uploads'
const productionDir = './documents/production'
const runDockerScript = './ictusnet-ctakes/run-docker.sh'

const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

const { generateAnnFilesSync, getParsedBratDirArray } = require('./io')
const { insertMultipleDocuments } = require('./mongodb')
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

app.post('/upload', upload.array('files[]'), async (req, res) => {
  generateAnnFilesSync(runDockerScript, uploadsDir, uploadsDir)
  const annotatedDocuments = await getParsedBratDirArray(uploadsDir)
  // await insertMultipleDocuments(annotatedDocuments).catch(console.dir)
  moveFiles(uploadsDir, productionDir)
  res.json({
    message: `Medical document files have been:
  (1) uploaded successfully to '${uploadsDir}' directory,
  (2) generated '.ann' files from uploaded '.txt' files,
  (3) converted to JSON and inserted into local MongoDB instance, and
  (4) '.txt' and '.ann' files have been moved to '${productionDir}' directory.`
  })
})

app.get('/documents', async (req, res) => {
  const isDemo = JSON.parse(req.query.isDemo.toLowerCase())
  let annotatedDocuments
  if (isDemo) {
    // replace by mongo find
    annotatedDocuments = await getParsedBratDirArray(demoDir)
  } else {
    // replace by mongo find
    annotatedDocuments = await getParsedBratDirArray(productionDir)
  }
  res.json(annotatedDocuments)
})

const port = 3000
app.listen(port, () => console.log(`ictusnet backend listening on http://localhost:${port}`))
