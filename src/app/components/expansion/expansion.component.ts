import { Component, OnInit, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
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
  styleUrls: ['./expansion.component.scss'],
})
export class ExpansionComponent implements OnInit {

  // core atrtibutes
  file: File;
  text: string;
  suggestions: Suggestion[];
  focusedField: any;  // update evidence on this.model[focusedField]
  downloadFilename: string;

  // formly
  model: any = {};
  panels: PanelType[] = [];
  form: FormArray = new FormArray(this.panels.map(() => new FormGroup({})));
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
    // this.loadFile('321108781');
    this.loadFile('321687159');
  }

  /**
   * Load a single text file from user.
   */
  loadFile(fileId: string) {
    // TESTING
    this.downloadFilename = `${fileId}.json`;
    this.http.get(`assets/${fileId}.utf8.txt`, { responseType: 'text' }).subscribe(data => this.text = data);
    this.parser.getSuggestionsFromFile(`${fileId}.utf8.ann`).subscribe(data => {
      this.suggestions = data;
      this.papa.parse('assets/variables.tsv', {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: parsedVariables => {
          const variables: Variable[] = parsedVariables.data;
          this.papa.parse('assets/admissibles.tsv', {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: parsedAdmissibles => {
              const admissibles: any[] = parsedAdmissibles.data;
              variables.forEach(v => {
                v.admissibles = admissibles.filter(a => v.entity.startsWith(a.entity)).map(a => ({ value: a.value, comment: a.comment }));
                this.autofillSuggestions(v);
              });
              const sections = new Set(variables.map(v => v.section));
              sections.forEach(section => {
                const panel = this.createPanel(section, this.generatePanelFields(section, variables));
                this.panels = [...this.panels, panel]
              });
            }
          });
          console.log('variables', variables);

        }
      });
      console.log('suggestions', this.suggestions);

    });

    // ONLY txt file !Remember to pass the event as parameter ;)
    // this.file = event.target.files[0];
    // var reader = new FileReader();
    // reader.readAsText(this.file);
    // reader.onload = () => {
    //   this.text = reader.result.toString();

    //   TODO localstorage with array of files
    //   localStorage.setItem(this.file.name, reader.result.toString());
    //   this.text = localStorage.getItem('377259358.utf8.txt');

    // }
  }

  createPanel(section: string, panelFields: FormlyFieldConfig[]): PanelType {
    return {
      icon: this.icons[section],
      title: section,
      fields: panelFields,
    }
  }

  generatePanelFields(section: string, allVariables: Variable[]): FormlyFieldConfig[] {
    const panelVariables = allVariables.filter(v => v.section === section);
    const fields = panelVariables.map(variable => ({
      key: variable.key,
      type: variable.fieldType,
      templateOptions: {
        type: variable.inputType,
        appearance: 'outline',
        label: variable.label,
        multiple: variable.cardinality === 'n',
        options: variable.admissibles.map(a => ({ value: a.value, label: a.value })),
        focus: (field, event) => this.focusedField = field.key,
        // custom properties
        suggestions: this.suggestions.filter(sugg => variable.entity.startsWith(sugg.entity)),
        addonRight: {
          icon: 'search',
          onClick: (to, addon, event) => this.mark(this.text, to.suggestions),
        },
      },
    }));
    return fields;
  }

  /**
   * Autofill the form fields with suggestions.
   */
  autofillSuggestions(variable: Variable) {
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
      autofillValue = sugg ? variable.admissibles.find(a => a.value.startsWith(sugg.entity.toLowerCase().split('_')[0])).value : null;
    }
    // select fields that accept multiple values
    else if (['Arteria_afectada', 'Localizacion'].includes(variable.entity)) {
      autofillValue = variable.admissibles.filter(a => a.value.match(sugg.evidence)).map(a => a.value);
    }

    // update the model
    this.model[variable.key] = autofillValue;
  }

  mark(text: string, suggestions: Suggestion[]) {
    suggestions.forEach(sugg => {
      let element = document.getElementById('text');
      let str = text;
      let start = sugg.offset.start;
      let end = sugg.offset.end;
      str = str.substr(0, start) +
      '<mark>' +
      str.substr(start, end - start + 1) +
      '</mark>' +
      str.substr(end + 1);
      element.innerHTML = str;
    });
  }

  /**
   * Update the value of a specific field (the picked field) with an evidence in text.
   */
  updateEvidence() {
    const selection = window.getSelection();
    const evidence = selection.toString();
    const range = selection.getRangeAt(0);
    const start = range.startOffset;
    const end = range.endOffset;
    if (evidence) {
      this.model = { ...this.model, [this.focusedField]: evidence };
      this.focusedField = null;
      console.log(evidence, start, end);

    }
  }

  confirmReset() {
    // if (confirm('Estás a punto de restablecer el formulario a su estado inicial, perdiendo todo el progreso hasta ahora.')) {
    //   this.model = {};
    //   this.panels = [];
    //   this.ngOnInit();
    // }

    console.log(this.panels);

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

  // list = ['potatoe', 'banana', 'grapes'];
  // hoverIndex: number;
  // enter(i) {
  //   this.hoverIndex = i;
  // }
  // leave(i) {
  //   this.hoverIndex = null;
  // }

  // iconVisible = false;
  // showIcon(event) {
  //   this.iconVisible = true;
  //   console.log(event);
  //   event.target.lastElementChild.style = "background-color: blue;";
  // }
  // hideIcon(event) {
  //   this.iconVisible = false;
  //   console.log(event);
  // }

  // @ViewChildren('expansionPanel') expansionPanels: QueryList<ElementRef>
  // allExpanded(): boolean | null {
  //   return this.expansionPanels ? this.expansionPanels['_results'].every(r => r._expanded) : null;
  // }
  // allCollapsed(): boolean| null {
  //   return this.expansionPanels ? this.expansionPanels['_results'].every(r => !r._expanded) : null;
  // }

}
