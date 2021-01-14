// uploads direcory must be a relative path so it can work with multer
const uploadsDir = './reports/uploads'
const demoDir = './reports/demo'
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
  res.json({ 'message': `Medical report files have been uploaded successfully to backend directory "${uploadsDir}".` })
})

app.get('/reports', async (req, res) => {
  const isDemo = JSON.parse(req.query.isDemo.toLowerCase())
  if (isDemo) {
    const annotatedDemoReports = await getParsedBratDirArray(demoDir)
    res.json(annotatedDemoReports)
    return
  }
  generateAnnFilesSync(runDockerScript, uploadsDir, uploadsDir)
  const annotatedReports = await getParsedBratDirArray(uploadsDir)
  await insertMultipleDocuments(annotatedReports).catch(console.dir)
  console.log(`Annotated reports have been converted into JSON documents to be stored into MongoDB local instance (database "ictusnet", collection "uploads")`)

  res.json(annotatedReports)
})

const port = 3000
app.listen(port, () => console.log(`ictusnet backend listening on http://localhost:${port}`))
