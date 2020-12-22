import { Component, OnChanges, ViewChild, Input } from '@angular/core'
import { FormArray, FormGroup } from '@angular/forms'
import { MatAccordion } from '@angular/material/expansion'

import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core'

import { Papa } from 'ngx-papaparse'
import Mark from 'mark.js'

import { ParsingService } from 'src/app/services/parsing.service'
import { Annotation, Variable } from 'src/app/interfaces/interfaces'
import { downloadObjectAsJson } from 'src/app/helpers/helpers'
import { panelIcons, unspecifiedEntities, admissibleEvidences, diagnosticoPrincipalEntities } from 'src/app/constants/constants'
import { MatDialog } from '@angular/material/dialog'
import { DialogComponent } from '../dialog/dialog.component'


// TODO https://js.devexpress.com/Demos/WidgetsGallery/Demo/ContextMenu/Basics/Angular/Light/


export interface PanelType {
  icon?: string
  title?: string
  groups?: FormlyFieldConfig[]
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FieldComponent implements OnChanges {

  @Input() fileId: string  // development
  @Input() file: File  // production
  text: string
  loading: boolean = true;
  variables: Variable[]
  annotations: Annotation[]
  focusedField: any
  downloadFilename: string

  // formly
  model: any = {};
  panels: PanelType[] = [];
  form: FormArray = new FormArray(this.panels.map(() => new FormGroup({})));
  options = this.panels.map(() => <FormlyFormOptions>{});

  // expansion panel
  @ViewChild(MatAccordion) accordion: MatAccordion
  step: number = 0;  // default open panel
  setStep(index: number) { this.step = index }
  nextStep() { this.step++ }
  prevStep() { this.step-- }

  constructor(
    private papa: Papa,
    private parser: ParsingService,
    public dialog: MatDialog,
  ) { }

  ngOnChanges(): void {
    this.loadForm(this.fileId)
    document.getElementById('wrapper').scrollTop = 0
  }

  /**
   * Load the form with the given text file.
   */
  loadForm(fileId: string) {
    this.loading = true
    this.text = ''
    this.model = {}
    this.panels = []

    // TODO replace demo path and fileIds for real uploaded files
    const path: string = 'assets/alejandro_sample/10'
    this.downloadFilename = `${fileId}.json`
    this.parser.getTextFromFile(`${path}/${fileId}.utf8.txt`).subscribe(data => this.text = data)
    this.parser.getAnnotationsFromFile(`${path}/${fileId}.utf8.ann`).subscribe(data => {
      this.annotations = data
      const allAnnotations = this.annotations
      this.papa.parse(`assets/variables.tsv`, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: parsedVariables => {
          this.variables = parsedVariables.data
          const variables = this.variables
          this.papa.parse('assets/options.tsv', {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: parsedOptions => {
              const options: any[] = parsedOptions.data
              variables.forEach(variable => {
                variable.options = options.filter(a => variable.entity.startsWith(a.entity)).map(a => ({ value: a.value, comment: a.comment }))
                const annotations = this.getVariableAnnotations(variable, allAnnotations)
                this.model = { ...this.model, [variable.key]: this.autofill(variable, annotations) }
              })
              this.panels = [...this.panels, ...this.getPanels(variables, allAnnotations)]
              this.loading = false
            }
          })
        }
      })
    })
  }

  getPanels(variables: Variable[], allAnnotations: Annotation[]): PanelType[] {
    const panels: PanelType[] = []
    new Set(variables.map(v => v.section)).forEach(sectionName => {
      const sectionVariables = variables.filter(v => v.section === sectionName)
      const groups: FormlyFieldConfig[] = []
      new Set(sectionVariables.map(v => v.group)).forEach(groupName => {
        const groupVariables = variables.filter(v => v.group === groupName)
        const fields: FormlyFieldConfig[] = []
        groupVariables.filter(v => v.group === groupName).forEach(variable => {
          const annotations = this.getVariableAnnotations(variable, allAnnotations)
          const field = this.getField(variable, annotations)
          fields.push(field)
        })
        const group = this.getGroup(groupName, fields)
        groups.push(group)
      })
      const panel = this.getPanel(sectionName, groups)
      panels.push(panel)
    })
    return panels
  }

  getPanel(sectionName: string, groups: FormlyFieldConfig[]): PanelType {
    const panel: PanelType = {
      icon: panelIcons[sectionName],
      title: sectionName,
      groups: groups,
    }
    return panel
  }

