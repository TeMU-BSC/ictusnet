import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { ParsingService } from 'src/app/services/parsing.service';
import { Suggestion, Variable } from 'src/app/interfaces/interfaces';
import { MatAccordion } from '@angular/material/expansion';
import { Papa } from 'ngx-papaparse';
import { downloadObjectAsJson } from 'src/app/helpers/helpers';
import { HttpClient } from '@angular/common/http';

export interface PanelType {
  icon?: string;
  title?: string;
  fields?: FormlyFieldConfig[];
}

@Component({
  selector: 'app-expansion',
  templateUrl: './expansion.component.html',
  styleUrls: ['./expansion.component.scss']
})
export class ExpansionComponent implements OnInit {

  // core atrtibutes
  file: File;
  text: string;
  suggestions: Suggestion[];
  pickedField: any;  // update evidence on this.model[pickedField]
  downloadFilename: string;

  // formly
  model = {};
  panels: PanelType[] = [];
  form = new FormArray(this.panels.map(() => new FormGroup({})));
  options = this.panels.map(() => <FormlyFormOptions>{});

  // expansion panel
  @ViewChild(MatAccordion) accordion: MatAccordion;
  expandedStep: number = 0;
  setStep(index: number) { this.expandedStep = index }
  nextStep() { this.expandedStep++ }
  prevStep() { this.expandedStep-- }

  // visual icons next to panel section titles
  icons = {
    'Entrada y salida del paciente': 'airport_shuttle',
    'Diagnóstico': 'local_hospital',
    'Procedimientos y pruebas': 'healing',
    'Tratamientos y escalas de valoración': 'analytics',
    // 'Tratamientos': 'local_pharmacy',
    // 'Escalas': 'analytics',
  };

  constructor(
    private http: HttpClient,
    private papa: Papa,
    private parser: ParsingService
  ) { }

