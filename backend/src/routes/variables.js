// Variable route module.

const router = require('express').Router()
const { Variable } = require('../models/variableModel')
const { createVariables } = require('../db/init')
const { parseVariableFile } = require('../helpers/io')
const { variablesFile, optionsFile } = require('../constants')

// POST (create) multiple variables by uploading two files: variables.tsv and options.tsv.
router.post('/', async (req, res) => {
  const variables = await createVariables(variablesFile, optionsFile)
  res.send(variables)
})

// GET (read) all variables.
router.get('/', async (req, res) => {
  // const variables = await Variable.find()
  const variables = parseVariableFile(variablesFile, optionsFile)
  res.send(variables)
})

// DELETE (delete) all variables.
router.delete('/', async (req, res) => {
  const deletionResult = await Variable.deleteMany()
  res.send(deletionResult)
})

module.exports = router