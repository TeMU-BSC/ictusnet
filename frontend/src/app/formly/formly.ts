import { FormlyFieldConfig } from "@ngx-formly/core"

import {
  panelIcons,
  nonSpecificEntities,
  diagnosticoSectionGroupNames,
  diagnosticoPrincipalEntities,
  admissibleEvidences,
} from "../constants/constants"
import { highlight } from "src/styles/markjs"
import { Annotation, Variable } from "../models/models"

export interface PanelType {
  icon?: string
  title?: string
  groups?: FormlyFieldConfig[]
}

export function getPanels(variables: Variable[], allAnnotations: Annotation[]): PanelType[] {
  const panels: PanelType[] = []
  new Set(variables.map(v => v.section)).forEach(sectionName => {
    const sectionVariables = variables.filter(v => v.section === sectionName)
    const groups: FormlyFieldConfig[] = []
    new Set(sectionVariables.map(v => v.group)).forEach(groupName => {
      const groupVariables = variables.filter(v => v.group === groupName)
      const fields: FormlyFieldConfig[] = []
      groupVariables.filter(v => v.group === groupName).forEach(variable => {
        const annotations = getVariableAnnotations(variable, allAnnotations)
        const field = getField(variable, annotations, variables, allAnnotations)
        fields.push(field)
      })
      const group = getGroup(groupName, fields, allAnnotations)
      groups.push(group)
    })
    const panel = getPanel(sectionName, groups)
    panels.push(panel)
  })
  return panels
}

export function getPanel(sectionName: string, groups: FormlyFieldConfig[]): PanelType {
  const panel: PanelType = {
    icon: panelIcons[sectionName],
    title: sectionName,
    groups: groups,
  }
  return panel
}

export function getGroup(groupName: string, fields: FormlyFieldConfig[], allAnnotations: Annotation[]): FormlyFieldConfig {
  const auxiliaryHints = allAnnotations.filter(a => a.entity.startsWith(nonSpecificEntities[groupName]))
  const shouldHide = auxiliaryHints.length === 0
  const suffix = auxiliaryHints.length === 1 ? 'pista auxiliar' : 'pistas auxiliares'
  const tooltip = [`${auxiliaryHints.length} ${suffix}`].concat(auxiliaryHints.map(a => a.evidence)).join('\n')
  const group: FormlyFieldConfig = {
    type: 'flex-layout',
    templateOptions: {
      fxLayout: 'column',
    },
    fieldGroup: [

      // Group title: group.fieldGroup[0]
      {
        type: 'flex-layout',
        templateOptions: {
          fxLayout: 'row wrap',
          fxLayoutXs: 'row',
          fxLayoutAlign: 'start end',
          fxLayoutGap: '1rem',

          // custom property
          auxiliaryHintButton: shouldHide ? null : {
            icon: 'emoji_objects',
            tooltip: tooltip,
            onClick: () => highlight(auxiliaryHints, 'auxiliar'),
          },
        },
        fieldGroup: [
          {
            template: `<span class="group-title">${groupName}</span>`,
          }
        ]
      },

      // Group form fields: group.fieldGroup[1]
      {
        type: 'flex-layout',
        templateOptions: {
          fxLayout: 'row',
          fxLayoutXs: 'column',
          fxLayoutGap: '1rem',
          fxFlex: '45%',
        },

        // Populated below
        fieldGroup: []
      }
    ]
  }

  // row wrap layout when more than two fields per group (avoiding too many fields per line)
  if (fields.length > 2) {
    group.fieldGroup[1].templateOptions.fxLayout = 'row wrap'
  }

  // special cases
  if (diagnosticoSectionGroupNames.includes(groupName)) {
    group.fieldGroup[1].templateOptions.fxFlex = '100%'
  }

  // populate the group with the actual fields
  group.fieldGroup[1].fieldGroup.push(...fields)

  return group
}

/**
 * Build the form field with all needed attributes, considering some special cases.
 */
