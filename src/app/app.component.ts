import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Papa } from 'ngx-papaparse';

export interface Annotation {
  id: string;
  category: string;
  offset: {
    start: number;
    end: number;
  };
  span: string;
}

export interface Variable {
  group: string;
  variable: string;
  cardinality: string;
  getValueFrom: string;
  admissibleValues: string[];
  comments: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'ictusnet';

  text: string;
  annTsv: string;
  annotations: Annotation[] = [];

  selection: Selection;
  selectedText: string;
  start: number;
  end: number;

  // annotations testing
  id = 0;
  category = 'CATEGORY_PLACEHOLDER';
  notes = 'AnnotatorNotes';
  note = 'This is some note';
  annPreview: string;
  savedSingleAnnotation: string;

  variables: Variable[] = [];
  admissibleValues: any;

  constructor(private http: HttpClient, private papa: Papa) { }

  ngOnInit() {
    this.http.get('assets/document.txt', { responseType: 'text' }).subscribe(data => this.text = data);
    this.http.get('assets/document.ann', { responseType: 'text' }).subscribe(data => this.annTsv = data);

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
        variablesData.forEach((v: Variable) => {
          const admissibleValues = [];
          admissibleValuesData.forEach(a => {
            if (v.variable === a.variable) {

              console.log(v.variable, a.variable);

              admissibleValues.push(a.admissibleValue);
            }
          });
          this.variables.push({
            group: v.group,
            variable: v.variable,
            cardinality: v.cardinality,
            getValueFrom: v.getValueFrom,
            admissibleValues,
            comments: v.comments,
          });
        });

        console.log(this.variables);
      }
    });




  }

  showSelection() {
    if (window.getSelection().toString()) {
      this.selection = window.getSelection();
      this.selectedText = this.selection.toString();
      this.start = this.selection.getRangeAt(0).startOffset;
      this.end = this.selection.getRangeAt(0).endOffset;
      this.annPreview = `T${this.id}\t${this.category}\t${this.start} ${this.end}\t${this.selectedText}\n` +
        `#${this.id}\t${this.notes} T${this.id}\t${this.note}`;
    }

    console.log(this.variables);
    console.log(this.admissibleValues);
  }

  saveAnn() {
    this.savedSingleAnnotation = this.annPreview;
  }

  /**
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Ranges
   */
  parseAnn() {
    const regex = /^(T\d)\t(\w+)\t((\d+) (\d+))\t(.*)$/gm;
    let match: RegExpExecArray;
    while ((match = regex.exec(this.annTsv)) !== null) {
      this.annotations.push({
        id: match[1],
        category: match[2],
        offset: {
          start: Number(match[4]),
          end: Number(match[5]),
        },
        span: match[6]
      });
    }
  }

}
