import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

import { Papa } from 'ngx-papaparse';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';

import { Annotation, Variable } from 'src/app/interfaces/interfaces';
import { downloadObjectAsJson } from 'src/app/helpers/helpers';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';

// highlight all spans offsets
// https://markjs.io/ + https://www.npmjs.com/package/ngx-markjs
// https://www.npmjs.com/package/angular-text-input-highlight

// TODO mini-popup https://stackoverflow.com/questions/48643994/get-text-selecthighlight-position-and-string

@Component({
  selector: 'app-dynamic',
  templateUrl: './dynamic.component.html',
  styleUrls: ['./dynamic.component.scss']
})
export class DynamicComponent implements OnInit {

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
  fields: FormlyFieldConfig[] = [];

  // update evidence on
  pickedField: any;

  // download
  downloadFilename: string;
  downloadLink: SafeUrl;

  // addHighlight(annotation: Annotation): void {
  //   const regexp = RegExp(annotation.evidence, 'g');
  //   let match: RegExpExecArray;
  //   while ((match = regexp.exec(this.text))) {
  //     if (match.index === annotation.offset.start && regexp.lastIndex === annotation.offset.end) {
  //       this.tags.push({
  //         indices: {
  //           start: annotation.offset.start,
  //           end: annotation.offset.end
  //         },
  //         data: annotation.evidence
  //       });
  //     }
  //   }
  // }

  // addDarkClass(elm: HTMLElement) {
  //   if (elm.classList.contains('bg-blue')) {
  //     elm.classList.add('bg-blue-dark');
  //   } else if (elm.classList.contains('bg-pink')) {
  //     elm.classList.add('bg-pink-dark');
  //   }
  // }

  // removeDarkClass(elm: HTMLElement) {
  //   elm.classList.remove('bg-blue-dark');
  //   elm.classList.remove('bg-pink-dark');
  // }

  constructor(
    private http: HttpClient,
    private papa: Papa,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.parseVariables();
    this.loadRealExample(321108781);
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
      complete: variables => this.variables = variables.data
    });
    this.papa.parse('assets/admissible-values.tsv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: values => this.admissibleValues = values.data
    });
  }

  /**
   * Load a real example of clinical text for developing purposes only.
   *
   * TODO replace this method with another one that will accept uploaded files from user.
   */
  loadRealExample(exampleNumber: number) {
    this.downloadFilename = `${exampleNumber}.json`;
    this.http.get(`assets/${exampleNumber}.utf8.txt`, { responseType: 'text' }).subscribe(data => this.text = data);
    this.papa.parse(`assets/${exampleNumber}.utf8.ann`, {
      download: true,
      skipEmptyLines: true,
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

        // highlight the annotated offsets (add tags)
        // this.annotations.forEach((ann: Annotation) => this.addHighlight(ann));

        // populate formly model and fields
        this.variables.forEach((variable: Variable, index: number) => {

          // initialize all model keys to null
          this.model[variable.key] = null;

          if ([0, 7, 13, 29].includes(index)) {
            this.fields = [
              ...this.fields,
              {
                template: `<div><strong>${variable.group}</div></strong><hr>`
              }
            ];
          }

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
          // const value = foundAnn?.entity.match('^(Fecha|Hora|Trombolisis|Tiempo|ASPECTS|mRankin|NIHSS).*') ? foundAnn?.notes : foundAnn?.evidence;

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

          // autofill some select fields
          if (foundAnn && variable.entity === 'Diagnostico_principal') {
            foundAnn.notes = options.find(option => option.value.startsWith(foundAnn.entity.toLowerCase().split('_')[0])).value;
            this.model[`${variable.key}Evidencia`] = foundAnn ? foundAnn.evidence : null;
            this.model[`${variable.key}`] = foundAnn ? foundAnn.notes : null;
          } else if (foundAnn && ['Arteria_afectada', 'Localizacion'].includes(variable.entity)) {
            const autofillValues = options.filter(option => option.value.match(foundAnn.evidence)).map(option => option.value);
            this.model[`${variable.key}Evidencia`] = foundAnn ? foundAnn.evidence : null;
            this.model[`${variable.key}`] = autofillValues;
          } else if (foundAnn && variable.entity === 'Lateralizacion') {
            foundAnn.notes = options.find(option => option.value.match(foundAnn.evidence)).value;
            this.model[`${variable.key}Evidencia`] = foundAnn ? foundAnn.evidence : null;
            this.model[`${variable.key}`] = foundAnn ? foundAnn.notes : null;
          } else {
            this.model[`${variable.key}Evidencia`] = foundAnn ? foundAnn.evidence : null;
            this.model[`${variable.key}`] = foundAnn ? foundAnn.notes : null;
          }

          // use the javascript spread oprator (...obj) to build the form fields, because pushing a new field object to the fields arary does not work
          this.fields = [
            ...this.fields,
            {
              template: `${variable.label}`
            },
            {
              type: 'flex-layout',
              templateOptions: {
                fxLayout: 'row',
                fxLayoutGap: '1rem',
                fxLayoutAlign: 'space-between center',
              },
              fieldGroup: [

                // field for the evidence value
                {
                  key: `${variable.key}Evidencia`,
                  type: 'input',
                  templateOptions: {
                    appearance: 'fill',
                    label: 'Evidencia en el texto',
                    addonRight: {
                      icon: 'edit',
                      onClick: (to, addon, $event) => this.pickedField = addon.key,
                    },
                  },
                  expressionProperties: {
                    'templateOptions.disabled': 'true',
                  },
                },

                // field for the normalized value
                {
                  key: `${variable.key}`,
                  type: variable.fieldType,
                  templateOptions: {
                    type: variable.inputType,
                    appearance: 'outline',
                    label: 'Valor normalizado',
                    multiple: variable.cardinality === 'n',
                    placeholder: variable.inputType === 'date' ? 'YYYY-MM-DD' : variable.inputType === 'time' ? 'hh:mm' : null,
                    options: variable.fieldType === 'select' ? options : null,
                  },
                  expressionProperties: {
                    'templateOptions.disabled': `!model.${variable.key}Evidencia`,
                  },
                }
              ],
            }
          ];

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
  updateEvidence() {

    // div approach
    const selection = window.getSelection();
    const evidence = selection.toString();
    const range = selection.getRangeAt(0);
    const start = range.startOffset;
    const end = range.endOffset;
    if (evidence) {
      this.model = { ...this.model, [this.pickedField]: evidence };
      this.pickedField = null;
      console.log(evidence, start, end);

    }

    // input/textarea approach
    // const selection = event.target.value;
    // const evidence = selection.substr(start, end - start);
    // const start = event.target.selectionStart;
    // const end = event.target.selectionEnd;
    // this.model = { ...this.model, [this.pickedField]: evidence };
    // this.pickedField = null;
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
   * Download the form completed so far as a JSON file.
   */
  submit() {
    const pick = (o: any, keys: string[]) => {
      return keys.reduce((a, x) => {
        if (o.hasOwnProperty(x)) a[x] = o[x];
        return a;
      }, {});
    }
    const normalizableKeys = Object.keys(this.model).filter(key => !(/Evidencia$/.test(key)));
    const exportable = pick(this.model, normalizableKeys);

    downloadObjectAsJson(exportable, this.downloadFilename);

  }

}
