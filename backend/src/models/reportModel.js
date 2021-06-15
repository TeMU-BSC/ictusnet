const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const annotationSchema = new Schema({
  id: String,
  entity: String,
  offset: {
    start: Number,
    end: Number
  },
  evidence: String,
  note: { type: String, default: '' },
}, { _id: false })

const formSchema = new Schema({
  fecha_inicio_sintomas: { type: String, default: null },
  hora_inicio_sintomas: { type: String, default: null },
  fecha_llegada_hospital: { type: String, default: null },
  hora_llegada_hospital: { type: String, default: null },
  fecha_de_ingreso: { type: String, default: null },
  fecha_de_alta: { type: String, default: null },
  hora_de_alta: { type: String, default: null },
  diagnostico_principal: { type: String, default: null },
  arterias_afectadas: [String],
  localizaciones: [String],
  lateralizacion: { type: String, default: null },
  etiologia: { type: String, default: null },
  fecha_trombolisis_rtpa: { type: String, default: null },
  hora_primer_bolus_trombolisis_rtpa: { type: String, default: null },
  fecha_inicio_trombolisis_intraarterial: { type: String, default: null },
  hora_inicio_trombolisis_intraarterial: { type: String, default: null },
  fecha_inicio_trombectomia: { type: String, default: null },
  hora_inicio_trombectomia: { type: String, default: null },
  tiempo_puerta_puncion: { type: String, default: null },
  tiempo_puerta_aguja: {type: String, default: null},
  fecha_primera_serie_trombectomia: { type: String, default: null },
  hora_primera_serie_trombectomia: { type: String, default: null },
  fecha_recanalizacion: { type: String, default: null },
  hora_recanalizacion: { type: String, default: null },
  fecha_fin_trombectomia: { type: String, default: null },
  hora_fin_trombectomia: { type: String, default: null },
  tratamiento_antiagregante_hab: [String],
  tratamiento_antiagregante_alta: [String],
  tratamiento_anticoagulante_hab: [String],
  tratamiento_anticoagulante_alta: [String],
  fecha_tac: { type: String, default: null },
  hora_tac: { type: String, default: null },
  aspects: { type: Number, default: null },
  mrankin_previa: { type: Number, default: null },
  mrankin_alta: { type: Number, default: null },
  nihss_previa: { type: Number, default: null },
  nihss_alta: { type: Number, default: null },
  test_de_disfagia: { type: String, default: null },
}, { _id: false })

const reportSchema = new Schema({
  filename: String,
  text: String,
  annotations: [annotationSchema],
  result: {
    initial: { type: formSchema, default: {} },
    final: { type: formSchema, default: {} },
  },
  completed: { type: Boolean, default: false },
})

const Report = mongoose.model('Report', reportSchema)

module.exports = {
  Report,
}