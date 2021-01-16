// uploads direcory must be a relative path so it can work with multer
const uploadsDir = './documents/uploads'
const demoDir = './documents/demo'
const runDockerScript = './ictusnet-ctakes/run-docker.sh'

const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

const { generateAnnFilesSync, getParsedBratDirArray } = require('./io')
const { insertMultipleDocuments } = require('./mongodb')

const multer = require('multer')
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, file.originalname)
})
const upload = multer({ storage: storage })

app.get('/', (req, res) => {
  res.send('hello from ictusnet backend in node.js using express')
})

app.post('/upload', upload.array('files[]'), (req, res) => {
  res.json({ 'message': `Medical document files have been uploaded successfully to backend directory "${uploadsDir}".` })
})

app.get('/documents', async (req, res) => {
  const isDemo = JSON.parse(req.query.isDemo.toLowerCase())
  if (isDemo) {
    const annotatedDemoDocuments = await getParsedBratDirArray(demoDir)
    res.json(annotatedDemoDocuments)
    return
  }
  generateAnnFilesSync(runDockerScript, uploadsDir, uploadsDir)
  const annotatedDocuments = await getParsedBratDirArray(uploadsDir)
  await insertMultipleDocuments(annotatedDocuments).catch(console.dir)
  console.log(`Annotated documents have been converted into JSON to be stored into MongoDB local instance`)

  res.json(annotatedDocuments)
})

const port = 3000
app.listen(port, () => console.log(`ictusnet backend listening on http://localhost:${port}`))
