import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-form-flex',
  template: `
    <div
      class="content"
      [fxLayout]="to.fxLayout"
      fxLayout.xs="column"
      [fxLayoutAlign]="to.fxLayoutAlign"
      [fxLayoutGap]="to.fxLayoutGap"
      fxFlexFill
    >
      <formly-field fxFlex *ngFor="let f of field.fieldGroup" [field]="f"
        (mouseenter)="showIcon($event)">
      </formly-field>
    </div>
  `,
})
export class FlexLayoutType extends FieldType {

  showIcon(event) {
    console.log('icon will be shown', event)
  }

}
