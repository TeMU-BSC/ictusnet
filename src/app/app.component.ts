import { Component, OnInit } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { camelCase } from './helpers';
import { Annotation } from './annotation';
import { Variable } from './variable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'ictusnet';

  annTsv: string;
  annotations: Annotation[] = [];

  // annotations testing
  id = 0;
  entity = 'ENTITY_PLACEHOLDER';
  notes = 'AnnotatorNotes';
  note = 'This is some note';
  annPreview: string;
  savedSingleAnnotation: string;

  variables: Variable[] = [];
  admissibleValues: any;

  constructor(
    private papa: Papa,
  ) { }

  ngOnInit() {
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
