const { Document } = require('./mongoose')
const { parseBratDirectory } = require('./io')
const demoDir = './demo'

const insertDemoDocuments = async () => {
  const currentDemoDocuments = await Document.find({ filename: /^demo-/ })
  if (currentDemoDocuments.length === 0) {
    const parsedBrat = await parseBratDirectory(demoDir)
    // add the `completed` and `isDemo` keys to each document
    const newDocuments = parsedBrat.map(d => ({ ...d, completed: false }))
    await Document.create(newDocuments)
  }
}
insertDemoDocuments()
