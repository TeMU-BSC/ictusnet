const { Report } = require('../models/reportModel')
const { Variable } = require('../models/variableModel')
const { parseBratDirectory, parseVariableFile } = require('../helpers/io')
const { autofillField } = require('../helpers/form')

const initDatabase = async (variablesFile, optionsFile, demoDir) => {
  const variables = await parseVariableFile(variablesFile, optionsFile)
  const reports = await parseBratDirectory(demoDir)
  const reportsWithInitialResults = reports.map(report => ({ ...report, result: { initial: {}, final: {} } }))
  reportsWithInitialResults.forEach(report => {
    variables.forEach(variable => {
      report.result.initial = { ...report.result.initial, [variable.key]: autofillField(variable, report.annotations) }
    })
  })
  await Variable.create(variables)
  await Report.create(reportsWithInitialResults)
}

module.exports = {
  initDatabase,
}