  getGroup(groupName: string, fields: FormlyFieldConfig[]): FormlyFieldConfig {
    const unespecifiedAnnotations = this.annotations.filter(a => a.entity.startsWith(unspecifiedEntities[groupName]))
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
            fxLayoutAlign: 'start center',
            fxLayoutGap: '1rem',
            lantern: unespecifiedAnnotations.length > 0 ? {
              icon: 'highlight',
              tooltip: ['Evidencias auxiliares:'].concat(unespecifiedAnnotations.map(a => a.evidence)).join('\n'),
              tooltipClass: 'multiline-tooltip',
              action: () => this.highlight(unespecifiedAnnotations, 'context', 'unspecified'),
            } : null,
          },
          fieldGroup: [
            {
              template: `<p class="group-title">${groupName}</p>`,
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
    if ([
      'Diagnóstico principal',
      'Arterias afectadas',
      'Localizaciones',
      'Lateralización',
      'Etiología',
    ].includes(groupName)) {
      group.fieldGroup[1].templateOptions.fxFlex = '90%'
    }

    // populate the group with the actual fields
    group.fieldGroup[1].fieldGroup.push(...fields)

    return group
  }

  /**
   * Build the form field with all needed attributes, considering some special cases.
   */
  getField(variable: Variable, annotations: Annotation[]): FormlyFieldConfig {

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
        focus: (field, event) => this.highlight(field.templateOptions.annotations, 'context', 'attention'),

        // custom properties
        annotations: annotations,
        addonRight: {
          info: variable.info ? {
            icon: 'info',
            color: 'primary',
            tooltip: variable.info,
          } : null,
          locate: annotations.length > 0 ? {
            icon: 'search',
            color: 'attention',
            tooltip: annotations.map(a => a.evidence).join('\n'),
            tooltipClass: 'multiline-tooltip',
            onClick: (to, addon, event) => this.highlight(to.annotations, 'context', 'attention'),
          } : null,
        },
      },
    }

    // special cases
    const isDiagnosticoPrincipal = variable.entity === 'Diagnostico_principal'
    const isEtiologia = variable.entity === 'Etiologia'
    const isArteriaAfectada = variable.entity === 'Arteria_afectada'
    const isTratamiento = variable.entity.startsWith('Tratamiento')

    const containsIsquemico = (object) => object.model.diagnosticoPrincipal.includes('isquémico')
    const containsHemorragia = (object) => object.model.diagnosticoPrincipal.includes('hemorragia')
    const getFilteredOptions = (entity: string, criteria: string) => this.variables.find(v => v.entity === entity).options.filter(o => o.comment === criteria).map(o => ({ ...o, label: o.value }))

    // listen to disgnostico field's changes to dynamically toggle etiologia's available options
    if (isDiagnosticoPrincipal) {
      field.templateOptions.change = (changedField) => {
        let criteria: string
        if (containsIsquemico(changedField)) criteria = 'isquémico'
        if (containsHemorragia(changedField)) criteria = 'hemorragia'
        const etiologiaField = this.panels[1].groups[4].fieldGroup[1].fieldGroup[0]
        etiologiaField.templateOptions.options = getFilteredOptions('Etiologia', criteria)
        this.model.etiologia = ''
      }
    }

    // disable arteria afectada field if diagnostico principal is other than 'ictus isquémico'
    if (isArteriaAfectada) {
      // field.expressionProperties = { 'templateOptions.disabled': 'model.diagnosticoPrincipal !== "ictus isquémico"' };
    }

    // set initial available options of etiologia depending on the initial autofilled value of diagnostico principal
    if (isEtiologia) {
      let criteria: string
      if (containsIsquemico(this)) criteria = 'isquémico'
      if (containsHemorragia(this)) criteria = 'hemorragia'
      field.templateOptions.options = getFilteredOptions('Etiologia', criteria)
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
  getVariableAnnotations(variable: Variable, allAnnotations: Annotation[]): Annotation[] {
    if (variable.entity === 'Diagnostico_principal') {
      return allAnnotations.filter(a => diagnosticoPrincipalEntities.includes(a.entity))
    }
    return allAnnotations.filter(a => variable.entity === a.entity)
  }

  /**
   * Search for a suitable value (or values) to autofill a formly field.
   */
  autofill(variable: Variable, annotations: Annotation[]): string | string[] {
    const isInput = variable.fieldType === 'input'
    const isSelect = variable.fieldType === 'select'
    const isSingle = variable.cardinality === '1'
    const isMulti = variable.cardinality === 'n'
    const isSingleSelect = isSelect && isSingle
    const isMultiSelect = isSelect && isMulti

    // 'input' is the most common field type in the form: horas, fechas
    if (isInput) {
      const firstFoundAnnotation = annotations.find(a => a.notes)
      const normalizedValue = firstFoundAnnotation?.notes
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
  highlight(annotations: Annotation[], className: string, color: string): void {
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

  /**
   * Update the value of a specified field (the picked field) with an evidence in text.
   *
   * @deprecated Not used anymore because there is no need to manually fill a field selecting an evidence in text.
   */
  updateEvidence() {
    const selection = window.getSelection()
    const evidence = selection.toString()
    const range = selection.getRangeAt(0)
    const start = range.startOffset
    const end = range.endOffset
    if (evidence) {
      this.model = { ...this.model, [this.focusedField]: evidence }
      this.focusedField = null
    }
  }

  /**
   * Open a confirmation dialog before reseting the form.
   */
  confirmReset(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        title: 'Restablecer formulario',
        content: '¿Quieres volver al estado inicial de este formulario? Perderás los cambios que has realizado sobre este documento.',
        cancelButton: 'Atrás',
        acceptButton: 'Restablecer',
        buttonColor: 'warn',
      }
    })
    dialogRef.afterClosed().subscribe(confirmation => {
      if (confirmation) {
        this.ngOnChanges()
      }
    })
  }

  /**
   * Download the form completed so far in the given format.
   *
   * Accepted formats:
   *  - json
   */
  download(format: string) {
    if (format === 'json') {
      downloadObjectAsJson(this.model, this.downloadFilename)
    }
  }

}
