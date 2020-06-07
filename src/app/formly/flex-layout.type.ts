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
      <formly-field [fxFlex]="to.fxFlex" *ngFor="let f of field.fieldGroup" [field]="f">
      </formly-field>
      <button *ngIf="to.unspecified" type="button" mat-icon-button color="attention"
        matTooltip="{{ to.button.tooltip }}"
        matTooltipPosition="{{ to.button.tooltipPosition }}"
        (click)="to.button.action()">
        <mat-icon>{{ to.button.icon }}</mat-icon>
      </button>
    </div>
  `
})
export class FlexLayoutType extends FieldType {
}
