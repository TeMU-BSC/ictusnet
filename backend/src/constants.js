const path = require('path')

const demoDir = './ner/deeplearning/demo/brat'

const uploadsDir = './uploads'
const preannotationsDir = './preannotations'
const bratDir = path.join(preannotationsDir, 'brat')
const nerDir = process.env.ICTUSNET_NER_DIR || '../../ictusnet-ner'
const modelDir = path.join(nerDir, 'model')
const runDockerScript = path.join(nerDir, 'run-docker.sh')

const variablesFile = '../config/variables.tsv'
const optionsFile = '../config/options.tsv'
const ictusnetDictFile = '../config/IctusnetDict.bsv'

const entitiesForDiagnosticoPrincipal = [
  'Ictus_isquemico',
  'Ataque_isquemico_transitorio',
  'Hemorragia_cerebral'
]
const nonSpecificEntities = [
  'Trombolisis_intravenosa',
  'Trombolisis_intraarterial',
  'Trombectomia_mecanica',
  'Tratamiento_anticoagulante',
  'Tratamiento_antiagregante',
  'TAC_craneal',
  'mRankin',
  'NIHSS',
]

module.exports = {
  demoDir,
  uploadsDir,
  modelDir,
  preannotationsDir,
  bratDir,
  runDockerScript,
  variablesFile,
  optionsFile,
  ictusnetDictFile,
  entitiesForDiagnosticoPrincipal,
  nonSpecificEntities,
}