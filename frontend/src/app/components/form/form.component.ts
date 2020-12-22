import { Component, OnChanges, ViewChild, Input } from '@angular/core'
import { FormArray, FormGroup } from '@angular/forms'
import { MatAccordion } from '@angular/material/expansion'

import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core'

import { Papa } from 'ngx-papaparse'

import { Report, Variable } from 'src/app/interfaces/interfaces'
import { downloadObjectAsJson } from 'src/app/helpers/json'
import { MatDialog } from '@angular/material/dialog'
import { DialogComponent } from '../dialog/dialog.component'
import { getVariableAnnotations, autofill, getPanels } from 'src/app/helpers/formly'

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

  @Input() report: Report
  variables: Variable[]
  loading: boolean = true
  focusedField: any
  downloadFilename: string

  // formly
  model: any = {}
  panels: PanelType[] = []
  form: FormArray = new FormArray(this.panels.map(() => new FormGroup({})))
  options = this.panels.map(() => <FormlyFormOptions>{})

  // expansion panel
  @ViewChild(MatAccordion) accordion: MatAccordion
  step: number = 0  // default open panel
  setStep(index: number) { this.step = index }
  nextStep() { this.step++ }
  prevStep() { this.step-- }

  constructor(
    private papa: Papa,
    public dialog: MatDialog,
  ) { }

  ngOnChanges(): void {
    this.loadForm()
    document.getElementById('wrapper').scrollTop = 0
  }

  /**
   * Load the form with the ictus Input() report property.
   */
  loadForm() {
    this.loading = true
    this.model = {}
    this.panels = []
    this.downloadFilename = `${this.report.filename}.json`

    // TODO await new Promises in papa-parses to avoid callback hell

    this.papa.parse(`assets/variables.tsv`, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: parsedVariables => {
        this.variables = parsedVariables.data
        const variables: Variable[] = this.variables
        this.papa.parse('assets/options.tsv', {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: parsedOptions => {
            const options: any[] = parsedOptions.data
            variables.forEach(variable => {
              variable.options = options.filter(a => variable.entity.startsWith(a.entity)).map(a => ({ value: a.value, comment: a.comment }))
              const annotations = getVariableAnnotations(variable, this.report.annotations)
              this.model = { ...this.model, [variable.key]: autofill(variable, annotations) }
            })
            this.panels = [...this.panels, ...getPanels(variables, this.report.annotations)]
            this.loading = false
          }
        })
      }
    })
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
