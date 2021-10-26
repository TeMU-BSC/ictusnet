const {
  ENTITIES_FOR_DIAGNOSTICO_PRINCIPAL,
  LateralizacionAdmissibleEvidencesObj,
} = require("../constants");

/**
 * Define the rules for matching entities,
 * prioritizing the entities for the special case `Diagnostico_principal`,
 * matching regularly exact coincidences between variable and annotation entities, and
 * matching as last resort the non-specific entities like `Tratamiento_anticoagulante` (without `_alta` or `_hab` suffixes).
 */
const filterCondition = (variable, annotation) => {
  if (variable.entity === "Diagnostico_principal") {
    return ENTITIES_FOR_DIAGNOSTICO_PRINCIPAL.includes(annotation.entity);
  } else if (variable.entity === annotation.entity) {
    return variable.entity === annotation.entity;
  } else {
    return variable.entity.includes(annotation.entity);
  }
};

/**
 * Return the according annotations for the given variable.
 */
const filterAnnotationsForVariable = (variable, annotations) => {
  return annotations.filter((annotation) =>
    filterCondition(variable, annotation)
  );
};

/**
 * Search for a suitable value (string) or values (array of strings) to autofill the form field for the given variable.
 */
const autofillField = (variable, reportAnnotations) => {
  const annotations = filterAnnotationsForVariable(variable, reportAnnotations);
  const firstEvidence = annotations.find(() => true)?.evidence;

  const isDiagnosticoPrincipal = variable.entity === "Diagnostico_principal"; // 'ictus isquémico', 'ataque isquémico transitorio', 'hemorragia cerebral'

  const isInput = variable.field_type === "input"; // fecha_*, hora_*, tiempo_puerta_puncion, aspects, mrankin_*, nihss_*
  const isSelect = variable.field_type === "select";
  const isSingle = variable.cardinality === "1";
  const isMulti = variable.cardinality === "n";
  const isSingleSelect = isSelect && isSingle; // diagnostico_principal, lateralizacion, etiologia
  const isMultiSelect = isSelect && isMulti; // arterias_afectadas, localizacion, tratamiento_*

  // Return the normalized value present in annotation's note.
  if (isInput) {
    const firstNonEmptyNote = annotations.find(({ note }) => note)?.note;
    return firstNonEmptyNote;
  }

  const getKeyByValue = (object, value) =>
    Object.keys(object).find((key) =>
      object[key].includes(value.toLowerCase())
    );
  // Some hand-crafted strategies to get the maximum possible matches in select form fields.
  const isFirstEvidenceSubstringOfOption = (option) =>
    option.value.toLowerCase().includes(firstEvidence?.toLowerCase());
  const isOptionSubstringOfFirstEvidence = (option) =>
    firstEvidence?.toLowerCase().includes(option.value.toLowerCase());
  const isFirstEvidenceInAdmissibleEvidencesOfOption = (option) =>
    option.admissible_evidences.includes(firstEvidence?.toLowerCase());
  const isFirstEvidenceInAdmissibleEvidencesOfVariable = () =>
    variable.admissible_evidences.includes(firstEvidence?.toLowerCase());
  const isFirstEvidenceStartingWithFirstLetterOfOption = (option) =>
    firstEvidence?.toLowerCase().startsWith(option.value[0]);
  const shouldMatch = (option) =>
    isFirstEvidenceSubstringOfOption(option) ||
    isOptionSubstringOfFirstEvidence(option) ||
    isFirstEvidenceInAdmissibleEvidencesOfOption(option) ||
    isFirstEvidenceInAdmissibleEvidencesOfVariable() ||
    isFirstEvidenceStartingWithFirstLetterOfOption(option);

  // Should return a string.
  if (isSingleSelect) {
    let matchedOption;
    if (isDiagnosticoPrincipal) {
      const firstAnnotationForDiagnosticoPrincipal = annotations.find(
        (annotation) =>
          ENTITIES_FOR_DIAGNOSTICO_PRINCIPAL.includes(annotation.entity)
      );
      const shouldMatchEntityWithOption = (option) =>
        option.value
          .toLowerCase()
          .startsWith(
            firstAnnotationForDiagnosticoPrincipal?.entity
              .toLowerCase()
              .split("_")[0]
          );
      matchedOption = variable.options.find((option) =>
        shouldMatchEntityWithOption(option)
      )?.value;
      return matchedOption;
    }

    if (isLateralizacion) {
      let matched;
      lateralizationEntity = reportAnnotations.find(
        (annotation) => annotation.entity === "Lateralizacion"
      );

      if (lateralizationEntity) {
        matched = getKeyByValue(
          LateralizacionAdmissibleEvidencesObj,
          lateralizationEntity.evidence
        );
      }

      if (!matched) {
        matched = "indeterminada";
      }

      return matched;
    }
    matchedOption = variable.options.find((option) =>
      shouldMatch(option)
    )?.value;
    return matchedOption;
  }

  // Should return an array of strings.
  if (isMultiSelect) {
    // For each annotation, map to the value of the first matched option.
    const matchedOptions = annotations.map(
      ({ evidence }) =>
        variable.options.find(({ value, comment }) =>
          value
            .concat(" ", comment)
            .toLowerCase()
            .includes(evidence?.toLowerCase())
        )?.value
    );

    // Remove duplicates, undefined and null values.
    const uniqueMatchedOptions = [
      ...new Set(matchedOptions.filter((option) => option)),
    ];
    return uniqueMatchedOptions;
  }
};

module.exports = {
  autofillField,
};
