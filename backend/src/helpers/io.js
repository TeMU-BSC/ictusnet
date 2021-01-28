const fs = require('fs')
const path = require('path')
const { execFileSync } = require("child_process")
const csvParse = require('csv-parse/lib/sync')
const { getAnnotations } = require('./brat')

const createPublicDirIfNotExists = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
  fs.chmodSync(path, 0777)
}

const copyFiles = (sourceDirectory, destinationDirectory) => {
  fs.readdirSync(sourceDirectory).forEach(file => {
    const oldFile = path.join(sourceDirectory, file)
    const newFile = path.join(destinationDirectory, path.parse(file).base)
    fs.copyFileSync(oldFile, newFile)
  })
}

const moveFiles = (sourceDirectory, destinationDirectory) => {
  fs.readdirSync(sourceDirectory).forEach(file => {
    const oldFile = path.join(sourceDirectory, file)
    const newFile = path.join(destinationDirectory, path.parse(file).base)
    fs.renameSync(oldFile, newFile)
  })
}

const getFileContent = (file) => {
  const absolutePath = path.resolve(path.join(__dirname, file))
  const contentString = fs.readFileSync(absolutePath, 'utf8')
  return contentString
}

// https://gist.github.com/lovasoa/8691344
async function* walk(dir) {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name)
    if (d.isDirectory()) yield* walk(entry)
    else if (d.isFile()) yield entry
  }
}

/**
 * Generate annotation (.ann) files by calling the CTAKES docker container https://github.com/TeMU-BSC/ictusnet-ctakes.
 * @param {string} runDockerScript Path to the downloaded script: https://github.com/TeMU-BSC/ictusnet-ctakes/blob/master/run-docker.sh
 * @param {string} txtDir Directory where the INPUT `.txt` files are sotred. It must be an absolute path so it can work with docker call.
 * @param {string} annDir Directory where the OUTPUT `.ann` files are sotred. It must be an absolute path so it can work with docker call.
 */
const generateAnnFilesSync = (runDockerScript, txtDir, annDir) => {
  const runDockerScriptAbsolutePath = path.resolve(runDockerScript)
  const txtDirAbsolutePath = path.resolve(txtDir)
  const annDirAbsolutePath = path.resolve(annDir)
  execFileSync('sh', [runDockerScriptAbsolutePath, txtDirAbsolutePath, annDirAbsolutePath], { stdio: 'inherit' })
}

/**
 * Build an annotated report object.
 * @param {string} txtFile 
 * @param {string} annFile 
 */
const parseBratFilePair = (txtFile, annFile) => {
  const filename = path.parse(annFile).name
  const text = fs.readFileSync(txtFile, 'utf8')
  const annString = fs.readFileSync(annFile, 'utf8')
  const annArray = csvParse(annString, { delimiter: '\t' })
  const annotations = getAnnotations(annArray)
  const annotatedReport = { filename, text, annotations }
  return annotatedReport
}

/**
 * Scan a directory with txt files and ann files with the same base filenames by pairs.
 * Example content:
 *   file1.txt
 *   file1.ann
 *   file2.txt
 *   file2.ann
 * @param {string} bratDir Relative path to the directory that contains txt and ann files.
 */
const parseBratDirectory = async (bratDir) => {
  const parsedBratDirArray = []
  const uniqueBasenames = new Set()
  for await (const file of walk(bratDir)) {
    const basename = path.parse(file).name
    uniqueBasenames.add(basename)
  }
  uniqueBasenames.forEach(basename => {
    const txt = path.join(bratDir, `${basename}.txt`)
    const ann = path.join(bratDir, `${basename}.ann`)
    const parsedBrat = parseBratFilePair(txt, ann)
    parsedBratDirArray.push(parsedBrat)
  })
  return parsedBratDirArray
}

const parseVariableFile = (variablesFile, optionsFile) => {
  const variablesFileContent = getFileContent(variablesFile)
  const optionsFileContent = getFileContent(optionsFile)
  const variables = csvParse(variablesFileContent, { delimiter: '\t', columns: true, relaxColumnCount: true, quote: '\'', skipEmptyLines: true })
  const options = csvParse(optionsFileContent, { delimiter: '\t', columns: true, relaxColumnCount: true, quote: '\'', skipEmptyLines: true })
  variables.forEach(variable => {

    // Use of startsWith method due to these entities:
    // Tratamiento_anticoagulante_[hab|alta], Tratamiento_antiagregante_[hab|alta]
    const optionsForVariable = options.filter(option => variable.entity.startsWith(option.entity))
    variable.options = optionsForVariable
  })
  return variables
}

const parseIctusnetDictFile = (ictusnetDictFile) => {
  const fileContent = getFileContent(ictusnetDictFile)
  const parsedArray = csvParse(fileContent, {
    delimiter: '|',
    columns: true,
    relaxColumnCount: true,
    skipEmptyLines: true,
  })

  // remove _SUG_ prefixes from each entity
  parsedArray.forEach(obj => obj.entity = obj.entity.replace('_SUG_', ''))

  const entities = [...new Set(parsedArray.map(obj => obj.entity))]
  const tidyAdmissibles = entities.map(entity => {
    return {
      entity: entity,
      snomedct: parsedArray.find(obj => obj.entity === entity).snomedct,
      evidences: parsedArray.filter(obj => obj.entity === entity).map(obj => obj.evidence)
    }
  })

  return tidyAdmissibles
}

module.exports = {
  createPublicDirIfNotExists,
  copyFiles,
  moveFiles,
  walk,
  generateAnnFilesSync,
  getFileContent,
  parseBratDirectory,
  parseVariableFile,
  parseIctusnetDictFile,
}