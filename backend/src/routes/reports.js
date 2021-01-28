// Report route module.

const router = require('express').Router()
const { Report } = require('../models/reportModel')
const { Variable } = require('../models/variableModel')
const { copyFiles, generateAnnFilesSync, parseBratDirectory } = require('../helpers/io')
const { uploadsDir, ctakesDir, runDockerScript } = require('../constants')

// Add middleware to upload files to the server.
const multer = require('multer')
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, file.originalname)
})
const upload = multer({ storage: storage })

// POST (create) one or many new reports, using the multer middleware to upload the files present in the request.
router.post('/', upload.array('files[]'), async (req, res) => {
  copyFiles(uploadsDir, ctakesDir)
  generateAnnFilesSync(runDockerScript, ctakesDir, ctakesDir)
  const reports = await parseBratDirectory(ctakesDir)
  const variables = await Variable.find()
  const reportsWithInitialResults = reports.map(report => ({ ...report, result: { initial: {}, final: {} } }))
  reportsWithInitialResults.forEach(report => {
    variables.forEach(variable => {
      report.result.initial = { ...report.result.initial, [variable.key]: autofillField(variable, report.annotations) }
    })
  })
  const createdReports = await Report.create(reportsWithInitialResults)
  res.send({
    reportCount: createdReports.length,
    reports: createdReports,
    message: `${createdReports.length}' reports have been loaded.`
  })
})

// GET (read) multiple reports by its status.
router.get('/completed/:completed', async (req, res) => {
  const completed = req.params.completed
  let reports
  if (completed === 'null') reports = await Report.find().sort('filename')
  if (completed === 'false') reports = await Report.find({ completed: false }).sort('filename')
  if (completed === 'true') reports = await Report.find({ completed: true }).sort('filename')
  res.send(reports)
})

// GET (read) one report.
router.get('/:filename', async (req, res) => {
  const report = await Report.findOne({ filename: req.params.filename })
  res.send(report)
})

// PUT (update) one report.
router.put('/:filename', async (req, res) => {
  const report = req.body
  const updatedReport = await Report.findOneAndUpdate({ filename: req.params.filename }, report)
  res.send(updatedReport)
})

// DELETE (delete) one report.
router.delete('/:filename', async (req, res) => {
  const deletedReport = await Report.deleteOne({ filename: req.params.filename })
  res.send(deletedReport)
})

module.exports = router