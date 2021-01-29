const { Report } = require('../models/reportModel')
const { Variable } = require('../models/variableModel')
const { parseBratDirectory, parseVariableFile, parseIctusnetDictFile } = require('../helpers/io')
const { autofillField } = require('../helpers/form')
const { ictusnetDictFile } = require('../constants')

// Use of the admissible evidences for entitites in CTAKES:
// https://github.com/TeMU-BSC/spactes/blob/master/ctakes-SpaCTeS-res/src/main/resources/org/apache/ctakes/examples/dictionary/lookup/fuzzy/IctusnetDict.bsv
const createVariables = async (variablesFile, optionsFile) => {
  const variables = await parseVariableFile(variablesFile, optionsFile)
  const admissibleEvidencesByEntity = parseIctusnetDictFile(ictusnetDictFile)
  for (const variable of variables) {
    variable.admissible_evidences = admissibleEvidencesByEntity.find(({ entity }) => entity === variable.entity)?.evidences
    for (const option of variable.options) {
      option.admissible_evidences = admissibleEvidencesByEntity.find(({ entity }) => entity === option.entity)?.evidences
    }
  }
  const createdVariables = await Variable.create(variables)
  return createdVariables
}

const createReports = async (reportsDir, variables) => {
  const reports = await parseBratDirectory(reportsDir)
  const reportsWithInitialResults = reports.map(report => ({ ...report, result: { initial: {}, final: {} } }))
  for (const report of reportsWithInitialResults) {
    for (const variable of variables) {
      report.result.initial = { ...report.result.initial, [variable.key]: autofillField(variable, report.annotations) }
    }
  }
  const createdReports = await Report.create(reportsWithInitialResults)
  return createdReports
}

const initDatabase = async (variablesFile, optionsFile, demoDir) => {
  const variables = await createVariables(variablesFile, optionsFile)
  const reports = await createReports(demoDir, variables)
}

module.exports = {
  createReports,
  initDatabase,
}