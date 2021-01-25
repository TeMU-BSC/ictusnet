import { Component, OnChanges, ViewChild, Input } from '@angular/core'
import { FormArray, FormGroup } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatAccordion } from '@angular/material/expansion'
import { FormlyFormOptions } from '@ngx-formly/core'
import { getVariableAnnotations, autofill, getPanels, PanelType } from 'src/app/formly/formly'
import { ApiService } from 'src/app/services/api.service'
import { DialogComponent } from 'src/app/components/dialog/dialog.component'
import { Report, Option, Variable } from 'src/app/interfaces/interfaces'
import { downloadObjectAsJson } from 'src/app/helpers/json'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ReportDeletedComponent } from '../report-deleted/report-deleted.component'

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
    private snackBar: MatSnackBar,
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
    if (this.report.results) {
      this.model = this.report.results
    }

    // reset the scroll state on report text
    document.getElementById('wrapper').scrollTop = 0
  }

  resetForm(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Restablecer formulario',
        content: `¿Quieres volver al último punto de guardado de este formulario? Perderás los cambios más recientes.`,
        actions: {
          accept: { text: 'Restablecer', color: 'warn' },
        }
      }
    })
    dialogRef.afterClosed().subscribe(confirmation => {
      if (confirmation) {
        this.prefillForm()
        this.snackBar.open('Formulario restablecido.')
      }
    })
  }

  downloadFormAsJson() {
    this.report.results = this.model
    this.api.updateReport(this.report).subscribe(updatedReport => {
      const timestamp = new Date().toISOString()
      downloadObjectAsJson(updatedReport, `${updatedReport.filename}-${timestamp}.json`)
    })
  }

  toggleComplete() {
    this.report.completed = !this.report.completed
    this.report.results = this.model
    this.api.updateReport(this.report).subscribe()
  }

  deleteReport() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Borrar informe',
        content: `¿Quieres borrar el informe ${this.report.filename}?`,
        actions: {
          accept: { text: 'Borrar', color: 'warn' },
        }
      }
    })
    dialogRef.afterClosed().subscribe(confirmation => {
      if (confirmation) {
        const snackBarRef = this.snackBar.openFromComponent(ReportDeletedComponent, {
          data: { text: 'Informe borrado.', action: 'Deshacer', duration: 5000 }
        })
        snackBarRef.onAction().subscribe(() => {
          this.snackBar.open('El informe no ha sido borrado.', 'Vale', { duration: 5000 })
        })
        snackBarRef.afterDismissed().subscribe(info => {
          if (!info.dismissedByAction) {
            this.api.deleteReport(this.report).subscribe()
          }
        })
      }
    })
  }

}
