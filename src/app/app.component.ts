import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

import { Papa } from 'ngx-papaparse';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';

import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSheetComponent } from './bottom-sheet/bottom-sheet.component';

import { camelCase, parseBratAnnotations } from './helpers';
import { Annotation } from './annotation';
import { Variable } from './variable';
import { FieldPickerComponent } from './field-picker/field-picker.component';

export interface DialogData {
  title: string;
  fields: string[];
  cancel: string;
  buttonName: string;
  color: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  file: File;
  text: string;
  annPath: string;
  annTsv: string;
  variables: Variable[] = []
  annotations: Annotation[] = [];
  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[] = [];
  pickedField: any;

  constructor(
    private http: HttpClient,
    private papa: Papa,
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
    public dialogRef: MatDialogRef<FieldPickerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.parseVariables();
  }

  loadDemo() {
    this.http.get('assets/lorem.txt', { responseType: 'text' }).subscribe(data => this.text = data);
    this.http.get('assets/lorem.ann', { responseType: 'text' }).subscribe(
      data => this.annTsv = data,
      err => console.error(err),
      () => {
        const parsed = parseBratAnnotations(this.annTsv);
        console.log('suggestions', parsed);

        this.model = {
          time: parsed[0]['notes'],
          date: parsed[1]['notes'],
          firstSection: parsed[2]['span'],
          secondSection: parsed[3]['span'],
          firstEntity: parsed[4]['span'],
          secondEntity: parsed[5]['span'],
        }
        this.fields = [
          {
            key: 'date',
            type: 'input',
            templateOptions: {
              label: 'Date',
            },
          },
          {
            key: 'time',
            type: 'input',
            templateOptions: {
              label: 'Time',
            },
          },
          {
            key: 'firstSection',
            type: 'input',
            templateOptions: {
              label: 'First section',
              disabled: true,
            },
          },
          {
            key: 'firstEntity',
            type: 'input',
            templateOptions: {
              label: 'First entity',
              disabled: true,
            },
          },
          {
            key: 'secondSection',
            type: 'input',
            templateOptions: {
              label: 'Second section',
              disabled: true,
            }
          },
          {
            key: 'secondEntity',
            type: 'input',
            templateOptions: {
              label: 'Second entity',
              disabled: true,
            },
            hideExpression: 'model.firstEntity != "TEMU"',
          },
        ];
      }
    );
  }

  loadRealExample() {
    this.http.get('assets/377259358.utf8.txt', { responseType: 'text' }).subscribe(data => this.text = data);
    this.http.get('assets/377259358.utf8.ann', { responseType: 'text' }).subscribe(
      data => this.annTsv = data,
      err => console.error(err),
      () => {
        const parsed = parseBratAnnotations(this.annTsv);
        console.log('suggestions', parsed);

        this.variables.forEach(v => {
          // this.model[v.variable] = ...;
          this.fields.push({
            key: v.variable,
            type: 'input',
            templateOptions: {
              label: v.originalName
            }
          });
        });

        this.model = {
          horaDeIngreso: parsed[0]['notes'],
          fechaDeIngreso: parsed[1]['notes'],
          diagnosticoPrincipal: parsed[54]['span'],
          vasoCerebralAfectado: parsed[55]['span'],
          lateralizacion: parsed[56]['span'],
        }
        // this.fields = [
        //   {
        //     key: 'horaDeIngreso',
        //     type: 'input',
        //     templateOptions: {
        //       label: 'Hora de ingreso',
        //     },
        //   },
        //   {
        //     key: 'fechaDeIngreso',
        //     type: 'input',
        //     templateOptions: {
        //       label: 'Fecha de ingreso',
        //     },
        //   },
        //   {
        //     key: 'diagnosticoPrincipal',
        //     type: 'input',
        //     templateOptions: {
        //       label: 'Diagnóstico principal',
        //       disabled: true,
        //     }
        //   },
        //   {
        //     key: 'lateralizacion',
        //     type: 'input',
        //     templateOptions: {
        //       label: 'Lateralización',
        //       disabled: true,
        //     },
        //     hideExpression: 'model.diagnosticoPrincipal.toUpperCase() != "ICTUS"',
        //   },
        // ];
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
    // console.log(selection, start, end);

    // this.pickField(selection);
    this.openBottomSheet(selection);
  }

  /**
   * Open a confirmation dialog before performing an action to a given array and optionally apply changes to backend.
   */
  // pickField(selection: string): void {
  //   const dialogRef = this.dialog.open(FieldPickerComponent, {
  //     width: '500px',
  //     data: {
  //       title: selection,
  //       fields: this.fields.map(field => field.key),
  //       cancel: 'Cancel',
  //       buttonName: 'pick',
  //       color: 'primary'
  //     }
  //   })
  //   dialogRef.afterClosed().subscribe(pickedField => this.model = { ...this.model, [pickedField]: selection })
  // }

  openBottomSheet(selection: string): void {
    const bottomSheetRef = this.bottomSheet.open(BottomSheetComponent, {
      data: {
        title: selection,
        fields: this.fields.map(field => field.key),
        cancel: 'Cancel',
        buttonName: 'pick',
        color: 'primary'
      }
    });
    bottomSheetRef.afterDismissed().subscribe(pickedField => this.model = { ...this.model, [pickedField]: selection })
  }

  submit() {
    alert(JSON.stringify(this.model));
  }

  /**
   * Parse variables from the google spreadsheet:
   *
   * variables: https://docs.google.com/spreadsheets/d/1BX0m27sVzzd-wtTtDdse__nuTUva6xj_XUW6gK9hsj0/edit#gid=0
   * admissible values: https://docs.google.com/spreadsheets/d/1BX0m27sVzzd-wtTtDdse__nuTUva6xj_XUW6gK9hsj0/edit#gid=1512976087
   */
  parseVariables() {
    let variablesRaw: any;
    let admissibleValuesRaw: any;
    this.papa.parse('assets/variables.tsv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      quoteChar: '',
      complete: results => variablesRaw = results.data
    });
    this.papa.parse('assets/admissible-values.tsv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      quoteChar: '',
      complete: results => {
        admissibleValuesRaw = results.data;
        variablesRaw.forEach((v: Variable) => {
          const admissibleValues = [];
          admissibleValuesRaw.forEach(a => {
            if (v.variable === a.variable) {
              admissibleValues.push(a.admissibleValue);
            }
          });
          this.variables.push({
            group: v.group,
            originalName: v.variable,
            variable: camelCase(v.variable),
            entity: v.entity,
            cardinality: v.cardinality,
            getValueFrom: v.getValueFrom,
            admissibleValues,
            comments: v.comments,
          });
        });
        console.log('variables', this.variables);

      }
    });
  }

}
