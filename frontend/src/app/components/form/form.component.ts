import { Component, OnChanges, ViewChild, Input } from '@angular/core'
import { FormArray, FormGroup } from '@angular/forms'
import { MatAccordion } from '@angular/material/expansion'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { FormlyFormOptions } from '@ngx-formly/core'
import { ApiService } from 'src/app/services/api.service'
import { Report } from 'src/app/interfaces/interfaces'
import { getPanels, PanelType } from './panels/panels-builder'
import { downloadObjectAsJson } from 'src/app/helpers/json'
import { DialogComponent } from '../dialog/dialog.component'
import { ReportDeletedComponent } from '../report-deleted/report-deleted.component'

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnChanges {

  @Input() report: Report

  // formly (dynamic form builder)
  model: any = {}
  panels: PanelType[] = []
  form: FormArray = new FormArray(this.panels.map(() => new FormGroup({})))
  options = this.panels.map(() => <FormlyFormOptions>{})
  private updateFinalResult() { this.report.result.final = { ...this.model } }

  // material expansion panels
  @ViewChild(MatAccordion) accordion: MatAccordion
  step: number = 0  // default open panel
  setStep(index: number): void { this.step = index }
  nextStep(): void { this.step++ }
  prevStep(): void { this.step-- }

  constructor(
    private api: ApiService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnChanges(): void {
    console.log(this.report.filename)

    this.buildPanels()
    this.autofillForm()
    this.resetScrollState()
  }

  buildPanels(): void {
    this.api.getVariables().subscribe(response => {
      const variables = response
      this.panels = [...getPanels(variables, this.report?.annotations || [])]
    })
  }

  autofillForm(): void {
    this.model = this.report?.completed ? { ...this.report?.result.final } : { ...this.report.result.initial }
  }

  resetScrollState(): void {
    document.getElementById('wrapper').scrollTop = 0
  }

  restoreInitialForm(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Restaurar',
        content: `¿Quieres volver al estado inicial de este formulario con las sugerencias automáticas? Se borrarán los cambios realizados.`,
        actions: {
          cancel: { text: 'Cancelar' },
          accept: { text: 'Restaurar', color: 'warn' },
        }
      }
    })
    dialogRef.afterClosed().subscribe(confirmation => {
      if (confirmation) {
        this.report.completed = false
        this.model = { ...this.report.result.initial }
        this.snackBar.open('Formulario restaurado.')
      }
    })
  }

  downloadFormAsJson() {
    this.updateFinalResult()
    this.api.updateReport(this.report.filename, this.report).subscribe(updatedReport => {
      const timestamp = new Date().toISOString()
      downloadObjectAsJson(updatedReport, `${updatedReport.filename}-${timestamp}.json`)
    })
  }

  markAsCompleted() {
    this.report.completed = true
    this.updateFinalResult()
    this.api.updateReport(this.report.filename, this.report).subscribe()
  }

  toggleCompleted() {
    this.report.completed = !this.report.completed
    this.updateFinalResult()
    this.api.updateReport(this.report.filename, this.report).subscribe()
  }

  deleteReport() {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Borrar informe',
        content: `¿Quieres borrar el informe ${this.report.filename}?`,
        actions: {
          cancel: { text: 'Cancelar' },
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
            this.api.deleteReport(this.report.filename).subscribe()
          }
        })
      }
    })
  }

}
