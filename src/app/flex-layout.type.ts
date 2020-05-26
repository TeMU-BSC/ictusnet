import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'formly-form-flex',
  template: `
    <div
      class="content"
      [fxLayout]="to.fxLayout"
      fxLayout.xs="column"
      [fxLayoutGap]="to.fxLayoutGap"
      fxFlexFill
    >
      <formly-field fxFlex *ngFor="let f of field.fieldGroup" [field]="f">
      </formly-field>
    </div>
  `,
})
export class FlexLayoutType extends FieldType {
}
