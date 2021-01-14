// const child_process = require('child_process')
const { spawn, exec, execFileSync } = require("child_process")
const path = require('path')

const { parse } = require('./brat')
const { moveFiles, walk } = require('./helpers')

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
 * Scan a directory with txt files and ann files with the same base filenames by pairs.
 * Example content:
 *   file1.txt
 *   file1.ann
 *   file2.txt
 *   file2.ann
 * @param {string} bratDir Relative path to the directory that contains txt and ann files.
 */
const getParsedBratDirArray = async (bratDir) => {
  const parsedBratDirArray = []
  const uniqueBasenames = new Set()
  for await (const file of walk(bratDir)) {
    const basename = path.parse(file).name
    uniqueBasenames.add(basename)
  }
  uniqueBasenames.forEach(basename => {
    const txt = path.join(bratDir, `${basename}.txt`)
    const ann = path.join(bratDir, `${basename}.ann`)
    const parsedBrat = parse(txt, ann)
    parsedBratDirArray.push(parsedBrat)
  })
  return parsedBratDirArray
}

module.exports = {
  generateAnnFilesSync,
  getParsedBratDirArray,
}