const mongoose = require('mongoose')
const HOST = 'localhost'  // when executing docker run ...
// const HOST = 'mongo'  // (container_name) when executing docker-compose up ...
const uri = `mongodb://${HOST}/ictusnet`
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