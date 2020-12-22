const express = require('express')
const cors = require('cors')
const multer = require('multer')
const brat = require('./brat')

const app = express()
const port = 3000

app.use(cors())

const dir = './uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => cb(null, file.originalname)
})
const upload = multer({ storage: storage })

app.get('/', (req, res) => {
  res.send('hello from express')
})

app.get('/demo', (req, res) => {
  res.json(brat.processDirectory('./brat_sample/10'))
})

app.post('/upload', upload.array('uploads[]'), (req, res) => {
  res.json({ 'message': `Files uploaded successfully to "${dir}".` })
})

app.listen(port, () => console.log(`ICTUSnet backend listening on http://localhost:${port}`))
