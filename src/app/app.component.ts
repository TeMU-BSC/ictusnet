import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { Papa } from 'ngx-papaparse';
import { CartService } from './dynamic-form/cart.service';
import { camelCase, parseBratAnnotations } from './helpers';
import { Annotation } from './annotation';
import { Variable } from './variable';

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


  // items;
  // checkoutForm;

  constructor(
    private http: HttpClient,
    private papa: Papa,
    // private cartService: CartService,
    // private formBuilder: FormBuilder,
  ) {
    // this.checkoutForm = this.formBuilder.group({
    //   name: '',
    //   address: ''
    // });
  }

  ngOnInit() {
    // this.items = this.cartService.getItems();


    this.http.get('assets/pipeline/input/377259358.utf8.txt', { responseType: 'text' }).subscribe(data => this.text = data);
    // this.http.get('assets/document.ann', { responseType: 'text' }).subscribe(data => this.annTsv = data);
    this.http.get('assets/pipeline/output/377259358.utf8.ann', { responseType: 'text' }).subscribe(data => this.annTsv = data);

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

        console.log(this.variables);
        // console.log(variablesObj);
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

  showAnnotations() {
    this.annotations = parseBratAnnotations(this.annTsv);
    console.log(this.annotations);

  }

  // onSubmit(customerData) {
  //   // Process checkout data here
  //   this.items = this.cartService.clearCart();
  //   this.checkoutForm.reset();

  //   console.warn('Your order has been submitted', customerData);
  // }

}
