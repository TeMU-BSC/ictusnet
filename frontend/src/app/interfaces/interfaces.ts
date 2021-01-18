export interface Annotation {
  id: string
  entity: string
  offset: {
    start: number
    end: number
  }
  evidence: string
  note: string
  nonSpecific?: boolean
}

export interface Variable {
  section: string
  group?: string
  longLabel: string
  shortLabel: string
  info?: string
  entity: string
  key: string
  cardinality: string
  fieldType: string
  inputType?: string
  options?: any[]
  comments?: string
}

export interface Document {
  filename: string,
  text: string,
  annotations: Annotation[]
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
