import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';

@Component({
  selector: 'app-static',
  templateUrl: './static.component.html',
  // templateUrl: './simple.component.html',
  styleUrls: ['./static.component.scss']
})
export class StaticComponent {

  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('downloadButton') downlaodButton: HTMLElement;

  step: number = 0;
  setStep(index: number) {
    this.step = index;
  }
  nextStep() {
    this.step++;
  }
  prevStep() {
    this.step--;
  }

  confirm() {
    confirm('¿Estas seguro?');
  }
  finish() {
    this.accordion.closeAll();
    this.downlaodButton.focus();
  }
  download() {
    // TODO (copy from what I've already done in the other component)
  }

  // formly
  form = new FormGroup({});
  model: any = {
    fechaInicioSintomas: '1999-06-28',
    horaInicioSintomas: '15:46',

    fechaApocalipsis: '2000-12-12',
    horaApocalipsis: '00:00',
  };
  fields: FormlyFieldConfig[] = [
    {
      type: 'flex-layout',
      templateOptions: {
        fxLayout: 'column',
      },
      fieldGroup: [
        {
          template: `<p>Inicio de los síntomas</p>`
        },
        {
          type: 'flex-layout',
          templateOptions: {
            fxLayout: 'row',
            fxLayoutGap: '0.5rem',
            fxLayoutAlign: 'space-between',
          },
          fieldGroup: [
            {
              key: `fechaInicioSintomas`,
              type: 'input',
              templateOptions: {
                type: 'date',
                appearance: 'outline',
                label: 'Fecha',
                addonRight: {
                  icon: 'search',
                  onClick: (to, addon, $event) => console.log(to.label),
                },
              },
            },
            {
              key: `horaInicioSintomas`,
              type: 'input',
              templateOptions: {
                type: 'time',
                appearance: 'outline',
                label: 'Hora',
                addonRight: {
                  icon: 'search',
                  onClick: (to, addon, $event) => console.log(to.label),
                },
              },
            },
          ]
        }
      ],
    }
  ];
  options: FormlyFormOptions = {};

}
