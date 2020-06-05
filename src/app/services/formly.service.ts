import { Injectable } from '@angular/core';
import { PanelType } from 'src/app/components/static/static.component';
import { highlight } from 'src/app/helpers/helpers';
import { ParsingService } from './parsing.service';

@Injectable({
  providedIn: 'root'
})
export class FormlyService {

  constructor(private parser: ParsingService) { }

  getPanels(): PanelType[] {
    return [
      {
        icon: 'airport_shuttle',
        title: 'Entrada y salida del paciente',
        fields: [
          {
            template: `<p><b>Inicio de los síntomas</b></p>`
          },
          {
            key: 'fechaInicioSintomas',
            type: 'input',
            templateOptions: {
              type: 'date',
              appearance: 'outline',
              label: 'Fecha',
              // multiple: variable.cardinality === 'n',
              // options: options,
              focus: (field, event) => highlight(this.parser.annotations, 'context'),
              // addonRight: {
              //   icon: 'search',
              //   tooltip: suggestions.map(s => s.evidence).join('\n'),
              //   tooltipClass: 'multiline-tooltip',
              //   onClick: (to, addon, event) => highlight(to.suggestions, 'context'),
              // }
            }
          },
          {
            key: 'horaInicioSintomas',
            type: 'input',
            templateOptions: {
              type: 'time',
              appearance: 'outline',
              label: 'Hora',
              // multiple: variable.cardinality === 'n',
              // options: options,
              focus: (field, event) => highlight(this.parser.annotations, 'context'),
              // addonRight: {
              //   icon: 'search',
              //   tooltip: suggestions.map(s => s.evidence).join('\n'),
              //   tooltipClass: 'multiline-tooltip',
              //   onClick: (to, addon, event) => highlight(to.suggestions, 'context'),
              // }
            }
          },
        ]
      },
      {
        icon: 'local_hospital',
        title: 'Diagnóstico',
        fields: [
          {
            template: `<p><b>Diagnóstico principal</b></p>`
          },
          {
            key: 'diagnosticoPrincipal',
            type: 'select',
            templateOptions: {
              appearance: 'outline',
              label: 'Diagnóstico principal',
              options: [
                { label: 'ictus', value: 'ictus' },
                { label: 'ataque', value: 'ataque' },
                { label: 'hemorragia', value: 'hemorragia' },
              ],
              focus: (field, event) => highlight(this.parser.annotations, 'context'),
            }
          },
          {
            key: 'arteriaAfectada',
            type: 'select',
            templateOptions: {
              appearance: 'outline',
              label: 'Arteria afectada',
              options: [
                { label: 'ACM', value: 'ACM' },
                { label: 'PMI', value: 'PMI' },
                { label: 'ACA', value: 'ACA' },
              ],
              multiple: true,
              focus: (field, event) => highlight(this.parser.annotations, 'context'),
            }
          },


        ]
      },


    ];
  }


  /**
   * Build the formly model.
   */
  autofill(): any {

  }

}
