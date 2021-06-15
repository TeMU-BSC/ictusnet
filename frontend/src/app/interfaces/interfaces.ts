export interface IctusnetForm {
  fecha_inicio_sintomas: string
  hora_inicio_sintomas: string
  fecha_llegada_hospital: string
  hora_llegada_hospital: string
  fecha_de_ingreso: string
  fecha_de_alta: string
  hora_de_alta: string
  diagnostico_principal: string
  arterias_afectadas: string[]
  localizaciones: string[]
  lateralizacion: string
  etiologia: string
  fecha_trombolisis_rtpa: string
  hora_primer_bolus_trombolisis_rtpa: string
  fecha_inicio_trombolisis_intraarterial: string
  hora_inicio_trombolisis_intraarterial: string
  fecha_inicio_trombectomia: string
  hora_inicio_trombectomia: string
  tiempo_puerta_puncion: string
  tiempo_puerta_aguja: string
  fecha_primera_serie_trombectomia: string
  hora_primera_serie_trombectomia: string
  fecha_recanalizacion: string
  hora_recanalizacion: string
  fecha_fin_trombectomia: string
  hora_fin_trombectomia: string
  tratamiento_antiagregante_hab: string[]
  tratamiento_antiagregante_alta: string[]
  tratamiento_anticoagulante_hab: string[]
  tratamiento_anticoagulante_alta: string[]
  fecha_tac: string
  hora_tac: string
  aspects: number
  mrankin_previa: number
  mrankin_alta: number
  nihss_previa: number
  nihss_alta: number
  test_de_disfagia: string
}

export interface Report {
  filename: string
  text: string
  annotations?: Annotation[]
  result: {
    initial: IctusnetForm,
    final: IctusnetForm,
  }
  completed: boolean
}

export interface Annotation {
  id: string
  entity: string
  offset: {
    start: number
    end: number
  }
  evidence: string
  note: string
}

export interface Variable {
  section: string
  group: string
  label: string
  info?: string
  entity: string
  key: string
  cardinality: string
  field_type: string
  input_type?: string
  options?: Option[]
  comment?: string
}

export interface Option {
  entity: string
  value: string
  comment?: string
}

// not used, it's just a possible nested json schema
export interface IctusModel {
  entradaSalidaPaciente: {
    inicioSintomas: {
      fecha: string,
      hora: string,
    },
    llegadaAlHospital: {
      fecha: string,
      hora: string,
    },
    ingreso: {
      fecha: string,
    },
    alta: {
      fecha: string,
      hora: string,
    },
  },
  diagnostico: {
    diagnosticoPrincipal: string,
    arteriasAfectadas: string[],
    localizaciones: string[],
    lateralizacion: string,
    etiologia: string,
  },
  procedimientos: {
    trombolisis: {
      intravenosa: {
        fecha: string,
        hora: string,
      },
      intraarterial: {
        fecha: string,
        hora: string,
      },
    },
    trombectomiaMecanica: {
      inicio: {
        fecha: string,
        hora: string,
        tiempoPuertaPuncion: string,
      },
      primeraSerie: {
        fecha: string,
        hora: string,
      },
      recanalizacion: {
        fecha: string,
        hora: string,
      },
      finalizacion: {
        fecha: string,
        hora: string,
      },
    },
  },
  tratamientos: {
    antiagregantes: {
      habituales: string[],
      alAlta: string[],
    },
    anticoagulantes: {
      habituales: string[],
      alAlta: string[],
    },
  },
  pruebas: {
    tacCraneal: {
      fecha: string,
      hora: string,
    }
  },
  escalas: {
    aspects: string,
    mRankin: {
      previa: number,
      alAlta: number,
    },
    nihss: {
      previa: number,
      alAlta: number,
    },
  },
}
