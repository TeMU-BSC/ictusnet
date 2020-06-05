export const panelIcons = {
  'Entrada y salida del paciente': 'airport_shuttle',
  'Diagnóstico': 'local_hospital',
  'Procedimientos': 'healing',
  // 'Tratamientos y escalas de valoración': 'analytics',
  'Tratamientos': 'local_pharmacy',
  'Pruebas y escalas de valoración': 'analytics',
};

export const admissibleEvidences = {
  lateralizacion: {
    izquierda: [
      'esquerre',
      'esquerra',
    ],
    derecha: [
      'dret',
      'dreta',
    ],
    ambas: [
      'bilateral',
      'ambdues',
    ],
    indeterminada: [
      ''
    ]
  },
  etiologia: {}
}

export const unspecifiedGroups = {
  'Anticoagulantes': 'Tratamiento_anticoagulante',
  'Antiagregantes': 'Tratamiento_antiagregante',
  'mRankin': 'mRankin',
  'NIHSS': 'NIHSS',
}
