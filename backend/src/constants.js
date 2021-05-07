const path = require('path')

const demoDir = './ner/deeplearning/demo/brat'
const uploadsDir = './uploads'
const preannotationsDir = './preannotations'
const bratDir = path.join(preannotationsDir, 'joint')

const NER_DEEPLEARNING_SCRIPT_CONTAINER_PATH = process.env.NER_DEEPLEARNING_SCRIPT_CONTAINER_PATH || '/app/ner/deeplearning/run-docker.sh'
const NER_CTAKES_SCRIPT_CONTAINER_PATH = process.env.NER_CTAKES_SCRIPT_CONTAINER_PATH || '/app/ner/ctakes/run-docker.sh'
const NER_INPUT_DIR_HOST_PATH = process.env.NER_INPUT_DIR_HOST_PATH || '/var/www/html/ictusnet-webapp/backend/uploads'
const NER_DEEPLEARNING_OUTPUT_DIR_HOST_PATH = process.env.NER_DEEPLEARNING_OUTPUT_DIR_HOST_PATH || '/var/www/html/ictusnet-webapp/backend/preannotations'
const NER_CTAKES_OUTPUT_DIR_HOST_PATH = process.env.NER_CTAKES_OUTPUT_DIR_HOST_PATH || '/var/www/html/ictusnet-webapp/backend/preannotations/ctakes'
const NER_MODEL_DIR_CONTAINER_PATH = process.env.NER_MODEL_DIR_CONTAINER_PATH || '/var/www/html/ictusnet-webapp/backend/ner/deeplearning/model'

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
  NER_DEEPLEARNING_SCRIPT_CONTAINER_PATH,
  NER_CTAKES_SCRIPT_CONTAINER_PATH,
  NER_INPUT_DIR_HOST_PATH,
  NER_DEEPLEARNING_OUTPUT_DIR_HOST_PATH,
  NER_CTAKES_OUTPUT_DIR_HOST_PATH,
  NER_MODEL_DIR_CONTAINER_PATH,
  variablesFile,
  optionsFile,
  ictusnetDictFile,
  entitiesForDiagnosticoPrincipal,
  nonSpecificEntities,
}