import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

import { Papa } from 'ngx-papaparse';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';

import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSheetComponent } from './bottom-sheet/bottom-sheet.component';
import { FieldPickerComponent } from './field-picker/field-picker.component';

import { parseBratAnnotations } from './helpers';
import { Annotation, Variable } from './interfaces';


// TODO highlight all spans offsets
// TODO click field and then change its evidence span
// TODO UX multi field in each line (fecha, hora), (previo, alta)

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  hide: boolean = true;
  currentOffset: string;

  file: File;
  text: string;
  annotations: Annotation[] = [];
  variables: Variable[] = []
  admissibleValues: any[];
  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[] = [];
  pickedField: any;

  constructor(
    private http: HttpClient,
    private papa: Papa,
    private bottomSheet: MatBottomSheet,
  ) { }

  ngOnInit() {
    this.parseVariables();
    this.loadRealExample();
  }

  loadRealExample() {
    this.http.get('assets/321108781.utf8.txt', { responseType: 'text' }).subscribe(data => this.text = data);
    this.papa.parse('assets/321108781.utf8.ann', {
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
        this.variables.forEach((variable: Variable) => {

          // model
          const foundAnn = this.annotations.find(ann => ann['entity'] === variable.entity);

          // match regex strategy (low performance)
          const value = foundAnn?.entity.match('^(Fecha|Hora|Trombolisis|Tiempo|ASPECTS|mRankin|NIHSS).*') ? foundAnn?.notes : foundAnn?.evidence;

          // startsWith string strategy (high performance)
          // const isNormalizable = foundAnn?.entity.startsWith('Fecha')
          //   || foundAnn?.entity.startsWith('Fecha')
          //   || foundAnn?.entity.startsWith('Hora')
          //   || foundAnn?.entity.startsWith('Trombolisis')
          //   || foundAnn?.entity.startsWith('Tiempo')
          //   || foundAnn?.entity.startsWith('ASPECTS')
          //   || foundAnn?.entity.startsWith('mRankin')
          //   || foundAnn?.entity.startsWith('NIHSS')
          // const value = isNormalizable ? foundAnn?.notes : foundAnn?.evidence;

          this.model[variable.key] = value ? value : null;

          // admissible values
          const foundValues = this.admissibleValues.filter(a => a.entity === variable.entity).map(a => a.value);
          variable.admissibleValues = foundValues ? foundValues : [];

          // fields
          this.fields = [
            ...this.fields,
            {
              key: variable.key,
              type: 'input',
              templateOptions: {
                appearance: 'outline',
                label: variable.label,
                click: ($event) => this.pickedField = $event.key
              }
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

  selectSpan(event) {
    const start = event.target.selectionStart;
    const end = event.target.selectionEnd;
    const selection = event.target.value.substr(start, end - start);
    console.log(selection, start, end);

    // console.log(this.model);
    // this.model[this.pickedField] = selection
    // console.log(this.model);

    this.model = { ...this.model, [this.pickedField]: selection };


    // this.field = [
    //   ...this.field,
    //   {
    //     key: this.pickedField,
    //     type: 'input',
    //     templateOptions: {
    //       appearance: 'outline',
    //       // label: variable.label,
    //       click: ($event) => this.pickedField = $event.key
    //     }
    //   }
    // ];

    // (document.getElementById(this.pickedField) as HTMLInputElement).value = selection;
    // this.currentOffset = `(${start}, ${end})`;

    this.pickedField = null;
  }

  openBottomSheet(selection: string): void {
    const bottomSheetRef = this.bottomSheet.open(BottomSheetComponent, {
      data: { fields: this.fields }
    });
    bottomSheetRef.afterDismissed().subscribe(pickedField => this.model = { ...this.model, [pickedField['key']]: selection })
  }

  submit() {
    alert(JSON.stringify(this.model));
  }

  /**
   * Parse variables from the google spreadsheet:
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

  pickField(event) {
    ;
  }

}
