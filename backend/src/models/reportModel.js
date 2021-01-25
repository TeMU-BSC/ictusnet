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
  note: String,
}, { _id: false })

const formSchema = new Schema({
  fecha_inicio_sintomas: String,
  hora_inicio_sintomas: String,
  fecha_llegada_hospital: String,
  hora_llegada_hospital: String,
  fecha_de_ingreso: String,
  fecha_de_alta: String,
  hora_de_alta: String,
  diagnostico_principal: String,
  arteria_afectada: String,
  localizacion: String,
  lateralizacion: String,
  etiologia: String,
  fecha_trombolisis_rtpa: String,
  hora_primer_bolus_trombolisis_rtpa: String,
  fecha_inicio_trombolisis_intraarterial: String,
  hora_inicio_trombolisis_intraarterial: String,
  fecha_inicio_trombectomia: String,
  hora_inicio_trombectomia: String,
  tiempo_puerta_puncion: String,
  fecha_primera_serie_trombectomia: String,
  hora_primera_serie_trombectomia: String,
  fecha_recanalizacion: String,
  hora_recanalizacion: String,
  fecha_fin_trombectomia: String,
  hora_fin_trombectomia: String,
  tratamiento_antiagregante_hab: String,
  tratamiento_antiagregante_alta: String,
  tratamiento_anticoagulante_hab: String,
  tratamiento_anticoagulante_alta: String,
  fecha_tac: String,
  hora_tac: String,
  aspects: Number,
  mrankin_previa: Number,
  mrankin_alta: Number,
  nihss_previa: Number,
  nihss_alta: Number,
}, { _id: false })

const reportSchema = new Schema({
  filename: String,
  text: String,
  annotations: [annotationSchema],
  form: {
    initial: Object,
    final: Object,
  },
  completed: Boolean,
})

const Report = mongoose.model('Report', reportSchema)

module.exports = {
  Report,
}