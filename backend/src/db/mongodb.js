const mongoose = require('mongoose')
/**
 * When launching this server by docker-compose up [...],
 * the docker service name should be provided (for example, 'mongo').
 */
const host = process.env.MONGODB_HOST || 'localhost'
const port = 27017
const database = 'ictusnet'
const uri = `mongodb://${host}:${port}/${database}`
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', async function () {
  console.log(`connected to MongoDB '${database}' database`)

})

module.exports = {
  db,
}