const { Report } = require('../models/reportModel')
const { parseBratDirectory } = require('../io')
const demoDir = './demo'

const insertDemoReports = async () => {
  const currentDemoReports = await Report.find({ filename: /\.utf8\./ })
  if (currentDemoReports.length === 0) {
    const parsedBratDirectory = await parseBratDirectory(demoDir)
    const newReports = parsedBratDirectory.map(d => ({ ...d, completed: false, results: {} }))
    await Report.create(newReports)
  }
}

module.exports = {
  insertDemoReports,
}