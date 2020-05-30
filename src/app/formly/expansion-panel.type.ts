import { Component, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { MatAccordion } from '@angular/material/expansion';

@Component({
  selector: 'formly-expansion-panel',
  template: `
    <!-- <mat-expansion-panel [expanded]="step === 0" (opened)="setStep(0)">
      <mat-expansion-panel-header>
        <mat-panel-title>
          <mat-icon>{{ to.title.icon }}</mat-icon>
          <span class="title">{{ to.title.text }}</span>
        </mat-panel-title>
      </mat-expansion-panel-header>

      <formly-field fxFlex *ngFor="let f of field.fieldGroup" [field]="f">
      </formly-field>

      <mat-action-row>
        <button mat-button [color]="to.button.color" (click)="nextStep()">{{ to.button.text }}</button>
      </mat-action-row>
    </mat-expansion-panel> -->
  `,
})
export class ExpansionPanelType extends FieldType {

  @ViewChild(MatAccordion) accordion: MatAccordion;
  step: number = 0;

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

}
