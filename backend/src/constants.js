const demoDir = './demo'
const uploadsDir = './uploads'
const ctakesDir = '/tmp/ctakes'  // must have 777 permissions so ctakes can write ann files inside it
const runDockerScript = './ictusnet-ctakes/run-docker.sh'
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
  ctakesDir,
  runDockerScript,
  variablesFile,
  optionsFile,
  ictusnetDictFile,
  entitiesForDiagnosticoPrincipal,
  nonSpecificEntities,
}