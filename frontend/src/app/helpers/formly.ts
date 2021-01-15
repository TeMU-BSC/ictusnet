import { FormlyFieldConfig } from "@ngx-formly/core"
import { panelIcons, unspecifiedEntities, specialGroupNames, diagnosticoPrincipalEntities, admissibleEvidences } from "../constants/constants"
import { Annotation, Variable } from "../interfaces/interfaces"
import Mark from 'mark.js'

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
        const field = getField(variable, annotations, variables)
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
  const hints = allAnnotations.filter(a => a.entity.startsWith(unspecifiedEntities[groupName]))
  const tooltipText = hints.length === 1 ?
    [`Se ha encontrado ${hints.length} pista:`].concat(hints.map(a => a.evidence)).join('\n') :
    [`Se han encontrado ${hints.length} pistas:`].concat(hints.map(a => a.evidence)).join('\n')
  const group: FormlyFieldConfig = {
    type: 'flex-layout',
    templateOptions: {
      fxLayout: 'column',
    },
    fieldGroup: [
      {
        type: 'flex-layout',
        templateOptions: {
          fxLayout: 'row wrap',
          fxLayoutAlign: 'space-between',
          fxLayoutGap: '1rem',
          hint: hints.length > 0 ? {
            icon: 'emoji_objects',
            tooltip: tooltipText,
            tooltipClass: 'multiline-tooltip',
            action: () => highlight(hints, 'context', 'unspecified'),
          } : null,
        },
        fieldGroup: [
          {
            template: `<h3 class="group-title">${groupName}</h3>`,
          }
        ]
      },
      {
        type: 'flex-layout',
        templateOptions: {
          fxLayout: 'row',
          fxLayoutGap: '1rem',
          fxFlex: '45%',
        },
        fieldGroup: []
      }
    ]
  }

  // row wrap layout when more than two fields per group
  if (fields.length > 2) {
    group.fieldGroup[1].templateOptions.fxLayout = 'row wrap'
  }

  // special cases
  if (specialGroupNames.includes(groupName)) {
    group.fieldGroup[1].templateOptions.fxFlex = '90%'
  }

  // populate the group with the actual fields
  group.fieldGroup[1].fieldGroup.push(...fields)

  return group
}

/**
 * Build the form field with all needed attributes, considering some special cases.
 */
export function getField(variable: Variable, annotations: Annotation[], allVariables: Variable[]): FormlyFieldConfig {

  // prepare options for select fields
  let options = variable.options.map(o => ({ ...o, label: o.value }))

  // build the formly field
  const field: FormlyFieldConfig = {
    key: variable.key,
    type: variable.fieldType,
    templateOptions: {
      type: variable.inputType,
      appearance: 'outline',
      label: variable.shortLabel,
      multiple: variable.cardinality === 'n',
      options: options,
      focus: (field, event) => highlight(field.templateOptions.annotations, 'context', 'accent'),

      // custom properties
      annotations: annotations,
      addonRight: {
        info: variable.info ? {
          icon: 'info',
          color: 'primary',
          tooltip: variable.info,
        } : null,
        evidenceButton: annotations.length > 0 ? {
          icon: 'gps_fixed',
          color: 'accent',
          tooltip: annotations.map(a => a.evidence).join('\n'),
          tooltipClass: 'multiline-tooltip',
          onClick: (to, addon, event) => highlight(to.annotations, 'context', 'accent'),
        } : null,
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
    const data: string[] = annotations.map(a => variable.options.find(o => o.value.toLowerCase().concat(' ', o.comment).includes(a?.evidence.toLowerCase()))?.value)
    return [...new Set(data)]
  }
}

/**
* Highlight, in the text with class `className`, the offsets present in the given annotations.
* Note: Requires an HTML element with the given `className` to exist.
*
* https://markjs.io/#markranges
* https://jsfiddle.net/julmot/hexomvbL/
* https://github.com/iamdustan/smoothscroll/issues/47#issuecomment-350810238
* https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle
*
*/
export function highlight(annotations: Annotation[], className: string, color: string): void {
  const instance = new Mark(`.${className}`)
  const ranges = annotations.map(a => ({ start: a.offset.start, length: a.offset.end - a.offset.start }))
  const options = {
    each: (element: HTMLElement) => setTimeout(() => element.classList.add('animate', color), 250),
    done: (numberOfMatches: number) => {
      if (numberOfMatches) {
        let item = document.getElementsByTagName('mark')[0]  // what we want to scroll to
        let wrapper = document.getElementById('wrapper')  // the wrapper we will scroll inside
        const lineHeightPixels: number = Number(window.getComputedStyle(wrapper).getPropertyValue('line-height').replace('px', ''))
        let count = item.offsetTop - wrapper.scrollTop - lineHeightPixels * 10  // any extra distance from top
        wrapper.scrollBy({ top: count, left: 0, behavior: 'smooth' })
      }
    }
  }
  instance.unmark({
    done: () => instance.markRanges(ranges, options)
  })
}
