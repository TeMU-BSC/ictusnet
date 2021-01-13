require('dotenv').config()
const uploadDirRelativePath = process.env.UPLOAD_DIR
const reportsDir = process.env.REPORTS_DIR
const demoReportsDir = process.env.DEMO_REPORTS_DIR
const txtDirAbsolutePath = process.env.TXT_DIR_ABSOLUTE_PATH
const annDirAbsolutePath = process.env.ANN_DIR_ABSOLUTE_PATH
const runDockerScriptPath = process.env.RUN_DOCKER_SCRIPT_PATH

const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

const { generateAnnFilesSync, getAnnotatedReports } = require('./io')
const { insertMultipleDocuments } = require('./mongodb')

const multer = require('multer')
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirRelativePath),
  filename: (req, file, cb) => cb(null, file.originalname)
})
const upload = multer({ storage: storage })

app.get('/', (req, res) => {
  res.send('hello from ictusnet backend in node.js using express')
})

app.post('/upload', upload.array('files[]'), (req, res) => {
  res.json({ 'message': `Medical report files have been uploaded successfully to backend directory "${uploadDirRelativePath}".` })
})

app.get('/reports', async (req, res) => {
  const isDemo = JSON.parse(req.query.isDemo.toLowerCase())
  if (isDemo) {
    const annotatedDemoReports = await getAnnotatedReports(demoReportsDir)
    res.json(annotatedDemoReports)
    return
  }
  // generateAnnFilesSync(runDockerScriptPath, txtDirAbsolutePath, annDirAbsolutePath)
  const annotatedReports = await getAnnotatedReports(reportsDir)
  await insertMultipleDocuments(annotatedReports).catch(console.dir)
  console.log(`Annotated reports have been converted into JSON documents to be stored into MongoDB local instance (database "ictusnet", collection "uploads")`)

  res.json(annotatedReports)
})

const port = 3000
app.listen(port, () => console.log(`ictusnet backend listening on http://localhost:${port}`))
