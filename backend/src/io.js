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

const parseGenericTsv = (tsvFile) => {
  const tsvPath = path.resolve(path.join(__dirname, tsvFile))
  const tsvString = fs.readFileSync(tsvPath, 'utf8')
  const objectArary = csvParse(tsvString, {
    delimiter: '\t',
    columns: true,
    relaxColumnCount: true,
    quote: '\'',
    skipEmptyLines: true,
  })
  return objectArary
}

module.exports = {
  createPublicDirIfNotExists,
  copyFiles,
  moveFiles,
  walk,
  generateAnnFilesSync,
  parseBratDirectory,
  parseGenericTsv,
}