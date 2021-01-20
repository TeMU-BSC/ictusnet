import { Component, OnChanges, ViewChild, Input } from '@angular/core'
import { FormArray, FormGroup } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatAccordion } from '@angular/material/expansion'
import { FormlyFormOptions } from '@ngx-formly/core'
import { getVariableAnnotations, autofill, getPanels, PanelType } from 'src/app/formly/formly'
import { ApiService } from 'src/app/services/api.service'
import { DialogComponent } from 'src/app/components/dialog/dialog.component'
import { downloadObjectAsJson } from 'src/app/helpers/json'
import { Document, Option, Variable } from 'src/app/interfaces/interfaces'

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FieldComponent implements OnChanges {

  @Input() document: Document
  loading = true

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
    private api: ApiService,
    public dialog: MatDialog,
  ) { }

  ngOnChanges(): void {
    this.loadForm()
    document.getElementById('wrapper').scrollTop = 0
  }

  /**
   * Load the form reading the Input() document property, alongside the variables and options for ictusnet entities.
   */
  loadForm() {
    this.loading = true
    this.model = {}
    this.panels = []
    const variables: Variable[] = this.api.variables
    const options: Option[] = this.api.options
    const allAnnotations = this.document.annotations
    variables.forEach(variable => {
      variable.options = options.filter(o => variable.entity.startsWith(o.entity))
      const variableAnnotations = getVariableAnnotations(variable, allAnnotations)
      this.model = { ...this.model, [variable.key]: autofill(variable, variableAnnotations) }
    })
    this.panels = [...this.panels, ...getPanels(variables, allAnnotations)]
    this.loading = false
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

  /**
   * Download the form completed so far in JSON format.
   */
  downloadFormAsJson() {
    downloadObjectAsJson(this.model, `${this.document.filename}.json`)
  }

}