export function getField(variable: Variable, annotations: Annotation[],
  allVariables: Variable[], allAnnotations: Annotation[]): FormlyFieldConfig {

  const options = variable.options.map(o => ({ ...o, label: o.value }))

  // Locate FECHA and HORA unspecific variables
  const hints = allAnnotations.filter(a => a.entity.toUpperCase().startsWith(variable.shortLabel.toUpperCase()))
  const hintTitleSuffix = hints.length === 1 ? 'pista' : 'pistas'
  const hintTooltip = [`${hints.length} ${hintTitleSuffix}`].concat(hints.map(a => a.evidence)).join('\n')
  const evidenceTitleSuffix = annotations.length === 1 ? 'evidencia textual' : 'evidencias textuales'
  const evidenceTooltip = [`${annotations.length} ${evidenceTitleSuffix}`].concat(annotations.map(a => a.evidence)).join('\n')

  const field: FormlyFieldConfig = {
    key: variable.key,
    type: variable.fieldType,
    templateOptions: {
      type: variable.inputType,
      appearance: 'outline',
      label: variable.shortLabel,
      multiple: variable.cardinality === 'n',
      options: options,

      // custom properties
      hints: hints,
      annotations: annotations,
      addonRight: {
        infoIcon: {
          icon: 'info',
          color: 'primary',
          tooltip: variable.info,
          hidden: variable.info === '',
        },
        hintButton: {
          icon: 'gps_not_fixed',
          color: 'primary',
          tooltip: hintTooltip,
          hidden: hints.length === 0 || annotations.length > 0,
          onClick: (to, addon, event) => highlight(to.hints, 'hint'),
        },
        evidenceButton: {
          icon: 'gps_fixed',
          color: 'accent',
          tooltip: evidenceTooltip,
          hidden: annotations.length === 0,
          onClick: (to, addon, event) => highlight(to.annotations, 'evidence'),
        },
      },
    },
  }

  // special cases
  const isDiagnosticoPrincipal = variable.entity === 'Diagnostico_principal'
  const isEtiologia = variable.entity === 'Etiologia'
  const isArteriaAfectada = variable.entity === 'Arteria_afectada'
  const isTratamiento = variable.entity.startsWith('Tratamiento')

  // const containsIsquemico = (object) => object.model.diagnosticoPrincipal.includes('isquémico')
  // const containsHemorragia = (object) => object.model.diagnosticoPrincipal.includes('hemorragia')
  // const getFilteredOptions = (entity: string, criteria: string) => {
  //   return allVariables
  //     .find(v => v.entity === entity).options
  //     .filter(o => o.comment === criteria)
  //     .map(o => ({ ...o, label: o.value }))
  // }

  // // listen to disgnostico field's changes to dynamically toggle etiologia's available options
  // if (isDiagnosticoPrincipal) {
  //   field.templateOptions.change = (changedField) => {
  //     let criteria: string
  //     if (containsIsquemico(changedField)) criteria = 'isquémico'
  //     if (containsHemorragia(changedField)) criteria = 'hemorragia'
  //     const etiologiaField = this.panels[1].groups[4].fieldGroup[1].fieldGroup[0]
  //     etiologiaField.templateOptions.options = getFilteredOptions('Etiologia', criteria)
  //     this.model.etiologia = ''
  //   }
  // }

  // disable arteria afectada field if diagnostico principal is other than 'ictus isquémico'
  if (isArteriaAfectada) {
    // field.expressionProperties = { 'templateOptions.disabled': 'this.model.diagnosticoPrincipal !== "ictus isquémico"' }
  }

  // set initial available options of etiologia depending on the initial autofilled value of diagnostico principal
  if (isEtiologia) {
    // let criteria: string
    // if (containsIsquemico(this)) criteria = 'isquémico'
    // if (containsHemorragia(this)) criteria = 'hemorragia'
    // field.templateOptions.options = getFilteredOptions('Etiologia', criteria)
  }

  // append the comment of tratameinto fields that have commercial name
  if (isTratamiento) {
    field.templateOptions.options = variable.options.map(o => o.comment ?
      ({ value: o.value, label: `${o.value} (${o.comment})` }) :
      ({ value: o.value, label: o.value }))
  }

  // sort alphabetically the options of some fields
  const sortOptions = () => (field.templateOptions.options as any[]).sort((a, b) => a.value?.localeCompare(b.value))
  if (isEtiologia || isTratamiento) {
    sortOptions()
  }

  return field
}

/**
 * Return the according annotations for the given variable, taking into accound some special cases.
 */
export function getVariableAnnotations(variable: Variable, allAnnotations: Annotation[]): Annotation[] {
  if (variable.entity === 'Diagnostico_principal') {
    return allAnnotations.filter(a => diagnosticoPrincipalEntities.includes(a.entity))
  }
  return allAnnotations.filter(a => variable.entity === a.entity)
}

/**
 * Search for a suitable value (or values) to autofill a formly field.
 */
export function autofill(variable: Variable, annotations: Annotation[]): string | string[] {
  const isInput = variable.fieldType === 'input'
  const isSelect = variable.fieldType === 'select'
  const isSingle = variable.cardinality === '1'
  const isMulti = variable.cardinality === 'n'
  const isSingleSelect = isSelect && isSingle
  const isMultiSelect = isSelect && isMulti

  // 'input' is the most common field type in the form: horas, fechas
  if (isInput) {
    const firstFoundAnnotation = annotations.find(a => a.note)
    const normalizedValue = firstFoundAnnotation?.note
    const evidence = firstFoundAnnotation?.evidence
    return normalizedValue || evidence
  }

  // single-option select needs some rule-based criteria to be autofilled
  if (isSingleSelect) {

    // check special field
    if (variable.entity === 'Diagnostico_principal') {
      const annotation = annotations.find(a => diagnosticoPrincipalEntities.includes(a.entity))
      return variable.options.find(o => o.value.toLowerCase().startsWith(annotation?.entity.toLowerCase().split('_')[0]))?.value
    }

    // rest of the fields: lateralizacion, etiologia
    return variable.options.find(o =>

      // 1. if that includes the first evidence as a substring
      o.value.toLowerCase().includes(annotations[0]?.evidence.toLowerCase())

      // 2. or if any of the predefined admissible values includes the first evidence
      || admissibleEvidences[variable.key][o.value]?.includes(annotations[0]?.evidence)

      // 3. or if evidence starts with the first letter of that option
      || annotations[0]?.evidence.toLowerCase().startsWith(o.value.toLowerCase()[0])
    )?.value
  }

  // multiple-option select needs array of strings
  if (isMultiSelect) {
    const data: string[] = annotations
      .map(a => variable.options
        .find(o => o.value.toLowerCase()
          .concat(' ', o.comment)
          .includes(a?.evidence.toLowerCase())
        )?.value
      )
    return [...new Set(data)]
  }
}
