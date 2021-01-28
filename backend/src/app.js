const express = require('express')
const cors = require('cors')
const csvParse = require('csv-parse/lib/sync')
const reportsRoute = require('./routes/reports.js')
const { db } = require('./db/mongodb')
const { initDatabase } = require('./db/init')
const { demoDir, uploadsDir, ctakesDir, variablesFile, optionsFile, ictusnetDictFile } = require('./constants')
const { createPublicDirIfNotExists, getFileContent, parseVariableFile } = require('./helpers/io')

const app = express()

// cross-origin-resource-sharing enabled to allow http requests
// from different IP addresses than the server where this node app is running
app.use(cors())

// allow accessing the body of PUT/PATCH requests
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// make sure that directories for uploads and ctakes exist
createPublicDirIfNotExists(uploadsDir)
createPublicDirIfNotExists(ctakesDir)

// base endpoints
app.get('/', (req, res) => {
  res.send('hello from ictusnet backend in node.js using express')
})
app.get('/variables', (req, res) => {
  const variables = parseVariableFile(variablesFile, optionsFile)
  res.send(variables)
})

// to be removed
app.get('/options', (req, res) => {
  const fileContent = getFileContent(optionsFile)
  const options = csvParse(fileContent, {
    delimiter: '\t',
    columns: true,
    relaxColumnCount: true,
    quote: '\'',
    skipEmptyLines: true,
  })
  res.send(options)
})
app.get('/admissibles', (req, res) => {
  const fileContent = getFileContent(ictusnetDictFile)
  const admissibles = csvParse(fileContent, {
    delimiter: '|',
    columns: true,
    relaxColumnCount: true,
    skipEmptyLines: true,
  })
  res.send(admissibles)
})
app.delete('/database', async (req, res) => {
  await db.dropDatabase()
  await initDatabase(variablesFile, optionsFile, demoDir)
  // await insertVariables(variablesFile, optionsFile)
  // await insertDemoReports(demoDir)
  res.send({ message: 'MongoDB `ictusnet` database has been deleted and then freshly recerated with the demo reports.' })
})

// routes
app.use('/reports', reportsRoute)

// start the server
const port = 3000
app.listen(port, () => console.log(`ICTUSnet backend listening on http://localhost:${port}`))
