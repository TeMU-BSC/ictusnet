import { Injectable } from '@angular/core';
import { PanelType } from 'src/app/components/static/static.component';
import { highlight } from 'src/app/helpers/helpers';
import { ParsingService } from './parsing.service';
import { admissibleEvidences } from '../constants/constants';
import { Variable, Suggestion } from '../interfaces/interfaces';

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
   * Search for a suitable value or values to autofill a formly field.
   */
  autofill(variable: Variable, suggestions: Suggestion[]): any {
    let data: any = suggestions[0]?.evidence;

    if (variable.fieldType === 'input' && ['date', 'time'].includes(variable.inputType)) {
      data = suggestions[0]?.notes;
    }

    // single option select needs string data
    if (variable.fieldType === 'select' && variable.cardinality === '1') {

      // special cases
      if (variable.entity === 'Diagnostico_principal') {
        const suggestion = suggestions.find(s => ['Ictus_isquemico', 'Ataque_isquemico_transitorio', 'Hemorragia_cerebral'].includes(s.entity));
        data = variable.options.find(o => o.value.startsWith(suggestion?.entity.toLowerCase().split('_')[0]))?.value;
      }

      // autofill with option:
      else {
        data = variable.options.find(o =>

          // 1. if that includes the first evidence as a substring
          o.value.includes(suggestions[0]?.evidence.toLowerCase())

          // 2. or if any of the predefined admissible values includes the first evidence
          || admissibleEvidences[variable.key][o.value]?.includes(suggestions[0]?.evidence)

          // 3. or if evidence starts with the first letter of that option
          || suggestions[0]?.evidence.toLowerCase().startsWith(o.value[0])
        )?.value;
      }
    }

    // multiple option select needs array of strings
    if (variable.fieldType === 'select' && variable.cardinality === 'n') {
      data = [''];
      suggestions.forEach(suggestion => {
        const option = variable.options.find(o => o.value.concat(' ', o.comment).includes(suggestion?.evidence.toLowerCase()))?.value;
        data.push(option);
      });
    }

    return data;
  }

}
