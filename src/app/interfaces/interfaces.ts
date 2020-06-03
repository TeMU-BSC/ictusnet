export interface Suggestion {
  id: string;
  entity: string;
  offset: {
    start: number;
    end: number;
  };
  evidence: string;
  notes: string;
}

export interface Variable {
  section: string;
  group?: string;
  longLabel: string;
  shortLabel: string;
  help?: string;
  entity: string;
  key: string;
  cardinality: string;
  fieldType: string;
  inputType?: string;
  admissibles?: any[];
  comments?: string;
}

export interface IctusModel {
  entradaSalidaPaciente: {
    inicioSintomasOUltimaVezAsintomatico: {
      fecha: string,
      hora: string,
    },
    llegadaAlHospital: {
      fecha: string,
      hora: string,
    },
    ingreso: {
      fecha: string,
      // hora: string,
    },
    alta: {
      fecha: string,
      hora: string,
    },
  },
  diagnosticos: {
    diagnosticoPrincipal: string,
    arteriasAfectadas: string[],
    localizaciones: string[],
    lateralizacion: string,
    etiologia: string,
  },
  procedimientos: {
    trombolisis: {
      intraarterial: {
        fecha: string,
        hora: string,
      },
      intravenosa: {
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
}
