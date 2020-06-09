import { Component, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'formly-wrapper-addons',
  template: `
  <div (mouseenter)="showIcon()" (mouseleave)="hideIcon()">
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
        <mat-icon [hidden]="!to.addonRight.info"
          fontSet="material-icons-outlined"
          color="{{ to.addonRight.info?.color }}"
          matTooltip="{{ to.addonRight.info?.tooltip }}"
          matTooltipPosition="{{ to.addonRight.info?.tooltipPosition || 'below' }}"
        >
          {{ to.addonRight.info?.icon }}
        </mat-icon>

        <mat-icon [hidden]="!to.addonRight.locate"
          color="{{ to.addonRight.locate?.color }}"
          fontSet="material-icons-outlined"
          matTooltip="{{ to.addonRight.locate?.tooltip }}"
          matTooltipPosition="{{ to.addonRight.locate?.tooltipPosition || 'below' }}"
          matTooltipClass="{{ to.addonRight.locate?.tooltipClass }}"
          [ngStyle]="{cursor: to.addonRight.locate?.onClick ? 'pointer' : 'inherit'}"
        >
          {{ to.addonRight.locate?.icon }}
        </mat-icon>

        <span *ngIf="to.addonRight.text">{{ to.addonRight.text }}</span>
      </span>




      <!-- <span
        *ngIf="to.addonRight"
        (click)="addonRightClick($event)"
        fxLayout="row" fxLayoutAlign="center center"
      >
        <mat-icon [hidden]="!to.info" color="primary" matTooltip="{{ to.info.tooltip }}"
          matTooltipPosition="{{ to.info.tooltipPosition || 'below' }}">
          {{ to.info.icon }}
        </mat-icon>

        <mat-icon [hidden]="!to.addonRight" color="attention" matTooltip="{{ to.addonRight.tooltip }}"
          matTooltipPosition="{{ to.addonRight.tooltipPosition || 'below' }}"
          matTooltipClass="{{ to.addonRight.tooltipClass }}"
          [ngStyle]="{cursor: to.addonRight.onClick ? 'pointer' : 'inherit'}"
        >
          {{ to.addonRight.icon }}
        </mat-icon>

        <span *ngIf="to.addonRight.text">{{ to.addonRight.text }}</span>
      </span> -->
    </ng-template>
  </div>
  `,
})
export class FormlyWrapperAddons extends FieldWrapper implements AfterViewInit {

  visible = false;
  showIcon() {
    this.visible = true;
  }
  hideIcon() {
    this.visible = false;
  }

  @ViewChild('matPrefix') matPrefix: TemplateRef<any>;
  @ViewChild('matSuffix') matSuffix: TemplateRef<any>;

  ngAfterViewInit() {
    if (this.matPrefix) {
      Promise.resolve().then(() => this.to.prefix = this.matPrefix);
    }

    if (this.matSuffix) {
      Promise.resolve().then(() => this.to.suffix = this.matSuffix);
    }
  }

  addonLeftClick($event: any) {
    if (this.to.addonLeft.onClick) {
      this.to.addonLeft.onClick(this.to, this, $event);
    }
  }

  addonRightClick($event: any) {
    if (this.to.addonRight.onClick) {
      this.to.addonRight.onClick(this.to, this, $event);
    }
  }

}
