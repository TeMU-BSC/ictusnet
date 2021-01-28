const { ictusnetDictFile } = require('../constants')
const { parseIctusnetDictFile } = require('../helpers/io')

const admissibleEvidencesFromIctusnetDict = parseIctusnetDictFile(ictusnetDictFile)

const entitiesForDiagnosticoPrincipal = [
  'Ictus_isquemico',
  'Ataque_isquemico_transitorio',
  'Hemorragia_cerebral'
]

// Similar behaviour as the admissible values for entitites in CTAKES:
// https://github.com/TeMU-BSC/spactes/blob/master/ctakes-SpaCTeS-res/src/main/resources/org/apache/ctakes/examples/dictionary/lookup/fuzzy/IctusnetDict.bsv
// const admissibleEvidences = {
//   diagnosticoPrincipal: {},
//   lateralizacion: {
//     izquierda: [
//       'i',
//       'izq',
//       'izdo',
//       'izquierdo',
//       'izquierda',
//       'e',
//       'esq',
//       'esquerre',
//       'esquerra',
//     ],
//     derecha: [
//       'd',
//       'der',
//       'dcha',
//       'dcho',
//       'derecho',
//       'derecha',
//       'dret',
//       'dreta',
//     ],
//     ambas: [
//       'ambas',
//       'ambdues',
//       'bihemisferico',
//       'bilateral',
//       'bilaterales',
//       'tronco cerebral',
//     ],
//     indeterminada: [
//       ''
//     ]
//   },
//   etiologia: {},
// }

/**
 * Return the according annotations for the given variable, taking into account
 * the entities for the special case `Diagnostico_principal`.
 */
const filterAnnotationsForVariable = (variable, annotations) => {
  const filterCondition = (annotation) => variable.entity === 'Diagnostico_principal'
    ? entitiesForDiagnosticoPrincipal.includes(annotation.entity)
    : variable.entity === annotation.entity
  return annotations.filter(annotation => filterCondition(annotation))
}

/**
 * Search for a suitable value (string) or values (array of strings) to autofill the form field for the given variable.
 */
const autofillField = (variable, reportAnnotations) => {
  const admissibles = admissibleEvidencesFromIctusnetDict
  const annotations = filterAnnotationsForVariable(variable, reportAnnotations)
  const firstEvidence = annotations.find(() => true)?.evidence

  const isInput = variable.field_type === 'input'
  const isSelect = variable.field_type === 'select'
  const isSingle = variable.cardinality === '1'
  const isMulti = variable.cardinality === 'n'
  const isSingleSelect = isSelect && isSingle
  const isMultiSelect = isSelect && isMulti

  // input type form fields (fecha_*, hora_*), return the normalized value YYYY-MM-DD, hh:mm present in annotation's note
  if (isInput) {
    const firstNonEmptyNote = annotations.find(({ note }) => note)?.note
    return firstNonEmptyNote
  }

  // 3 hand-crafted strategies to get the maximum possible matches in select form fields
  const isFirstEvidenceSubstringOfOption = (option) => option.value.includes(firstEvidence?.toLowerCase())
  const isFirstEvidenceInAdmissibles = () => admissibles.find(({ entity }) => entity === variable.entity)?.evidences.includes(firstEvidence?.toLowerCase())
  const isFirstEvidenceStartingWithOption = (option) => firstEvidence?.toLowerCase().startsWith(option.value[0])
  const shouldMatch = (option) =>
    isFirstEvidenceSubstringOfOption(option)
    || isFirstEvidenceInAdmissibles()
    || isFirstEvidenceStartingWithOption(option)

  // (diagnostico_principal, lateralizacion, etiologia)
  if (isSingleSelect) {
    let matchedOption

    // ('ictus isquémico', 'ataque isquémico transitorio', 'hemorragia cerebral')
    const isDiagnosticoPrincipal = variable.entity === 'Diagnostico_principal'
    if (isDiagnosticoPrincipal) {
      const firstAnnotationForDiagnosticoPrincipal = annotations.find(annotation => entitiesForDiagnosticoPrincipal.includes(annotation.entity))
      const shouldMatchEntityWithOption = (option) => option.value.toLowerCase().startsWith(firstAnnotationForDiagnosticoPrincipal?.entity.toLowerCase().split('_')[0])
      matchedOption = variable.options.find(option => shouldMatchEntityWithOption(option))?.value
      return matchedOption
    }

    matchedOption = variable.options.find(option => shouldMatch(option))?.value
    return matchedOption
  }

  // (arterias_afectadas, localizacion, tratamiento_antiagregante_hab, tratamiento_antiagregante_alta, tratamiento_anticoagulante_hab, tratamiento_anticoagulante_alta),
  // must return an array of strings
  if (isMultiSelect) {
    const matchedOptions = annotations
      .map(({ evidence }) => variable.options
        .find(({ value, comment }) => value
          .concat(' ', comment).toLowerCase()
          .includes(evidence?.toLowerCase())
        )?.value
      )
    return [...new Set(matchedOptions)]
  }
}

module.exports = {
  autofillField,
}