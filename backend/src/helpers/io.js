const fs = require('fs')
const child_process = require("child_process")
const path = require('path')
const csvParse = require('csv-parse/lib/sync')
const { getAnnotations } = require('./brat')
const {
  NER_DEEPLEARNING_SCRIPT_CONTAINER_PATH,
  NER_CTAKES_SCRIPT_CONTAINER_PATH,
  NER_INPUT_DIR_HOST_PATH,
  NER_DEEPLEARNING_OUTPUT_DIR_HOST_PATH,
  NER_CTAKES_OUTPUT_DIR_HOST_PATH,
  NER_MODEL_DIR_CONTAINER_PATH,
} = require('../constants')

const createPublicDirIfNotExists = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
  fs.chmodSync(path, 0777)
}

const copyDirectory = (sourceDirectory, destinationDirectory) => {
  fs.readdirSync(sourceDirectory).forEach(file => {
    const oldFile = path.join(sourceDirectory, file)
    const newFile = path.join(destinationDirectory, path.parse(file).base)
    fs.copyFileSync(oldFile, newFile)
  })
}

const moveFilesInDirectory = (sourceDirectory, destinationDirectory) => {
  fs.readdirSync(sourceDirectory).forEach(file => {
    const oldFile = path.join(sourceDirectory, file)
    const newFile = path.join(destinationDirectory, path.parse(file).base)
    fs.renameSync(oldFile, newFile)
  })
}

const removeFilesInDirectory = (directory) => {
  fs.readdirSync(directory).forEach(file => fs.rmSync(path.join(directory, file)))
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
 * Generate annotation (.ann) files by calling the NER docker container https://hub.docker.com/r/bsctemu/ictusnet.
 * docker pull bsctemu/ictusnet:latest 
 */
const generateAnnFilesDeeplearningSync = () => {
  child_process.execFileSync('sh', [
    NER_DEEPLEARNING_SCRIPT_CONTAINER_PATH,
    NER_INPUT_DIR_HOST_PATH,
    NER_DEEPLEARNING_OUTPUT_DIR_HOST_PATH,
    NER_MODEL_DIR_CONTAINER_PATH,
  ], { stdio: 'inherit' })
}

/**
 * Generate annotation (.ann) files by calling the NER docker container https://hub.docker.com/r/bsctemu/ictusnet.
 * docker pull bsctemu/ictusnet:ctakes 
 */
 const generateAnnFilesCtakesSync = () => {
  child_process.execFileSync('sh', [
    NER_CTAKES_SCRIPT_CONTAINER_PATH,
    NER_INPUT_DIR_HOST_PATH,
    NER_CTAKES_OUTPUT_DIR_HOST_PATH,
  ], { stdio: 'inherit' })
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
  copyDirectory,
  moveFilesInDirectory,
  removeFilesInDirectory,
  walk,
  generateAnnFilesDeeplearningSync,
  generateAnnFilesCtakesSync,
  getFileContent,
  parseBratDirectory,
  parseVariableFile,
  parseIctusnetDictFile,
}