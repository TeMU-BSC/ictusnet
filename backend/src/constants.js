const path = require('path')

const demoDir = './ner/deeplearning/demo/brat'
const uploadsDir = './uploads'
const preannotationsDir = './preannotations'
const bratDir = path.join(preannotationsDir, 'brat')

const NER_SCRIPT_CONTAINER_PATH = process.env.NER_SCRIPT_CONTAINER_PATH || '/ictusnet-ner/run-docker.sh'
const NER_INPUT_DIR_HOST_PATH = process.env.NER_INPUT_DIR_HOST_PATH || '/var/www/html/ictusnet-webapp/backend/uploads'
const NER_OUTPUT_DIR_HOST_PATH = process.env.NER_OUTPUT_DIR_HOST_PATH || '/var/www/html/ictusnet-webapp/backend/preannotations'
const NER_MODEL_DIR_CONTAINER_PATH = process.env.NER_MODEL_DIR_CONTAINER_PATH || '/ictusnet-ner/model'

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
  preannotationsDir,
  bratDir,
  NER_SCRIPT_CONTAINER_PATH,
  NER_INPUT_DIR_HOST_PATH,
  NER_OUTPUT_DIR_HOST_PATH,
  NER_MODEL_DIR_CONTAINER_PATH,
  variablesFile,
  optionsFile,
  ictusnetDictFile,
  entitiesForDiagnosticoPrincipal,
  nonSpecificEntities,
}