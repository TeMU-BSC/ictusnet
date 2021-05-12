const path = require('path')

const UPLOADS_DIR = './uploads'
const ANNOTATIONS_DIR = './annotations'
const NER_JOINT_DIR = path.join(ANNOTATIONS_DIR, 'joint')
const NER_CTAKES_DIR = path.join(ANNOTATIONS_DIR, 'ctakes')
const NER_DEEPLEARNING_DIR = path.join(ANNOTATIONS_DIR, 'deeplearning')
const NER_DEEPLEARNING_SCRIPT_CONTAINER_PATH = '/app/ner/deeplearning/run-docker.sh'
const NER_CTAKES_SCRIPT_CONTAINER_PATH = '/app/ner/ctakes/run-docker.sh'

const DEEPLEARNING_BRAT_DEMO_DIR = '/var/www/html/ictusnet-webapp/backend/ner/deeplearning/demo/brat'
const NER_INPUT_DIR_HOST_PATH = process.env.NER_INPUT_DIR_HOST_PATH || '/var/www/html/ictusnet-webapp/backend/uploads'
const NER_DEEPLEARNING_OUTPUT_DIR_HOST_PATH = process.env.NER_DEEPLEARNING_OUTPUT_DIR_HOST_PATH || '/var/www/html/ictusnet-webapp/backend/annotations'
const NER_CTAKES_OUTPUT_DIR_HOST_PATH = process.env.NER_CTAKES_OUTPUT_DIR_HOST_PATH || '/var/www/html/ictusnet-webapp/backend/annotations/ctakes'
const NER_DEEPLEARNING_MODEL_DIR_CONTAINER_PATH = process.env.NER_DEEPLEARNING_MODEL_DIR_CONTAINER_PATH || '/var/www/html/ictusnet-webapp/backend/ner/deeplearning/model'

const ICTUSNET_VARIABLES_TSV = '../config/variables.tsv'
const ICTUSNET_OPTIONS_TSV = '../config/options.tsv'
const ICTUSNET_CTAKES_DICT_BSV = '../config/IctusnetDict.bsv'

const ENTITIES_FOR_DIAGNOSTICO_PRINCIPAL = [
  'Ictus_isquemico',
  'Ataque_isquemico_transitorio',
  'Hemorragia_cerebral'
]
const NON_SPECIFIC_ENTITIES = [
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
  DEEPLEARNING_BRAT_DEMO_DIR,
  UPLOADS_DIR,
  ANNOTATIONS_DIR,
  NER_JOINT_DIR,
  NER_CTAKES_DIR,
  NER_DEEPLEARNING_DIR,
  NER_DEEPLEARNING_SCRIPT_CONTAINER_PATH,
  NER_CTAKES_SCRIPT_CONTAINER_PATH,
  NER_INPUT_DIR_HOST_PATH,
  NER_DEEPLEARNING_OUTPUT_DIR_HOST_PATH,
  NER_CTAKES_OUTPUT_DIR_HOST_PATH,
  NER_DEEPLEARNING_MODEL_DIR_CONTAINER_PATH,
  ICTUSNET_VARIABLES_TSV,
  ICTUSNET_OPTIONS_TSV,
  ICTUSNET_CTAKES_DICT_BSV,
  ENTITIES_FOR_DIAGNOSTICO_PRINCIPAL,
  NON_SPECIFIC_ENTITIES,
}