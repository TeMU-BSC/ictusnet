import { FormlyFieldConfig } from "@ngx-formly/core"
import {
  panelIcons,
  nonSpecificEntities,
  groupNamesForDiagnosticoSection,
  entitiesForDiagnosticoPrincipal,
} from "src/app/constants/constants"
import { Annotation, Variable } from "src/app/interfaces/interfaces"
import { highlight } from "src/styles/markjs"

export interface PanelType {
  icon?: string
  title?: string
  groups?: FormlyFieldConfig[]
}

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
 * Build the material expansible panels, that act as a form, in 3 steps:
 *   1st. Build each form field.
 *   2nd. Build each group of form fields.
 *   3rd. Build each panel, which contains grouped fields.
 *   4th. Gather all the panels.
 *
 * Return an array of panels.
 */
export function getPanels(variables: Variable[], allAnnotations: Annotation[]): PanelType[] {
  const panels: PanelType[] = []
  new Set(variables.map(v => v.section)).forEach(sectionName => {
    const sectionVariables = variables.filter(v => v.section === sectionName)
    const groups: FormlyFieldConfig[] = []
    new Set(sectionVariables.map(v => v.group)).forEach(groupName => {
      const groupVariables = variables.filter(v => v.group === groupName)
      const fields: FormlyFieldConfig[] = []
      groupVariables.filter(v => v.group === groupName).forEach(variable => {
        const annotations = filterAnnotationsForVariable(variable, allAnnotations)
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

function getPanel(sectionName: string, groups: FormlyFieldConfig[]): PanelType {
  const panel: PanelType = {
    icon: panelIcons[sectionName],
    title: sectionName,
    groups: groups,
  }
  return panel
}

function getGroup(groupName: string, fields: FormlyFieldConfig[], allAnnotations: Annotation[]): FormlyFieldConfig {
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
  if (groupNamesForDiagnosticoSection.includes(groupName)) {
    group.fieldGroup[1].templateOptions.fxFlex = '100%'
  }

  // populate the group with the actual fields
  group.fieldGroup[1].fieldGroup.push(...fields)

  return group
}

/**
 * Build the form field with all needed attributes, considering some special cases.
 */
function getField(variable: Variable, annotations: Annotation[],
  allVariables: Variable[], allAnnotations: Annotation[]): FormlyFieldConfig {

  const options = variable.options.map(o => ({ ...o, label: o.value }))

  // locate FECHA and HORA unspecific variables
  const hints = allAnnotations.filter(a => a.entity.toUpperCase().startsWith(variable.label.toUpperCase()))
  const hintTitleSuffix = hints.length === 1 ? 'pista' : 'pistas'
  const hintTooltip = [`${hints.length} ${hintTitleSuffix}`].concat(hints.map(a => a.evidence)).join('\n')
  const evidenceTitleSuffix = annotations.length === 1 ? 'evidencia textual' : 'evidencias textuales'
  const evidenceTooltip = [`${annotations.length} ${evidenceTitleSuffix}`].concat(annotations.map(a => a.evidence)).join('\n')

  const field: FormlyFieldConfig = {
    key: variable.key,
    type: variable.field_type,
    templateOptions: {
      type: variable.input_type,
      appearance: 'outline',
      label: variable.label,
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
