const child_process = require('child_process')
const fs = require('fs')
const path = require('path')

const { parse } = require('./brat')

const moveFiles = (sourceDirectory, destinationDirectory) => {
  fs.readdirSync(sourceDirectory).forEach(file => {
    const oldFile = path.join(sourceDirectory, file)
    const newFile = path.join(destinationDirectory, path.parse(file).base)
    fs.renameSync(oldFile, newFile)
  })
}

const processBratDirectory = (directory) => {
  const results = []
  const uniqueBasenames = new Set()
  fs.readdirSync(directory).forEach(file => {
    const basename = path.parse(file).name
    uniqueBasenames.add(basename)
  })
  uniqueBasenames.forEach(basename => {
    const relativepath = path.join(directory, basename)
    const txt = `${relativepath}.txt`
    const ann = `${relativepath}.ann`
    const parsedBrat = parse(txt, ann)
    results.push(parsedBrat)
  })
  return results
}

// const generateAnnFiles = () => {
//   child_process.execFileSync('sh', ['./ctakes_command.sh'], { stdio: 'inherit' })
// }
// generateAnnFiles()

const generateAnnFiles = (runDockerScriptPath, inputDirAbsolutePath, outputDirAbsolutePath) => {
  child_process.execFileSync('sh', [runDockerScriptPath, inputDirAbsolutePath, outputDirAbsolutePath], { stdio: 'inherit' })
}
// const runDockerScriptPath = '/home/alejandro/code/ictusnet-ctakes/run-docker.sh'
// const inputDirAbsolutePath = '/tmp/ctakes/input'
// const outputDirAbsolutePath = '/tmp/ctakes/output'
// generateAnnFiles(runDockerScriptPath, inputDirAbsolutePath, outputDirAbsolutePath)

module.exports = {
  moveFiles,
  generateAnnFiles,
  processBratDirectory,
}