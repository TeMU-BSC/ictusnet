import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-form-flex',
  template: `
    <div
      class="flex-layout-content"
      [fxLayout]="to.fxLayout"
      fxLayout.xs="column"
      [fxLayoutAlign]="to.fxLayoutAlign || 'start stretch'"
      [fxLayoutGap]="to.fxLayoutGap || '0rem'"
    >
    <button type="button" mat-icon-button color="attention" *ngIf="to.unspecified"
      matTooltip="Resaltar todas las evidencias no-específicas de este grupo de variables en el texto."
      matTooltipPosition="right"
      (click)="to.action()">
      <mat-icon>highlight</mat-icon>
    </button>

      <formly-field [fxFlex]="to.fxFlex" *ngFor="let f of field.fieldGroup" [field]="f">
      </formly-field>
    </div>
  `
})
export class FlexLayoutType extends FieldType {
}
