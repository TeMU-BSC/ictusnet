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

      <button *ngIf="to.lantern" type="button" mat-icon-button style="color: rgb(160, 0, 160);"
        matTooltip="{{ to.lantern.tooltip }}"
        matTooltipClass="{{ to.lantern.tooltipClass }}"
        matTooltipPosition="{{ to.lantern.tooltipPosition || 'below' }}"
        (click)="to.lantern.action()"
      >
        <!-- https://github.com/angular/components/issues/11544 -->
        <mat-icon fontSet="material-icons-round">{{ to.lantern.icon }}</mat-icon>
      </button>
    </div>
  `
})
export class FlexLayoutType extends FieldType {
}
