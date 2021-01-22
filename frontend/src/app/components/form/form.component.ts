import { Component, OnChanges, ViewChild, Input } from '@angular/core'
import { FormArray, FormGroup } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatAccordion } from '@angular/material/expansion'
import { FormlyFormOptions } from '@ngx-formly/core'
import { getVariableAnnotations, autofill, getPanels, PanelType } from 'src/app/formly/formly'
import { ApiService } from 'src/app/services/api.service'
import { DialogComponent } from 'src/app/components/dialog/dialog.component'
import { Report, Option, Variable } from 'src/app/interfaces/interfaces'

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnChanges {

  @Input() report: Report

  // formly
  model: any = {}
  panels: PanelType[] = []
  form: FormArray = new FormArray(this.panels.map(() => new FormGroup({})))
  options = this.panels.map(() => <FormlyFormOptions>{})

  // material expansion panels
  @ViewChild(MatAccordion) accordion: MatAccordion
  step: number = 0  // default open panel
  setStep(index: number) { this.step = index }
  nextStep() { this.step++ }
  prevStep() { this.step-- }

  constructor(
    private api: ApiService,
    public dialog: MatDialog,
  ) { }

  ngOnChanges(): void {
    this.prefillForm()
  }

  /**
   * Load the form reading the Input() `report` property, alongside the
   * `variables` and `options` for the ictusnet entities. Also build the
   * expansion panels and populate the formly model, which later will be saved
   * as the report `results`.
   */
  prefillForm() {
    this.model = {}
    this.panels = []
    const variables: Variable[] = this.api.variables
    const options: Option[] = this.api.options
    const allAnnotations = this.report.annotations
    variables.forEach(variable => {
      variable.options = options.filter(o => variable.entity.startsWith(o.entity))
      const variableAnnotations = getVariableAnnotations(variable, allAnnotations)
      this.model = { ...this.model, [variable.key]: autofill(variable, variableAnnotations) }
    })
    this.panels = [...this.panels, ...getPanels(variables, allAnnotations)]

    // replace the formly model by the report results if fetched any from database
    this.model = this.report.results ? this.report.results : this.model

    // reset the scroll state on report text
    document.getElementById('wrapper').scrollTop = 0
  }

  confirmBeforeReset(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        title: 'Restablecer formulario',
        content: `
          <p>
            ¿Quieres volver al último punto de guardado de este formulario?
            <br>
            Perderás los cambios más recientes.
          </p>
        `,
        cancelButton: { text: 'Atrás' },
        acceptButton: { text: 'Restablecer', color: 'warn' },
      }
    })
    dialogRef.afterClosed().subscribe(confirmation => {
      if (confirmation) {
        this.ngOnChanges()
      }
    })
  }

  toggleComplete() {
    this.report.completed = !this.report.completed
    this.report.results = this.model
    this.api.updateReport(this.report).subscribe()
  }

}
