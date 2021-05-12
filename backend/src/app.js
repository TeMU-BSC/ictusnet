const express = require('express')
const cors = require('cors')
const csvParse = require('csv-parse/lib/sync')
const reportsRoute = require('./routes/reports.js')
const variablesRoute = require('./routes/variables.js')
const { db } = require('./db/mongodb')
const { initDatabase } = require('./db/init')
const {
  DEEPLEARNING_BRAT_DEMO_DIR,
  UPLOADS_DIR,
  ANNOTATIONS_DIR,
  NER_JOINT_DIR,
  ICTUSNET_VARIABLES_TSV,
  ICTUSNET_OPTIONS_TSV,
  ICTUSNET_CTAKES_DICT_BSV,
} = require('./constants')
const {
  createPublicDirIfNotExists,
  getFileContent,
} = require('./helpers/io')

const app = express()

// Cross-origin-resource-sharing enabled to allow http requests
// from different IP addresses than the server where this node app is running.
app.use(cors())

// Allow accessing the body of PUT/PATCH requests.
app.use(express.json()) // For parsing application/json.
app.use(express.urlencoded({ extended: true })) // For parsing application/x-www-form-urlencoded.

// Make sure that directories for uploads and annotations exist.
// BRAT directory must have 777 permissions so NER model can write ".ann" files inside it.
createPublicDirIfNotExists(UPLOADS_DIR)
createPublicDirIfNotExists(ANNOTATIONS_DIR)
createPublicDirIfNotExists(NER_JOINT_DIR)

// Specific endpoints.
app.get('/', (req, res) => {
  res.send('hello from ictusnet backend in node.js using express')
})
app.get('/admissibles', (req, res) => {
  const fileContent = getFileContent(ICTUSNET_CTAKES_DICT_BSV)
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
  await initDatabase(ICTUSNET_VARIABLES_TSV, ICTUSNET_OPTIONS_TSV, DEEPLEARNING_BRAT_DEMO_DIR)
  res.send({ message: 'MongoDB `ictusnet` database has been deleted and then freshly recerated with the demo reports.' })
})

// Routes.
app.use('/reports', reportsRoute)
app.use('/variables', variablesRoute)

// Start the server.
const port = 3000
app.listen(port, () => console.log(`ICTUSnet backend listening on http://localhost:${port}`))
