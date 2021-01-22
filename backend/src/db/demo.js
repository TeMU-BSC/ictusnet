const { Report } = require('../models/reportModel')
const { parseBratDirectory } = require('../io')
const demoDir = './demo'

const insertDemoReports = async () => {
  const currentDemoReports = await Report.find({ filename: /^demo-/ })
  if (currentDemoReports.length === 0) {
    const parsedBrat = await parseBratDirectory(demoDir)
    const newReports = parsedBrat.map(d => ({ ...d, completed: false, results: {} }))
    await Report.create(newReports)
  }
}

module.exports = {
  insertDemoReports,
}