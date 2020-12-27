const fs = require('fs')
const exec = require('child_process').exec
const path = require('path')
const { parse } = require('./brat-parse')

const runCtakesDocker = (script, input, output) => {
  // run ctakes docker to generate ann files from uploaded txt files
  // https://github.com/TeMU-BSC/ictusnet-ctakes#method-1-docker
  const execution = exec(`bash ${script} ${input} ${output}`)
  console.log(execution)
  execution.stdout.on('data', (data) => {
    console.log(data)
    // do whatever you want here with data
  })
  execution.stderr.on('data', (data) => {
    console.error(data)
  })
}
runCtakesDocker('/home/alejandro/code/ictusnet-ctakes/run-docker.sh',
  '/home/alejandro/code/ictusnet/backend/ctakes/input',
  '/home/alejandro/code/ictusnet/backend/ctakes/output'
)

const moveFiles = (inputDir, outputputDir, destinationDir) => {
  fs.readdirSync(inputDir).forEach(file => {
    const oldFile = path.join(inputDir, file)
    const newFile = path.join(destinationDir, path.parse(file).base)
    fs.renameSync(oldFile, newFile)
  })
  fs.readdirSync(outputputDir).forEach(file => {
    const oldFile = path.join(outputDir, file)
    const newFile = path.join(destinationDir, path.parse(file).base)
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
    const annotatedObject = parse(txt, ann)
    results.push(annotatedObject)
  })
  return results
}

module.exports = {
  runCtakesDocker,
  moveFiles,
  processBratDirectory
}