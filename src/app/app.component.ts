import { Component, OnInit, Inject } from '@angular/core';
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
// TODO UX multi field in each line (fecha + hora)
// TODO UX multi field in each line (previo + alta)

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  file: File;
  text: string;
  annotations: Annotation[];
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
    this.http.get('assets/377259358.utf8.txt', { responseType: 'text' }).subscribe(data => this.text = data);
    this.http.get('assets/377259358.utf8.ann', { responseType: 'text' }).subscribe(
      data => {
        this.annotations = parseBratAnnotations(data);
        this.variables.forEach((variable: Variable) => {

          // model
          const foundAnn = this.annotations.find(ann => ann['entity'] === `_SUG_${variable.entity}`);
          this.model[variable.key] = foundAnn ? foundAnn['span'] : null;

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
                label: variable.label
              }
            }
          ];

        });
        // console.log('annotations', this.annotations);
        // console.log('model', Object.keys(this.model).length, this.model);
        // console.log('variables', this.variables);
        // console.log('fields', this.fields.length, this.fields);

      }
    );
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

    // this.pickField(selection);
    this.openBottomSheet(selection);
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

}
