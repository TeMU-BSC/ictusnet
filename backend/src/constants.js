const path = require('path')

const demoDir = './ner/deeplearning/demo/brat'

const uploadsDir = './uploads'
const preannotationsDir = './preannotations'
const bratDir = path.join(preannotationsDir, 'brat')
const modelDir = process.env.HOST_NER_MODEL_DIR || '/var/www/html/ictusnet-ner/model'

const runDockerScript = process.env.HOST_NER_SCRIPT || '/var/www/html/ictusnet-ner/run-docker.sh'
const HOST_NER_SCRIPT_DOCKER_RUN = process.env.HOST_NER_SCRIPT || '/var/www/html/ictusnet-ner/run-docker.sh'
const HOST_NER_INPUT_DIR = process.env.HOST_NER_INPUT_DIR || '/var/www/html/ictusnet-webapp/backend/uploads'
const HOST_NER_OUTPUT_DIR = process.env.HOST_NER_OUTPUT_DIR || '/var/www/html/ictusnet-webapp/backend/preannotations'
const HOST_NER_MODEL_DIR = process.env.HOST_NER_MODEL_DIR || '/var/www/html/ictusnet-ner/model'

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
  HOST_NER_SCRIPT_DOCKER_RUN,
  HOST_NER_INPUT_DIR,
  HOST_NER_OUTPUT_DIR,
  HOST_NER_MODEL_DIR,
  variablesFile,
  optionsFile,
  ictusnetDictFile,
  entitiesForDiagnosticoPrincipal,
  nonSpecificEntities,
}