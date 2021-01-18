import { Component } from '@angular/core'
import { FieldType } from '@ngx-formly/core'

@Component({
  selector: 'formly-form-flex',
  template: `
    <div
      [fxLayout]="to.fxLayout || 'row wrap'"
      [fxLayout.xs]="to.fxLayoutXs || 'column'"
      [fxLayoutAlign]="to.fxLayoutAlign || 'start stretch'"
      [fxLayoutGap]="to.fxLayoutGap || '0rem'"
    >

      <formly-field [fxFlex]="to.fxFlex" *ngFor="let f of field.fieldGroup" [field]="f">
      </formly-field>

      <mat-icon
        *ngIf="to.auxiliaryHintButton"
        color="terciary"
        class="auxiliar-hint-button"
        matTooltip="{{ to.auxiliaryHintButton?.tooltip }}"
        matTooltipClass="{{ to.auxiliaryHintButton?.tooltipClass }}"
        matTooltipPosition="{{ to.auxiliaryHintButton?.tooltipPosition || 'below' }}"
        (click)="to.auxiliaryHintButton?.onClick()"
      >
        {{ to.auxiliaryHintButton?.icon }}
      </mat-icon>
    </div>
  `,
  styles: [`
    .auxiliar-hint-button {
      background-color: #283593;
      border-radius: 50%;
      padding: 0.2rem;
      cursor: pointer;
    }
  `]
})
export class FlexLayoutType extends FieldType { }
