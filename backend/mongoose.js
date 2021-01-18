const mongoose = require('mongoose')
/**
 * 'mongo' (docker service name in docker-compose file) when launching app by docker-compose up [...] OR
 * 'localhost' when launching app by docker run [...]
 */
const MONGODB_HOST = process.env.MONGODB_HOST || 'localhost'
const uri = `mongodb://${MONGODB_HOST}:27017/ictusnet`
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
const db = mongoose.connection
const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId
const annotationSchema = new Schema({
  id: String,
  entity: String,
  offset: {
    start: Number,
    end: Number
  },
  evidence: String,
  note: String,
}, { _id: false })
const documentSchema = new Schema({
  filename: String,
  text: String,
  annotations: [annotationSchema],
  completed: Boolean,
})
const Document = mongoose.model('Document', documentSchema)
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', async function () {
  console.log("we're connected to MongoDB 'ictusnet' database!")

})

module.exports = {
  Document
}