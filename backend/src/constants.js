const path = require("path");

const BACKEND_ABSOLUTE_PATH_IN_HOST = process.env.BACKEND_ABSOLUTE_PATH_IN_HOST;
const RUN_DOCKER_SCRIPT_DEEPLEARNING =
  process.env.RUN_DOCKER_SCRIPT_DEEPLEARNING;
const RUN_DOCKER_SCRIPT_CTAKES = process.env.RUN_DOCKER_SCRIPT_CTAKES;
const UPLOADS_DIR = process.env.UPLOADS_DIR;
const BRAT_DEMO_DIR = process.env.BRAT_DEMO_DIR;
const ANNOTATIONS_DIR = process.env.ANNOTATIONS_DIR;

// The following constants must be absolute paths from the host perspective.
const MODEL_DIR = process.env.MODEL_DIR;
const CTAKES_DIR = process.env.CTAKES_DIR;
const DEEPLEARNING_DIR = process.env.DEEPLEARNING_DIR;
const JOINT_DIR = process.env.JOINT_DIR;

const ICTUSNET_VARIABLES_TSV = "../config/variables.tsv";
const ICTUSNET_OPTIONS_TSV = "../config/options.tsv";
const ICTUSNET_CTAKES_DICT_BSV = "../config/IctusnetDict.bsv";

const ENTITIES_FOR_DIAGNOSTICO_PRINCIPAL = [
  "Ictus_isquemico",
  "Ataque_isquemico_transitorio",
  "Hemorragia_cerebral",
];
const NON_SPECIFIC_ENTITIES = [
  "Trombolisis_intravenosa",
  "Trombolisis_intraarterial",
  "Trombectomia_mecanica",
  "Tratamiento_anticoagulante",
  "Tratamiento_antiagregante",
  "TAC_craneal",
  "mRankin",
  "NIHSS",
];
const LateralizacionAdmissibleEvidencesObj = {
  ambas: ["ambas", "bihemisferico", "bilaterales", "tronco cerebral"],
  "tronco cerebral": ["tronco cerebral"],
  derecha: ["derecha", "d", "dcha", "dcho", "derecho", "dret", "dreta"],
  izquierda: [
    "izquierda",
    "e",
    "esq",
    "esq.",
    "esquerre",
    "i",
    "izda",
    "izdo",
    "izq",
  ],
};

module.exports = {
  BACKEND_ABSOLUTE_PATH_IN_HOST,
  RUN_DOCKER_SCRIPT_DEEPLEARNING,
  RUN_DOCKER_SCRIPT_CTAKES,
  BRAT_DEMO_DIR,
  UPLOADS_DIR,
  ANNOTATIONS_DIR,
  JOINT_DIR,
  CTAKES_DIR,
  DEEPLEARNING_DIR,
  MODEL_DIR,
  ICTUSNET_VARIABLES_TSV,
  ICTUSNET_OPTIONS_TSV,
  ICTUSNET_CTAKES_DICT_BSV,
  ENTITIES_FOR_DIAGNOSTICO_PRINCIPAL,
  NON_SPECIFIC_ENTITIES,
  LateralizacionAdmissibleEvidencesObj,
};
