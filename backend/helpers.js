const fs = require('fs')
const path = require('path')

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

module.exports = {
  createPublicDirIfNotExists,
  copyFiles,
  moveFiles,
  walk,
}