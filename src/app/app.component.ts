import { Component, OnInit } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { camelCase, parseBratAnnotations } from './helpers';
import { Annotation } from './annotation';
import { Variable } from './variable';
import { HttpClient } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { DialogComponent } from 'src/app/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  file: File;
  text: string;
  annPath: string = 'assets/lorem.ann';
  variables: Variable[] = []
  annotations: Annotation[] = [];
  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'date',
      type: 'input',
      templateOptions: {
        label: 'Date',
        // disabled: true,
      },
    },
    {
      key: 'time',
      type: 'input',
      templateOptions: {
        label: 'Time',
        // disabled: true,
      },
    },
    // {
    //   key: 'firstSection',
    //   type: 'input',
    //   templateOptions: {
    //     label: 'First section',
    //     disabled: true,
    //   },
    // },
    {
      key: 'firstEntity',
      type: 'input',
      templateOptions: {
        label: 'First entity',
        disabled: true,
      },
    },
    // {
    //   key: 'secondSection',
    //   type: 'input',
    //   templateOptions: {
    //     label: 'Second section',
    //     disabled: true,
    //   }
    // },
    {
      key: 'secondEntity',
      type: 'input',
      templateOptions: {
        label: 'Second entity',
        disabled: true,
      }
    },
    // {
    //   key: 'diagnosticoPrincipal',
    //   type: 'input',
    //   templateOptions: {
    //     label: 'Diagnóstico principal',
    //   },
    //   hideExpression: 'model.diagnosticoPrincipal != "ICTUS"',
    // },
    // {
    //   key: 'lateralizacion',
    //   type: 'input',
    //   templateOptions: {
    //     label: 'Lateralización',
    //   },
    // },
  ];

  constructor(
    private http: HttpClient,
    private papa: Papa,
    public dialog: MatDialog,
  ) { }

  loadFile(event) {
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

    this.pickField(selection);
  }

  /**
   * Open a confirmation dialog before performing an action to a given array and optionally apply changes to backend.
   */
  pickField(selection: string): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        title: selection,
        fields: this.fields.map(field => field.key),
        cancel: 'Cancel',
        buttonName: 'pick',
        color: 'primary'
      }
    })
    dialogRef.afterClosed().subscribe(pickedField => this.model = { ...this.model, [pickedField]: selection })
  }

  getSuggestions() {
    let annTsv: string;
    this.http.get(this.annPath, { responseType: 'text' }).subscribe(
      data => annTsv = data,
      err => console.error(err),
      () => {
        const parsed = parseBratAnnotations(annTsv);
        // console.log('parsed annotations', parsed);

        // TODO replace hardcode
        this.model = {
          time: parsed[0]['notes'],  // 1
          date: parsed[1]['notes'],  // 1
          firstSection: parsed[2]['span'],
          secondSection: parsed[3]['span'],
          firstEntity: parsed[4]['span'],
          secondEntity: parsed[5]['span'],

          // firstSection: `${parsed[2]['span']} (offset: ${parsed[2]['offset']['start']} ${parsed[2]['offset']['end']})`,  // 1
          // secondSection: `${parsed[3]['span']} (offset: ${parsed[3]['offset']['start']} ${parsed[3]['offset']['end']})`,  // 1
          // firstEntity: `${parsed[4]['span']} (offset: ${parsed[4]['offset']['start']} ${parsed[4]['offset']['end']})`,  // 1
          // secondEntity: `${parsed[5]['span']} (offset: ${parsed[5]['offset']['start']} ${parsed[5]['offset']['end']})`,  // 1

          // diagnosticoPrincipal: parsed[54]['span'],  // 1
          // vasoCerebralAfectado: parsed[55]['span'],  // n
          // lateralizacion: parsed[56]['span'],  // 1
          // etiologiaIctus: parsed[?][?]
        }
      }
    );
  }

  submit() {
    alert(JSON.stringify(this.model));
  }

  ngOnInit() {
    this.http.get('assets/lorem.txt', { responseType: 'text' }).subscribe(data => this.text = data);
    this.getSuggestions();

    // parse the form tsv on google drive (2 sheets):

    let variablesData: any;
    let admissibleValuesData: any;

    // https://docs.google.com/spreadsheets/d/1BX0m27sVzzd-wtTtDdse__nuTUva6xj_XUW6gK9hsj0/edit#gid=0
    this.papa.parse('assets/variables.tsv', {
      download: true,
      header: true,
      // delimiter: '\t',
      skipEmptyLines: true,
      quoteChar: '',
      complete: results => variablesData = results.data
    });

    // https://docs.google.com/spreadsheets/d/1BX0m27sVzzd-wtTtDdse__nuTUva6xj_XUW6gK9hsj0/edit#gid=1512976087
    this.papa.parse('assets/admissible-values.tsv', {
      download: true,
      header: true,
      // delimiter: '\t',
      skipEmptyLines: true,
      quoteChar: '',
      complete: results => {
        admissibleValuesData = results.data;

        // build the variables list
        const variablesObj = {};
        variablesData.forEach((v: Variable) => {
          const admissibleValues = [];
          admissibleValuesData.forEach(a => {
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

          // variablesObj[camelCase(v.variable)] = {
          //   group: v.group,
          //   originalName: v.variable,
          //   cardinality: v.cardinality,
          //   getValueFrom: v.getValueFrom,
          //   admissibleValues,
          //   comments: v.comments,
          // };
        });

        // console.log(this.variables);
        // console.log(variablesObj);
      }
    });

  }

}
