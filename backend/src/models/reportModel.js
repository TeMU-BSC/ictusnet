const mongoose = require('mongoose')

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
const reportSchema = new Schema({
  filename: String,
  text: String,
  annotations: [annotationSchema],
  results: Object,
  completed: Boolean,
})
const Report = mongoose.model('Report', reportSchema)

module.exports = {
  Report,
}