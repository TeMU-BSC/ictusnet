const { entitiesForDiagnosticoPrincipal } = require('../constants')

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
  const annotations = filterAnnotationsForVariable(variable, reportAnnotations)
  const firstEvidence = annotations.find(() => true)?.evidence

  const isDiagnosticoPrincipal = variable.entity === 'Diagnostico_principal' // 'ictus isquémico', 'ataque isquémico transitorio', 'hemorragia cerebral'

  const isInput = variable.field_type === 'input' // fecha_*, hora_*, tiempo_puerta_puncion, aspects, mrankin_*, nihss_*
  const isSelect = variable.field_type === 'select'
  const isSingle = variable.cardinality === '1'
  const isMulti = variable.cardinality === 'n'
  const isSingleSelect = isSelect && isSingle // diagnostico_principal, lateralizacion, etiologia
  const isMultiSelect = isSelect && isMulti // arterias_afectadas, localizacion, tratamiento_*


  // Return the normalized value present in annotation's note.
  if (isInput) {
    const firstNonEmptyNote = annotations.find(({ note }) => note)?.note
    return firstNonEmptyNote
  }

  // Some hand-crafted strategies to get the maximum possible matches in select form fields.
  const isFirstEvidenceSubstringOfOption = (option) => option.value.toLowerCase().includes(firstEvidence?.toLowerCase())
  const isFirstEvidenceInAdmissibleEvidencesOfOption = (option) => option.admissible_evidences.includes(firstEvidence?.toLowerCase())
  const isFirstEvidenceInAdmissibleEvidencesOfVariable = (variable) => variable.admissible_evidences.includes(firstEvidence?.toLowerCase())
  const isFirstEvidenceStartingWithFirstLetterOfOption = (option) => firstEvidence?.toLowerCase().startsWith(option.value[0])
  const shouldMatch = (option) => isFirstEvidenceSubstringOfOption(option)
    || isFirstEvidenceInAdmissibleEvidencesOfOption(option)
    || isFirstEvidenceInAdmissibleEvidencesOfVariable(option)
    || isFirstEvidenceStartingWithFirstLetterOfOption(option)

  // Should return a string.
  if (isSingleSelect) {
    let matchedOption
    if (isDiagnosticoPrincipal) {
      const firstAnnotationForDiagnosticoPrincipal = annotations.find(annotation => entitiesForDiagnosticoPrincipal.includes(annotation.entity))
      const shouldMatchEntityWithOption = (option) => option.value.toLowerCase().startsWith(firstAnnotationForDiagnosticoPrincipal?.entity.toLowerCase().split('_')[0])
      matchedOption = variable.options.find(option => shouldMatchEntityWithOption(option))?.value
      return matchedOption
    }
    matchedOption = variable.options.find(option => shouldMatch(option))?.value
    return matchedOption
  }

  // Should return an array of strings.
  if (isMultiSelect) {

    // For each annotation, map to the value of the first matched option.
    const matchedOptions = annotations
      .map(({ evidence }) => variable.options
        .find(({ value, comment }) => value
          .concat(' ', comment).toLowerCase()
          .includes(evidence?.toLowerCase())
        )?.value
      )

    // Remove duplicates, undefined and null values.
    const uniqueMatchedOptions = [...new Set(matchedOptions.filter(option => option))]
    return uniqueMatchedOptions
  }
}

module.exports = {
  autofillField,
}