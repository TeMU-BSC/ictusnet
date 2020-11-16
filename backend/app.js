const fs = require('fs')
const express = require('express')
const multer = require('multer')
const cors = require('cors')

const app = express()
const port = 3000
const dir = 'uploads'

fs.mkdir(dir, { recursive: true }, (err) => {
  if (err) throw err;
})
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => cb(null, file.originalname)
})
const upload = multer({ storage: storage })

app.use(cors())

app.get('/', (req, res) => {
  res.json({ 'greeting': 'hello from express.' })
})

app.post('/upload', upload.array('uploads[]'), (req, res) => {
  res.json({ 'message': `Files uploaded successfully to "./backend/${dir}/".` })
})

app.listen(port, () => console.log(`ICTUSnet express listening on port ${port}!`))
