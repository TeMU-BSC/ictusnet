import { Component, TemplateRef, ViewChild, AfterViewInit } from '@angular/core'
import { FieldWrapper } from '@ngx-formly/core'

@Component({
  selector: 'formly-wrapper-addons',
  template: `
  <div>
    <ng-template #matPrefix>
      <span
        *ngIf="to.addonLeft"
        [ngStyle]="{cursor: to.addonLeft.onClick ? 'pointer' : 'inherit'}"
        (click)="addonLeftClick($event)"
      >
        <mat-icon *ngIf="to.addonLeft.icon">{{ to.addonLeft.icon }}</mat-icon>&nbsp;
        <span *ngIf="to.addonLeft.text">{{ to.addonLeft.text }}</span>&nbsp;
      </span>
    </ng-template>

    <ng-container #fieldComponent></ng-container>

    <ng-template #matSuffix>
      <span
        *ngIf="to.addonRight"
        (click)="addonRightClick($event)"
        fxLayout="row" fxLayoutAlign="center center"
      >
        <mat-icon
          color="{{ to.addonRight.infoIcon.color }}"
          matTooltip="{{ to.addonRight.infoIcon.tooltip }}"
          matTooltipPosition="{{ to.addonRight.infoIcon.tooltipPosition || 'below' }}"
          *ngIf="!to.addonRight.infoIcon.hidden"
        >
          {{ to.addonRight.infoIcon.icon }}
        </mat-icon>

        <button
          type="button"
          mat-icon-button
          color="{{ to.addonRight.evidenceButton.color }}"
          matTooltip="{{ to.addonRight.evidenceButton.tooltip }}"
          matTooltipPosition="{{ to.addonRight.evidenceButton.tooltipPosition || 'below' }}"
          matTooltipClass="{{ to.addonRight.evidenceButton.tooltipClass }}"
          [disabled]="to.addonRight.evidenceButton.disabled"
        >
          <mat-icon>
            {{ to.addonRight.evidenceButton.icon }}
          </mat-icon>
        </button>

        <span *ngIf="to.addonRight.text">{{ to.addonRight.text }}</span>
      </span>
    </ng-template>
  </div>
  `,
})
export class FormlyWrapperAddons extends FieldWrapper implements AfterViewInit {

  @ViewChild('matPrefix') matPrefix: TemplateRef<any>
  @ViewChild('matSuffix') matSuffix: TemplateRef<any>

  ngAfterViewInit() {
    if (this.matPrefix) {
      Promise.resolve().then(() => this.to.prefix = this.matPrefix)
    }

    if (this.matSuffix) {
      Promise.resolve().then(() => this.to.suffix = this.matSuffix)
    }
  }

  addonLeftClick($event: any) {
    if (this.to.addonLeft.onClick) {
      this.to.addonLeft.onClick(this.to, this, $event)
    }
  }

  addonRightClick($event: any) {
    if (this.to.addonRight.onClick) {
      this.to.addonRight.onClick(this.to, this, $event)
    }
  }

}
