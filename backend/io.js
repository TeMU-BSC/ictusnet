const child_process = require('child_process')
const path = require('path')

const { parse } = require('./brat')
const { moveFiles, walk } = require('./helpers')

/**
 * Generate annotation (.ann) files by calling the CTAKES docker container https://github.com/TeMU-BSC/ictusnet-ctakes.
 * @param {string} runDockerScriptPath Path to the downloaded script: https://github.com/TeMU-BSC/ictusnet-ctakes/blob/master/run-docker.sh
 * @param {string} txtDir /absolute/path/to/txt/files
 * @param {string} annDir /absolute/path/to/ann/files
 */
const generateAnnFilesSync = (runDockerScriptPath, txtDir, annDir) => {
  child_process.execFileSync('sh', [runDockerScriptPath, txtDir, annDir], { stdio: 'inherit' })
}

const getReports = async (reportsDir) => {
  const reports = []
  const uniqueBasenames = new Set()
  for await (const file of walk(reportsDir))
    uniqueBasenames.add(path.parse(file).name)
  uniqueBasenames.forEach(basename => {
    const txtRelativepath = path.join(reportsDir, 'txt', basename)
    const annRelativepath = path.join(reportsDir, 'ann', basename)
    const txt = `${txtRelativepath}.txt`
    const ann = `${annRelativepath}.ann`
    const parsedBrat = parse(txt, ann)
    reports.push(parsedBrat)
  })
  return reports
}

module.exports = {
  generateAnnFilesSync,
  getReports,
}