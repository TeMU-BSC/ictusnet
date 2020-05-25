import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

import { Papa } from 'ngx-papaparse';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';

import { Annotation, Variable } from './interfaces';
import { isValidDate, isValidTime } from './helpers';


// TODO highlight all spans offsets
// TODO evidence and normalized value for every variable (in the same row)
// TODO (optional) UX layout multi field in each line (fecha, hora), (previo, alta)

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  // core atrtibutes
  file: File;
  text: string;
  annotations: Annotation[] = [];
  variables: Variable[] = []
  admissibleValues: any[];

  // formly
  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {};
  // fields: FormlyFieldConfig[] = [];
  fields: FormlyFieldConfig[] = [
    {
      template: '<div><strong>Entrada y salida del paciente</strong></div><hr/>',
    },
    {
      type: 'flex-layout',
      templateOptions: {
        fxLayout: 'row',
      },
      fieldGroup: [
        {
          type: 'input',
          key: 'fechaEntradaEvidencia',
          templateOptions: {
            appearance: 'fill',
            label: 'Fecha de entrada (evidencia)',
            addonRight: {
              icon: 'edit',
              onClick: (to, addon, $event) => this.pickedField = addon.key,
            },
          },
          expressionProperties: {
            'templateOptions.disabled': 'true',
          },
        },
        {
          type: 'input',
          key: 'fechaEntradaNormalizada',
          templateOptions: {
            appearance: 'outline',
            label: 'Fecha de entrada (normalizada)',
          },
          expressionProperties: {
            'templateOptions.disabled': '!model.fechaEntradaEvidencia',
          },
          validators: {
            date: {
              expression: (c) => !c.value || isValidDate(c.value),
              message: (error, field: FormlyFieldConfig) => `"${field.formControl.value}" no es una fecha válida y/o no tiene el formato YYYY-MM-DD.`,
            },
          }
        },
        {
          type: 'input',
          key: 'horaEntradaEvidencia',
          templateOptions: {
            appearance: 'fill',
            label: 'Hora de entrada (evidencia)',
            addonRight: {
              icon: 'edit',
              onClick: (to, addon, $event) => this.pickedField = addon.key,
            },
          },
          expressionProperties: {
            'templateOptions.disabled': 'true',
          },
        },
        {
          type: 'input',
          key: 'horaEntradaNormalizada',
          templateOptions: {
            appearance: 'outline',
            label: 'Hora de entrada (normalizada)',
          },
          expressionProperties: {
            'templateOptions.disabled': '!model.horaEntradaEvidencia',
          },
          validators: {
            date: {
              expression: (c) => !c.value || isValidTime(c.value),
              message: (error, field: FormlyFieldConfig) => `"${field.formControl.value}" no es una hora válida y/o no tiene el formato hh:mm.`,
            },
          }
        },
      ],
    },
    {
      template: '<div><strong>Diagnóstico</strong></div><hr/>',
    },
    // ...
  ];

  // update evidence on
  pickedField: any;

  // TESTING
  hide: boolean = true;
  currentOffset: string;

  constructor(
    private http: HttpClient,
    private papa: Papa,
  ) { }

  ngOnInit() {
    this.parseVariables();
    // this.loadRealExample(321108781);
  }

  /**
   * Parse variables from the following google spreadsheets:
   *
   * assets/variables.tsv: https://docs.google.com/spreadsheets/d/1BX0m27sVzzd-wtTtDdse__nuTUva6xj_XUW6gK9hsj0/edit#gid=0
   * assets/admissible-values.tsv: https://docs.google.com/spreadsheets/d/1BX0m27sVzzd-wtTtDdse__nuTUva6xj_XUW6gK9hsj0/edit#gid=1512976087
   */
  parseVariables() {
    this.papa.parse('assets/variables.tsv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      quoteChar: '',
      complete: variables => this.variables = variables.data
    });
    this.papa.parse('assets/admissible-values.tsv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      quoteChar: '',
      complete: values => this.admissibleValues = values.data
    });
  }

  /**
   * Load a real example of clinical text for developing purposes only.
   *
   * TODO replace this method with another one that will accept uploaded files from user.
   */
  loadRealExample(exampleNumber: number) {
    this.http.get(`assets/${exampleNumber}.utf8.txt`, { responseType: 'text' }).subscribe(data => this.text = data);
    this.papa.parse(`assets/${exampleNumber}.utf8.ann`, {
      download: true,
      skipEmptyLines: true,
      quoteChar: '',
      complete: results => {
        const spans = results.data.filter((line: string[][]) => line.map((l: string[]) => l[0])[0].startsWith('T'));
        const notes = results.data.filter((line: string[][]) => line.map((l: string[]) => l[0])[0].startsWith('#'));
        spans.forEach((span: string[]) => {
          let foundNotes = notes.find(note => note[1].split(' ')[1] === span[0])
          this.annotations.push({
            id: span[0],
            entity: span[1].split(' ')[0],
            offset: {
              start: Number(span[1].split(' ')[1]),
              end: Number(span[1].split(' ')[2]),
            },
            evidence: span[2],
            notes: foundNotes ? foundNotes[2] : null
          });
        });

        // populate formly model and fields
        this.variables.forEach((variable: Variable) => {

          // find possible annotator notes (normalizable variables), choose evidence otherwise
          let foundAnn = this.annotations.find(ann => ann['entity'] === variable.entity);

          // SPECIAL CASES

          // diagnostico principal
          if (variable.entity === 'Diagnostico_principal') {
            foundAnn = this.annotations.find(ann => ['Ictus_isquemico', 'Ataque_isquemico_transitorio', 'Hemorragia_cerebral'].includes(ann['entity']));
          }

          // etiologia
          if (['etiologiaIctus', 'etiologiaHemorragia'].includes(variable.key)) {
            foundAnn = this.annotations.find(ann => ['Etiologia'].includes(ann['entity']));
          }

          // get value from notes or from evidence in text
          const value = foundAnn?.entity.match('^(Fecha|Hora|Trombolisis|Tiempo|ASPECTS|mRankin|NIHSS).*') ? foundAnn?.notes : foundAnn?.evidence;

          // find its admissible values
          const options = [];
          if (variable.fieldType === 'select') {
            const foundValues = this.admissibleValues.filter(a => a.entity === variable.entity).map(a => a.value);

            // etiologia admissible values depending on diagnostico value
            if (variable.key === 'etiologiaIctus') {

            } else if (variable.key === 'etiologiaHemorragia') {

            }
            variable.admissibleValues = foundValues ? foundValues : [];
            variable.admissibleValues.forEach(value => {
              options.push({ label: value, value: value });
            });
          }

          // initialize the model key (autocompleted form, help for final user)
          this.model[variable.key] = value ? value : null;

          // validators
          let validators = {};
          if (variable.inputType === 'date') {
            validators = {
              date: {
                expression: (c) => !c.value || isValidDate(c.value),
                message: (error, field: FormlyFieldConfig) => `"${field.formControl.value}" no es una fecha válida y/o no tiene el formato YYYY-MM-DD.`,
              },
            }
          } else if (variable.inputType === 'time') {
            validators = {
              time: {
                expression: (c) => !c.value || isValidTime(c.value),
                message: (error, field: FormlyFieldConfig) => `"${field.formControl.value}" no es una hora válida y/o no tiene el formato hh:mm.`,
              },
            }
          }

          // use the javascript spread oprator (...obj) to build the form fields, because pushing a new field object to the fields arary does not work
          this.fields = [
            ...this.fields,
            {
              key: variable.key,
              type: 'input',
              // type: variable.fieldType,
              templateOptions: {
                appearance: 'fill',
                label: variable.label,
                // placeholder: variable.inputType === 'date' ? 'YYYY-MM-DD' : variable.inputType === 'time' ? 'hh:mm' : null,
                // addonLeft: {
                //   icon: 'face',
                // },
                addonRight: {
                  // text: '$',
                  icon: 'edit',
                  onClick: (to, addon, $event) => this.pickedField = addon.key,
                },
                // click: (event) => this.pickedField = event.key,
                // options: options,
              },
              // expressionProperties: {
              //   'templateOptions.disabled': 'true',
              // },
              validators: validators,
            }
          ];

          // select fields for normalizable variables
          if (variable.fieldType === 'select') {
            this.model[`${variable.key}Normalizado`] = value ? value : null;
            this.fields = [
              ...this.fields,
              {
                key: `${variable.key}Normalizado`,
                type: 'select',
                templateOptions: {
                  appearance: 'outline',
                  label: `${variable.label} (normalizable)`,
                  options: options,
                }
              }
            ];
          }

        });
        // console.log('annotations', this.annotations);
        // console.log('model', Object.keys(this.model).length, this.model);
        // console.log('variables', this.variables);
        // console.log('fields', this.fields.length, this.fields);
      }
    });
  }


  /**
   * Update the value of a specific field (the picked field) with an evidence in text.
   */
  updateEvidence(event) {
    const start = event.target.selectionStart;
    const end = event.target.selectionEnd;
    const selection = event.target.value.substr(start, end - start);
    console.log(selection, start, end);

    this.model = { ...this.model, [this.pickedField]: selection };
    this.pickedField = null;
  }

  /**
   * Load a single text file from user.
   */
  loadFile(event) {
    // ONLY txt file
    this.file = event.target.files[0];
    var reader = new FileReader();
    reader.readAsText(this.file);
    reader.onload = () => {
      this.text = reader.result.toString();

      // TODO localstorage with array of files
      // localStorage.setItem(this.file.name, reader.result.toString());
      // this.text = localStorage.getItem('377259358.utf8.txt');
    }
  }

  /**
   * Submit the form completed so far.
   *
   * TODO download the form as a JSON file.
   */
  submit() {
    alert(JSON.stringify(this.model));
  }

}
