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
  fields: FormlyFieldConfig[] = [
    {
      type: 'flex-layout',
      templateOptions: {
        fxLayout: 'row',
        fxLayoutGap: '0.5rem',
        fxLayoutAlign: 'space-between center',
      },
      fieldGroup: [
        {
          template: `<p>Inicio de los síntomas</p>`
        },
        {
          key: `fechaInicioSintomas`,
          type: 'input',
          templateOptions: {
            type: 'date',
            appearance: 'outline',
            label: 'Fecha',
            addonRight: {
              icon: 'search',
              // onClick: (to, addon, $event) => this.pickedField = addon.key,
              onClick: (to, addon, $event) => console.log(addon.key),
            },
            // multiple: variable.cardinality === 'n',
            // placeholder: variable.inputType === 'date' ? 'YYYY-MM-DD' : variable.inputType === 'time' ? 'hh:mm' : null,
            // options: variable.fieldType === 'select' ? options : null,
          },
          // expressionProperties: {
          //   'templateOptions.disabled': `!model.${variable.key}Evidencia`,
          // },
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
              // onClick: (to, addon, $event) => this.pickedField = addon.key,
              onClick: (to, addon, $event) => console.log(addon.key),
            },
          },
          expressionProperties: {
            'templateOptions.disabled': 'true',
          },
        },
      ],
    }
  ];
  fields2: FormlyFieldConfig[] = [
    {
      type: 'flex-layout',
      templateOptions: {
        fxLayout: 'row',
        fxLayoutGap: '0.5rem',
        fxLayoutAlign: 'space-between center',
      },
      fieldGroup: [
        {
          template: `<p>apocalipsis now</p>`
        },
        {
          key: `fechaApocalipsis`,
          type: 'input',
          templateOptions: {
            type: 'date',
            appearance: 'outline',
            label: 'Fecha',
            addonRight: {
              icon: 'search',
              // onClick: (to, addon, $event) => this.pickedField = addon.key,
              onClick: (to, addon, $event) => console.log(addon.key),
            },
            // multiple: variable.cardinality === 'n',
            // placeholder: variable.inputType === 'date' ? 'YYYY-MM-DD' : variable.inputType === 'time' ? 'hh:mm' : null,
            // options: variable.fieldType === 'select' ? options : null,
          },
          // expressionProperties: {
          //   'templateOptions.disabled': `!model.${variable.key}Evidencia`,
          // },
        },
        {
          key: `horaApocalipsis`,
          type: 'input',
          templateOptions: {
            type: 'time',
            appearance: 'outline',
            label: 'Hora',
            addonRight: {
              icon: 'search',
              // onClick: (to, addon, $event) => this.pickedField = addon.key,
              onClick: (to, addon, $event) => console.log(addon.key),
            },
          },
          expressionProperties: {
            'templateOptions.disabled': 'true',
          },
        },
      ],
    }
  ];
  model: any = {
    fechaInicioSintomas: '1999-06-28',
    horaInicioSintomas: '15:46',

    fechaApocalipsis: '2000-12-12',
    horaApocalipsis: '00:00',
  };
  options: FormlyFormOptions = {};





}
