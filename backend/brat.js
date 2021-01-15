const fs = require('fs')
const path = require('path')
const csvParse = require('csv-parse/lib/sync')

const getLinesStartingWith = (annArray, startingText) => annArray.filter((line) => line[0].startsWith(startingText))
const getAnnotationLines = (annArray) => getLinesStartingWith(annArray, 'T')
const getCommentLines = (annArray) => getLinesStartingWith(annArray, '#')

const findId = (line) => line[0]
const findEntity = (line) => line[1].split(' ')[0].replace('_SUG_', '')
const findOffset = (line) => ({ start: Number(line[1].split(' ')[1]), end: Number(line[1].split(' ')[2]) })
const findEvidence = (line) => line[2]
const findNote = (annotationLine, commentLines) => {
  const foundNoteLine = commentLines.find((noteLine) => noteLine[1].split(' ')[1] === annotationLine[0])
  const note = foundNoteLine ? foundNoteLine[2] : ''
  return note
}

const getAnnotations = (annArray) => {
  const annotationLines = getAnnotationLines(annArray)
  const noteLines = getCommentLines(annArray)
  const annotations = annotationLines.map(line => ({
    id: findId(line),
    entity: findEntity(line),
    offset: findOffset(line),
    evidence: findEvidence(line),
    note: findNote(line, noteLines)
  }))
  return annotations
}

const parse = (txt, ann) => {
  const filename = path.parse(txt).name
  const text = fs.readFileSync(txt, 'utf8')
  const annString = fs.readFileSync(ann, 'utf8')
  const annArray = csvParse(annString, { delimiter: '\t' })
  const annotations = getAnnotations(annArray)
  return { filename, text, annotations }
}

module.exports = {
  parse
}