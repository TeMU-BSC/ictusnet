const { Report } = require('../models/reportModel')
const { Variable } = require('../models/variableModel')
const { parseBratDirectory, parseVariableFile } = require('../helpers/io')
const { autofillField } = require('../helpers/form')

const initDatabase = async (variablesFile, optionsFile, demoDir) => {
  const variables = await parseVariableFile(variablesFile, optionsFile)
  const reports = await parseBratDirectory(demoDir)
  const reportsWithFormInitial = reports.map(report => ({ ...report, form: { initial: {}, final: {} } }))
  reportsWithFormInitial.forEach(report => {
    variables.forEach(variable => {
      report.form.initial = { ...report.form.initial, [variable.key]: autofillField(variable, report.annotations) }
    })
  })
  await Variable.create(variables)
  await Report.create(reportsWithFormInitial)
}

module.exports = {
  initDatabase,
}