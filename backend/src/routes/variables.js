// Route module for ICTUSnet variables.

const router = require('express').Router()
const { Variable } = require('../models/variableModel')
const { createVariables } = require('../db/init')
const { parseVariablesTsv } = require('../helpers/io')
const { ICTUSNET_VARIABLES_TSV, ICTUSNET_OPTIONS_TSV } = require('../constants')

// POST (create) multiple variables by uploading two files: variables.tsv and options.tsv.
router.post('/', async (req, res) => {
  const variables = await createVariables(ICTUSNET_VARIABLES_TSV, ICTUSNET_OPTIONS_TSV)
  res.send(variables)
})

// GET (read) all variables.
router.get('/', async (req, res) => {
  // const variables = await Variable.find()
  const variables = parseVariablesTsv(ICTUSNET_VARIABLES_TSV, ICTUSNET_OPTIONS_TSV)
  res.send(variables)
})

// DELETE (delete) all variables.
router.delete('/', async (req, res) => {
  const deletionResult = await Variable.deleteMany()
  res.send(deletionResult)
})

module.exports = router