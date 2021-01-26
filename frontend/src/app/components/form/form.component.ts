import { Component, OnChanges, ViewChild, Input } from '@angular/core'
import { FormArray, FormGroup } from '@angular/forms'
import { MatAccordion } from '@angular/material/expansion'
import { FormlyFormOptions } from '@ngx-formly/core'
import { ApiService } from 'src/app/services/api.service'
import { Report, Option, Variable } from 'src/app/interfaces/interfaces'
import { getVariableAnnotations, getPanels, PanelType, autofillField } from './panels/panels-builder'

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
  ) { }

  ngOnChanges(): void {
    this.autofillForm()
  }

  /**
   * Load the form reading the Input() `report` property, alongside the
   * `variables` and `options` for the ictusnet entities. Also build the
   * expansion panels and populate the formly model, which later will be saved
   * as the report `results`.
   */
  autofillForm(): void {
    this.model = {}
    this.panels = []
    const variables: Variable[] = this.api.variables
    const options: Option[] = this.api.options
    const allAnnotations = this.report?.annotations || []
    variables.forEach(variable => {
      variable.options = options.filter(o => variable.entity.startsWith(o.entity))
      const variableAnnotations = getVariableAnnotations(variable, allAnnotations)
      this.model = { ...this.model, [variable.key]: autofillField(variable, variableAnnotations) }
    })
    this.panels = [...this.panels, ...getPanels(variables, allAnnotations)]

    // replace the formly model by the report results if fetched any from database
    if (this.report?.completed) {
      this.model = this.report.form.final
    }

    // reset the scroll state on report text
    document.getElementById('wrapper').scrollTop = 0
  }

}
