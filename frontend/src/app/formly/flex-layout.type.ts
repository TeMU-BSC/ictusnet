import { Component, ViewChild, ViewContainerRef } from '@angular/core'
import { FieldType } from '@ngx-formly/core'

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

      <button
        type="button"
        mat-icon-button
        color="terciary"
        class="hint-button"
        matTooltip="{{ to.hintButton.tooltip }}"
        matTooltipClass="{{ to.hintButton.tooltipClass }}"
        matTooltipPosition="{{ to.hintButton.tooltipPosition || 'below' }}"
        (click)="to.hintButton.action()"
        *ngIf="to.hintButton"
      >
        <mat-icon>
          {{ to.hintButton.icon }}
        </mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .hint-button {
      background-color: rgba(0, 0, 0, 0.67);
      line-height: 0; /* Force icon centered */
    }
    `]
})
export class FlexLayoutType extends FieldType {
}
