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
          [hidden]="!to.addonRight.info"
          fontSet="material-icons-round"
          color="{{ to.addonRight.info?.color }}"
          matTooltip="{{ to.addonRight.info?.tooltip }}"
          matTooltipPosition="{{ to.addonRight.info?.tooltipPosition || 'below' }}"
        >
          {{ to.addonRight.info?.icon }}
        </mat-icon>

        <button
          [hidden]="!to.addonRight.evidenceButton"
          type="button"
          mat-icon-button
          color="{{ to.addonRight.evidenceButton?.color }}"
        >
          <mat-icon
            fontSet="material-icons-round"
            matTooltip="{{ to.addonRight.evidenceButton?.tooltip }}"
            matTooltipPosition="{{ to.addonRight.evidenceButton?.tooltipPosition || 'below' }}"
            matTooltipClass="{{ to.addonRight.evidenceButton?.tooltipClass }}"
          >
            {{ to.addonRight.evidenceButton?.icon }}
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