  ngOnInit(): void {
    // reset the model and the fields
    this.model = {};
    this.panels = [];

    // const exampleNumber = 321108781;
    const exampleNumber = 321687159;

    this.downloadFilename = `${exampleNumber}.json`;
    this.http.get(`assets/${exampleNumber}.utf8.txt`, { responseType: 'text' }).subscribe(data => this.text = data);
    this.suggestions = this.parser.getSuggestionsFromFile(`${exampleNumber}.utf8.ann`);

    // variables spreadsheet
    this.papa.parse('assets/variables.tsv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: resultsFromVariables => {
        const variables: Variable[] = resultsFromVariables.data;

        // admissible values spreadsheet
        this.papa.parse('assets/admissibles.tsv', {
          download: true,
          header: true,
          skipEmptyLines: true,
          complete: resultsFromAdmissibles => {
            const admissibles: any[] = resultsFromAdmissibles.data
            const sections = new Set(variables.map(v => v.section));
            const groups = new Set(variables.map(v => v.group));

            variables.forEach(v => {

              // assign the admissible values to each variable
              v.admissibles = admissibles.filter(a => v.entity.startsWith(a.entity)).map(a => ({ value: a.value, comment: a.comment }));

              // initialize all model keys to null
              this.model = {...this.model, ...{ [v.key]: null }};

              // populate expansion panels with icons, titles and fields
              // ...


            });

            // populate expansion panels with icons, titles and fields
            sections.forEach(section => {

              /////// WIP ////////
              // const fieldGroup: FormlyFieldConfig[] = [];
              // const groups = new Set(variables.map(v => v.group));
              // groups.forEach(group => {
              //   variables.forEach((variable, index) => {
              //     const options = variable.admissibles.map(a => ({ value: a.value, label: a.value }));
              //     if (variable.section === section && variable.group === group) {
              //       if (index === 0) {
              //         fieldGroup.push(
              //           { template: `${variable.group}` },
              //           {
              //             type: 'flex-layout',
              //             templateOptions: {
              //               fxLayout: 'row',
              //               fxLayoutGap: '1rem',
              //               fxLayoutAlign: 'space-between center',
              //             },
              //             fieldGroup: []
              //           }
              //         );
              //       }
              //       fieldGroup.push({
              //         type: 'flex-layout',
              //         templateOptions: {
              //           fxLayout: 'row',
              //           fxLayoutGap: '1rem',
              //           fxLayoutAlign: 'space-between center',
              //         },
              //         fieldGroup: [
              //           {
              //             key: `${variable.key}`,
              //             type: variable.fieldType,
              //             templateOptions: {
              //               type: variable.inputType,
              //               appearance: 'outline',
              //               label: variable.label,
              //               multiple: variable.cardinality === 'n',
              //               placeholder: variable.inputType === 'date' ? 'YYYY-MM-DD' : variable.inputType === 'time' ? 'hh:mm' : null,
              //               options: options,
              //               addonRight: {
              //                 icon: 'edit',
              //                 onClick: (to, addon, $event) => this.pickedField = addon.key,
              //               },
              //               mouseenter: (event) => console.log(event),
              //               keypress: (event) => console.log(event),
              //             },
              //             // expressionProperties: {
              //             //   'templateOptions.disabled': `!model.${variable.key}Evidencia`,
              //             // },
              //           }
              //         ]
              //       });

              //     }
              //   });
              // });


              // WORKS OK

              const fields: FormlyFieldConfig[] = [];
              variables.forEach(variable => {

                if (variable.section === section) {
                  const options = variable.admissibles.map(a => ({ value: a.value, label: a.value }));

                  // add form field in its section
                  fields.push(
                    {
                      type: 'flex-layout',
                      templateOptions: {
                        fxLayout: 'row',
                        fxLayoutGap: '1rem',
                        fxLayoutAlign: 'space-between center',
                      },
                      fieldGroup: [
                        {
                          key: `${variable.key}`,
                          type: variable.fieldType,
                          templateOptions: {
                            type: variable.inputType,
                            appearance: 'outline',
                            label: variable.label,
                            multiple: variable.cardinality === 'n',
                            placeholder: variable.inputType === 'date' ? 'YYYY-MM-DD' : variable.inputType === 'time' ? 'hh:mm' : null,
                            options: options,
                            addonRight: {
                              icon: 'edit',
                              // icon2: 'search',
                              // onClick: (to, addon, $event) => this.pickedField = addon.key,
                            },
                            click: (event) => this.pickedField = event.key,
                          },
                          // expressionProperties: {
                          //   'templateOptions.disabled': `!model.${variable.key}Evidencia`,
                          // },
                        }
                      ]
                    }
                  );

                  // autofill each field with the first found suggestion
                  let sugg: Suggestion;
                  let autofillValue: string | string[];

                  // normal cases like dates, times and integers
                  sugg = this.suggestions.find(sugg => sugg.entity === variable.entity);
                  autofillValue = sugg?.notes;

                  // special cases
                  // select fields that accept only one value
                  if (variable.entity === 'Diagnostico_principal') {
                    sugg = this.suggestions.find(sugg => [
                      'Ictus_isquemico',
                      'Ataque_isquemico_transitorio',
                      'Hemorragia_cerebral'
                    ].includes(sugg.entity));
                    autofillValue = sugg ? options.find(option => option.value.startsWith(sugg.entity.toLowerCase().split('_')[0])).value : null;
                  }
                  // select fields that accept multiple values
                  else if (['Arteria_afectada', 'Localizacion'].includes(variable.entity)) {
                    autofillValue = options.filter(option => option.value.match(sugg.evidence)).map(option => option.value);
                  }

                  // update the model
                  this.model[variable.key] = autofillValue;

                  // option 2 with spread operator
                  // const data = { [variable.key]: autofillValue }
                  // this.model = { ...this.model, ...data };

                }
              });

              // use the javascript spread oprator (...obj) to build the form fields, because pushing a new field object to the fields arary does not work
              this.panels = [
                ...this.panels,
                {
                  icon: this.icons[section],
                  title: section,
                  fields: fields,
                }
              ];



            });
          }


        });
        console.log('variables', variables);

      }
    });
    console.log('suggestions', this.suggestions);

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

  confirmReset() {
    if (confirm('Estás a punto de restablecer el formulario a su estado inicial, perdiendo todo el progreso hasta ahora.')) {
      // this.options.resetModel();  // does not work on multi-step forms
      this.ngOnInit();  // it doesn not work neither :(
    }
  }

  /**
   * Download the form completed so far as a JSON file.
   */
  download() {
    const pick = (o: any, keys: string[]) => {
      return keys.reduce((a, x) => {
        if (o.hasOwnProperty(x)) a[x] = o[x];
        return a;
      }, {});
    }
    const exportable = pick(this.model, Object.keys(this.model));
    downloadObjectAsJson(exportable, this.downloadFilename);
  }

}
