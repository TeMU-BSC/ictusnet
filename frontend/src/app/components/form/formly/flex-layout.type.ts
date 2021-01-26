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
        matTooltipPosition="{{ to.auxiliaryHintButton?.tooltipPosition || 'below' }}"
        (click)="to.auxiliaryHintButton?.onClick()"
      >
        {{ to.auxiliaryHintButton?.icon }}
      </mat-icon>
    </div>
  `,
  styles: [`
    .auxiliar-hint-button {
      font-size: 1.25rem;
      background-color: #283593;
      background-clip: content-box;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class FlexLayoutType extends FieldType { }
