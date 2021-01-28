const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const optionSchema = new Schema({
  value: String,
  comment: String,
}, { _id: false })

const variableSchema = new Schema({
  section: String,
  group: String,
  label: String,
  long_label: String,
  info: String,
  entity: String,
  key: String,
  cardinality: String,
  field_type: String,
  input_type: String,
  options: [optionSchema],
  comment: String,
})

const Variable = mongoose.model('Variable', variableSchema)

module.exports = {
  Variable,
}