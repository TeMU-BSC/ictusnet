export const panelIcons = {
  'Entrada y salida del paciente': 'airport_shuttle',
  'Diagnóstico': 'local_hospital',
  'Procedimientos I - trombólisis': 'masks',
  'Procedimientos II - trombectomía': 'healing',
  'Tratamientos': 'local_pharmacy',
  'Pruebas y escalas de valoración': 'analytics',
}

// Similar behaviour as the suggestions from CTAKES:
// https://github.com/TeMU-BSC/spactes/blob/master/ctakes-SpaCTeS-res/src/main/resources/org/apache/ctakes/examples/dictionary/lookup/fuzzy/IctusnetDict.bsv
export const admissibleEvidences = {
  diagnosticoPrincipal: {},
  lateralizacion: {
    izquierda: [
      'i',
      'izq',
      'izdo',
      'esquerre',
      'esquerra',
      'esq',
    ],
    derecha: [
      'd',
      'der',
      'dcho',
      'derecho',
      'dret',
      'dreta',
    ],
    ambas: [
      'bilateral',
      'ambdues',
      'bihemisferico',
    ],
    indeterminada: [
      ''
    ]
  },
  etiologia: {},
}

export const nonSpecificEntities = {
  'Trombólisis intravenosa': 'Trombolisis_intravenosa',
  'Trombólisis intraarterial': 'Trombolisis_intraarterial',
  'Trombectomía mecánica': 'Trombectomia_mecanica',
  'Anticoagulantes': 'Tratamiento_anticoagulante',
  'Antiagregantes': 'Tratamiento_antiagregante',
  'TAC craneal': 'TAC_craneal',
  'mRankin': 'mRankin',
  'NIHSS': 'NIHSS',
}

export const diagnosticoPrincipalEntities = [
  'Ictus_isquemico',
  'Ataque_isquemico_transitorio',
  'Hemorragia_cerebral'
]

export const diagnosticoSectionGroupNames = [
  'Diagnóstico principal',
  'Arterias afectadas',
  'Localizaciones',
  'Lateralización',
  'Etiología',
]
