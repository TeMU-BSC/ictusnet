// Route module for ICTUSnet medical reports.

const router = require('express').Router()
const { Report } = require('../models/reportModel')
const { Variable } = require('../models/variableModel')
const { createReports } = require('../db/init')
const {
  removeFilesInDirectory,
  removeFilesInDirectoryUpload,
  execGenerateAnnFiles,
} = require('../helpers/io')
const {
  UPLOADS_DIR,
  JOINT_DIR,
  DEEPLEARNING_DIR
} = require('../constants')

// Add middleware to upload files to the server.
const multer = require('multer')
const agenda = require('../helpers/scheduler')
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, file.originalname)
})
const upload = multer({ storage: storage })

// POST (create) one or many new reports, using the multer middleware to upload the files present in the request.
router.post('/', upload.array('files[]'), async (req, res) => {
  
  if (!agenda.getJobRunnig()) {

    agenda.setJobRunnig(true)

    await execGenerateAnnFiles()

    // Transform the .ann and .txt files into a .json format to store them in database.
    const variables = await Variable.find()
    const reports = await createReports(JOINT_DIR, variables)
  
    removeFilesInDirectoryUpload(UPLOADS_DIR, req.files)
    removeFilesInDirectory(DEEPLEARNING_DIR)
    removeFilesInDirectory(JOINT_DIR)
  
    agenda.setJobRunnig(false)

    res.send({
      report_count: reports.length,
      reports: reports,
      message: `Reports have been processed successfully.`
    })

  } else if (agenda.getJobRunnig()) {
    res.send({
        message: `Your report will be uploaded in a few minuts.`,
        busy: true
      })
  }
 
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