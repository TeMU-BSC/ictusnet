import { Component, OnChanges, ViewChild, Input } from '@angular/core'
import { FormArray, FormGroup } from '@angular/forms'
import { MatAccordion } from '@angular/material/expansion'
import { FormlyFormOptions } from '@ngx-formly/core'
import { ApiService } from 'src/app/services/api.service'
import { Report } from 'src/app/interfaces/interfaces'
import { getPanels, PanelType } from './panels/panels-builder'
import { ActionsComponent } from '../actions/actions.component'

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnChanges {

  @Input() report: Report
  @ViewChild(ActionsComponent) actions: ActionsComponent

  // formly (dynamic form builder)
  model: any = {}
  panels: PanelType[] = []
  form: FormArray = new FormArray(this.panels.map(() => new FormGroup({})))
  options = this.panels.map(() => <FormlyFormOptions>{})

  // material expansion panels
  @ViewChild(MatAccordion) accordion: MatAccordion
  step: number = 0  // default open panel
  setStep(index: number): void { this.step = index }
  nextStep(): void { this.step++ }
  prevStep(): void { this.step-- }

  constructor(private api: ApiService) {
    this.buildPanels()
  }

  ngOnChanges(): void {
    this.autofillForm()
    this.resetScrollState()
  }

  buildPanels(): void {
    this.api.getVariables().subscribe(response => {
      const variables = response
      this.panels = [...this.panels, ...getPanels(variables, this.report?.annotations || [])]
    })
  }

  autofillForm(): void {
    this.model = this.report?.completed ? this.report?.form.final : this.report?.form.initial
  }

  resetScrollState(): void {
    document.getElementById('wrapper').scrollTop = 0
  }

}
