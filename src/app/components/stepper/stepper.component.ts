import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';

export interface StepType {
  label: string;
  fields: FormlyFieldConfig[];
}
@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent implements OnInit {

  a: string = 'holaaa';

  constructor() { }

  ngOnInit(): void {
  }

  model: any = {
    fechaInicioSintomas: '1999-06-28',
    horaInicioSintomas: '15:46',

    fechaApocalipsis: '2000-12-12',
    horaApocalipsis: '00:00',
  };
  steps: StepType[] = [
    {
      label: 'Personal data',
      fields: [
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
      ],
    },
    {
      label: 'Destination',
      fields: [
        {
          key: `fechaApocalipsis`,
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
          key: `horaApocalipsis`,
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
      ],
    },
    {
      label: 'Day of the trip',
      fields: [
        {
          key: 'day',
          type: 'input',
          templateOptions: {
            type: 'date',
            label: 'Day of the trip',
            // required: true,
          },
        },
      ],
    },
  ];

  form = new FormArray(this.steps.map(() => new FormGroup({})));
  options = this.steps.map(() => <FormlyFormOptions>{});

  submit() {
    alert(JSON.stringify(this.model));
  }

}
