const { Report } = require('../models/reportModel')
const { Variable } = require('../models/variableModel')
const { parseBratDirectory, parseVariablesTsv, parseIctusnetDictFile } = require('../helpers/io')
const { autofillField } = require('../helpers/form')
const { ICTUSNET_CTAKES_DICT_BSV } = require('../constants')

// Use of the admissible evidences for entitites in CTAKES:
// https://github.com/TeMU-BSC/spactes/blob/master/ctakes-SpaCTeS-res/src/main/resources/org/apache/ctakes/examples/dictionary/lookup/fuzzy/IctusnetDict.bsv
const createVariables = async (ictusnetVariablesTsv, ictusnetOptionsTsv) => {
  const variables = await parseVariablesTsv(ictusnetVariablesTsv, ictusnetOptionsTsv)
  const admissibleEvidencesByEntity = parseIctusnetDictFile(ICTUSNET_CTAKES_DICT_BSV)
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

const initDatabase = async (ictusnetVariablesTsv, ictusnetOptionsTsv, demoDir) => {
  const variables = await createVariables(ictusnetVariablesTsv, ictusnetOptionsTsv)
  await createReports(demoDir, variables)
}

module.exports = {
  createVariables,
  createReports,
  initDatabase,
}