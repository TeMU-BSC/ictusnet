import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'formly-wrapper-expansion-panel',
  template: `
<!-- <ng-template #matPrefix>
  <span
    *ngIf="to.addonLeft"
    [ngStyle]="{cursor: to.addonLeft.onClick ? 'pointer' : 'inherit'}"
    (click)="addonLeftClick($event)"
  >
    <mat-icon *ngIf="to.addonLeft.icon">{{ to.addonLeft.icon }}</mat-icon>
    <span *ngIf="to.addonLeft.text">{{ to.addonLeft.text }}</span>
  </span>
</ng-template>

<ng-container #fieldComponent></ng-container>

<ng-template #matSuffix>
  <span
    *ngIf="to.addonRight"
    [ngStyle]="{cursor: to.addonRight.onClick ? 'pointer' : 'inherit'}"
    (click)="addonRightClick($event)"
  >
    <mat-icon *ngIf="to.addonRight.icon">{{ to.addonRight.icon }}</mat-icon>
    <mat-icon *ngIf="to.addonRight.icon2">{{ to.addonRight.icon2 }}</mat-icon>
    <span *ngIf="to.addonRight.text">{{ to.addonRight.text }}</span>
  </span>
</ng-template> -->



<!-- <mat-expansion-panel [expanded]="step === 0" (opened)="setStep(0)">
  <mat-expansion-panel-header>
    <mat-panel-title>
      <mat-icon>{{ to.title.icon }}</mat-icon>
      <span class="title">{{ to.title.text }}</span>
    </mat-panel-title>
  </mat-expansion-panel-header>

  <ng-container #fieldComponent></ng-container>

  <mat-action-row>
    <button mat-button [color]="to.buttonColor" (click)="nextStep()">Siguiente</button>
  </mat-action-row>
</mat-expansion-panel> -->

  `,
})
export class ExpansionPanelWrapper extends FieldWrapper {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;
}
