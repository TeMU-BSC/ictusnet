import { Component, Input, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { downloadObjectAsJson } from 'src/app/helpers/json'
import { Report } from 'src/app/interfaces/interfaces'
import { ApiService } from 'src/app/services/api.service'
import { DialogComponent } from '../dialog/dialog.component'
import { FormComponent } from '../form/form.component'
import { ReportDeletedComponent } from '../report-deleted/report-deleted.component'

@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss']
})
export class ActionsComponent implements OnInit {

  @Input() report: Report
  @Input() form: FormComponent

  constructor(
    private api: ApiService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
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
        this.report.form.final = this.report.form.initial
        this.snackBar.open('Formulario restaurado.')
      }
    })
  }

  downloadFormAsJson() {
    this.report.form.final = this.form.model
    this.api.updateReport(this.report.filename, this.report).subscribe(updatedReport => {
      const timestamp = new Date().toISOString()
      downloadObjectAsJson(updatedReport, `${updatedReport.filename}-${timestamp}.json`)
    })
  }

  markAsCompleted() {
    this.report.completed = true
    this.report.form.final = this.form.model
    this.api.updateReport(this.report.filename, this.report).subscribe()
  }

  toggleCompleted() {
    this.report.completed = !this.report.completed
    this.report.form.final = this.form.model
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
