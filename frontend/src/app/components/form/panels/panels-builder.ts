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
        const field = getField(variable, annotations, allAnnotations)
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
  const MAXIMUM_FIELDS_PER_ROW = 2
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

          // Custom property.
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
        fieldGroup: fields
      }
    ]
  }
  const fieldsOfGroup = group.fieldGroup[1]

  // Avoid displaying too many fields per row.
  if (fields.length > MAXIMUM_FIELDS_PER_ROW) {
    fieldsOfGroup.templateOptions.fxLayout = 'row wrap'
  }

  // Force groups of Diagnostico section to occupy all the available space in the row.
  if (groupNamesForDiagnosticoSection.includes(groupName)) {
    fieldsOfGroup.templateOptions.fxFlex = '100%'
  }

  return group
}

/**
 * Build the form field with all needed attributes, considering some special cases.
 */
function getField(variable: Variable, annotations: Annotation[], allAnnotations: Annotation[],): FormlyFieldConfig {

  // Match non-specific annotations (FECHA, HORA, Tratamiento_antiagregante, Tratamiento_anticoagulate, mRankin, NIHSS).
  // Example:
  //   variable.entity = Tratamiento_antiagregante_hab (specific)
  //   annotation.entity = Tratamiento_antiagregante (non-specific)
  const isFecha = variable.entity.toUpperCase().startsWith('FECHA')
  const isHora = variable.entity.toUpperCase().startsWith('HORA')
  let hints: Annotation[]
  if (isFecha) {
    hints = allAnnotations.filter(({ entity }) => entity.toUpperCase().startsWith('FECHA'))
  }
  else if (isHora) {
    hints = allAnnotations.filter(({ entity }) => entity.toUpperCase().startsWith('HORA'))
  }
  else {
    hints = allAnnotations.filter(({ entity }) => variable.entity.startsWith(entity))
  }
  const hintTitleSuffix = hints.length === 1 ? 'pista' : 'pistas'
  const evidenceTitleSuffix = annotations.length === 1 ? 'evidencia textual' : 'evidencias textuales'
  const hintTooltip = [`${hints.length} ${hintTitleSuffix}`].concat(hints.map(a => a.evidence)).join('\n')
  const evidenceTooltip = [`${annotations.length} ${evidenceTitleSuffix}`].concat(annotations.map(a => a.evidence)).join('\n')

  // Add `label` key to options object.
  const options = variable.options.map(o => ({ ...o, label: o.value }))
  const field: FormlyFieldConfig = {
    key: variable.key,
    type: variable.field_type,
    templateOptions: {
      type: variable.input_type,
      appearance: 'outline',
      label: variable.label,
      multiple: variable.cardinality === 'n',
      options: options,

      // Custom properties.
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

  // Special cases.
  const isDiagnosticoPrincipal = variable.entity === 'Diagnostico_principal'
  const isArteriaAfectada = variable.entity === 'Arteria_afectada'
  const isLocalizacion = variable.entity === 'Localizacion'
  const isEtiologia = variable.entity === 'Etiologia'
  const isTratamiento = variable.entity.startsWith('Tratamiento')

  // Append commercial names to Tratameinto_* fields.
  if (isTratamiento) {
    field.templateOptions.options = options.map(({ value, comment, label }) =>
      ({ value: value, label: comment ? `${label} (${comment})` : label })
    )
  }

  // Sort alphabetically the options of some fields.
  if (isEtiologia || isTratamiento) {
    (field.templateOptions.options as any[]).sort((a, b) => a.value?.localeCompare(b.value))
  }

  return field
}
