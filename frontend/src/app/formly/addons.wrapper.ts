import { Component, TemplateRef, ViewChild, AfterViewInit } from '@angular/core'
import { FieldWrapper } from '@ngx-formly/core'

@Component({
  selector: 'formly-wrapper-addons',
  template: `
  <div>
    <ng-container #fieldComponent></ng-container>

    <ng-template #matSuffix>
      <span
        *ngIf="to.addonRight"
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
          color="{{ to.addonRight.hintButton.color }}"
          matTooltip="{{ to.addonRight.hintButton.tooltip }}"
          matTooltipPosition="{{ to.addonRight.hintButton.tooltipPosition || 'below' }}"
          matTooltipClass="{{ to.addonRight.hintButton.tooltipClass }}"
          *ngIf="!to.addonRight.hintButton.hidden"
          (click)="addonRightHintButtonClick($event)"
        >
          <mat-icon>
            {{ to.addonRight.hintButton.icon }}
          </mat-icon>
        </button>

        <button
          type="button"
          mat-icon-button
          color="{{ to.addonRight.evidenceButton.color }}"
          matTooltip="{{ to.addonRight.evidenceButton.tooltip }}"
          matTooltipPosition="{{ to.addonRight.evidenceButton.tooltipPosition || 'below' }}"
          matTooltipClass="{{ to.addonRight.evidenceButton.tooltipClass }}"
          *ngIf="!to.addonRight.evidenceButton.hidden"
          (click)="addonRightEvidenceButtonClick($event)"
        >
          <mat-icon>
            {{ to.addonRight.evidenceButton.icon }}
          </mat-icon>
        </button>
      </span>
    </ng-template>
  </div>
  `,
})
export class FormlyWrapperAddons extends FieldWrapper implements AfterViewInit {

  @ViewChild('matSuffix') matSuffix: TemplateRef<any>

  ngAfterViewInit() {
    if (this.matSuffix) {
      Promise.resolve().then(() => this.to.suffix = this.matSuffix)
    }
  }

  addonRightHintButtonClick($event: any) {
    this.to.addonRight?.hintButton?.onClick(this.to, this, $event)
  }

  addonRightEvidenceButtonClick($event: any) {
    this.to.addonRight?.evidenceButton?.onClick(this.to, this, $event)
  }

}
