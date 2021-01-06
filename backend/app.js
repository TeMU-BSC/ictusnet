require('dotenv').config()
const uploadDirRelativePath = process.env.UPLOAD_DIR
const reportsDir = process.env.REPORTS_DIR
const reportsDemoDir = process.env.REPORTS_DEMO_DIR
const txtDirAbsolutePath = process.env.TXT_DIR_ABSOLUTE_PATH
const annDirAbsolutePath = process.env.ANN_DIR_ABSOLUTE_PATH
const runDockerScriptPath = process.env.RUN_DOCKER_SCRIPT_PATH

const express = require('express')
const cors = require('cors')
const multer = require('multer')

const { generateAnnFilesSync, getReports } = require('./io')

const app = express()
const port = 3000

app.use(cors())

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDirRelativePath),
  filename: (req, file, cb) => cb(null, file.originalname)
})
const upload = multer({ storage: storage })

app.get('/', (req, res) => {
  res.send('hello from ictusnet backend in node.js using express')
})

app.post('/upload', upload.array('files[]'), (req, res) => {
  res.json({ 'message': `Medical report files have been uploaded successfully to ${uploadDirRelativePath}.` })
})

app.get('/reports', async (req, res) => {
  const isDemo = JSON.parse(req.query.isDemo.toLowerCase())
  if (isDemo) {
    res.json(await getReports(reportsDemoDir))
    return
  }
  generateAnnFilesSync(runDockerScriptPath, txtDirAbsolutePath, annDirAbsolutePath)
  res.json(await getReports(reportsDir))
})

app.listen(port, () => console.log(`ictusnet backend listening on http://localhost:${port}`))
