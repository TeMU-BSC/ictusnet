import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormArray, FormGroup } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { Papa } from 'ngx-papaparse';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';

import { ParsingService } from 'src/app/services/parsing.service';
import { Suggestion, Variable } from 'src/app/interfaces/interfaces';
import { downloadObjectAsJson } from 'src/app/helpers/helpers';
import Mark from 'mark.js';

// TODO autoscroll to first match
// TODO https://js.devexpress.com/Demos/WidgetsGallery/Demo/ContextMenu/Basics/Angular/Light/

export interface PanelType {
  icon?: string;
  title?: string;
  groups?: FormlyFieldConfig[];
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
  focusedField: any;
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
  panelIcons = {
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
    this.downloadFilename = `${fileId}.json`;

    this.http.get(`assets/${fileId}.utf8.txt`, { responseType: 'text' }).subscribe(data => this.text = data);
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
              this.panels = [...this.panels, ...this.getPanels(variables, this.suggestions)];
            }
          });
        }
      });
    });
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
      sugg = this.suggestions.find(sugg => ['Ictus_isquemico', 'Ataque_isquemico_transitorio', 'Hemorragia_cerebral'].includes(sugg.entity));
      autofillValue = sugg ? variable.admissibles.find(a => a.value.startsWith(sugg.entity.toLowerCase().split('_')[0])).value : null;
    }
    // select fields that accept multiple values
    else if (['Arteria_afectada', 'Localizacion'].includes(variable.entity)) {
      autofillValue = variable.admissibles.filter(a => a.value.match(sugg.evidence)).map(a => a.value);
    }

    // update the model
    this.model[variable.key] = autofillValue;
  }

  /**
   * Hishlight, in the text with class `className`, the offsets present in the given suggestions.
   * Note: Requires an HTML element with the given `className` to exist.
   *
   * https://markjs.io/#markranges
   * https://jsfiddle.net/julmot/hexomvbL/
   *
   */
  highlight(suggestions: Suggestion[], className: string) {
    const instance = new Mark(`.${className}`);
    const ranges = suggestions.map(sugg => ({ start: sugg.offset.start, length: sugg.offset.end - sugg.offset.start }));
    const options = {
      "each": (element: HTMLElement, range) => setTimeout(() => element.classList.add("animate"), 250)
    };
    instance.unmark({
      done: () => instance.markRanges(ranges, options)
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
    }
  }

  confirmReset() {
    if (confirm('Estás a punto de restablecer el formulario a su estado inicial, perdiendo todo el progreso hasta ahora.')) {
      this.model = {};
      this.panels = [];
      this.ngOnInit();
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

  list = ['potatoe', 'banana', 'grapes'];
  hoveredIndex: number;
  clickedIndex: number;
  enter(i) {
    this.hoveredIndex = i;
  }
  leave(i) {
    this.hoveredIndex = null;
  }
  click(i) {
    this.clickedIndex = i;
  }

  getPanels(allVariables: Variable[], allSuggestions: Suggestion[]): PanelType[] {
    const panels: PanelType[] = [];
    new Set(allVariables.map(v => v.section)).forEach(sectionName => {
      const sectionVariables = allVariables.filter(v => v.section === sectionName);
      const groups: FormlyFieldConfig[] = [];
      new Set(sectionVariables.map(v => v.group)).forEach(groupName => {
        const groupVariables = allVariables.filter(v => v.group === groupName);
        const fields: FormlyFieldConfig[] = [];
        groupVariables.filter(v => v.group === groupName).forEach(variable => {
          const field = this.getField(variable, this.suggestions);
          fields.push(field);
        });
        const group = this.getGroup(groupName, fields);
        groups.push(group);
      });
      const panel = this.getPanel(sectionName, groups);
      panels.push(panel);
    });
    return panels;
  }

  getPanel(sectionName: string, groups: FormlyFieldConfig[]): PanelType {
    const panel: PanelType = {
      icon: this.panelIcons[sectionName],
      title: sectionName,
      groups: groups,
    };
    return panel;
  }

  getGroup(groupName: string, fieldGroup: FormlyFieldConfig[]): FormlyFieldConfig {
    const group: FormlyFieldConfig = {
      type: 'flex-layout',
      templateOptions: {
        fxLayout: 'column',
      },
      fieldGroup: [
        {
          template: `<p>${groupName}</p>`
        },
        {
          type: 'flex-layout',
          templateOptions: {
            fxLayout: 'row',
            fxLayoutGap: '0.5rem',
            // fxLayoutAlign: 'start start',
          },
          fieldGroup: []
        }
      ]
    }
    fieldGroup.forEach(field => group.fieldGroup[1]['fieldGroup']?.push(field));
    return group;
  }

  getField(variable: Variable, allSuggestions: Suggestion[]): FormlyFieldConfig {
    let variableSuggestions = allSuggestions.filter(sugg => variable.entity.startsWith(sugg.entity));
    if (variable.entity === 'Diagnostico_principal') {
      variableSuggestions = allSuggestions.filter(sugg => ['Ictus_isquemico', 'Ataque_isquemico_transitorio', 'Hemorragia_cerebral'].includes(sugg.entity));
    }
    const variableHelp = variable.help ? {
      icon: 'info',
      tooltip: variable.help,
      tooltipPosition: 'right',
    } : null;

    variable.help
    const field: FormlyFieldConfig = {
      key: variable.key,
      type: variable.fieldType,
      templateOptions: {
        type: variable.inputType,
        appearance: 'outline',
        label: variable.shortLabel,
        multiple: variable.cardinality === 'n',
        options: variable.admissibles.map(a => ({ value: a.value, label: a.value })),
        focus: (field, event) => this.focusedField = field.key,

        // custom properties
        suggestions: variableSuggestions,

        // custom addons
        addonRight: {
          icon: 'search',
          tooltip: `Primera evidencia en el texto: ${variableSuggestions[0]?.evidence}`,
          tooltipPosition: 'right',
          onClick: (to, addon, event) => this.highlight(to.suggestions, 'context'),
        },
        help: variableHelp,
      }
    };
    return field;
  }

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

  // SEARCH INSIDE TEXT (MAYBE)
  // @ViewChild('search', { static: false }) searchElemRef: ElementRef;
  // searchText$: Observable<string>;
  // searchConfig = { separateWordSearch: false };
  // ngAfterViewInit() {
  //   this.searchText$ = fromEvent(this.searchElemRef.nativeElement, 'keyup').pipe(
  //     map((e: Event) => (e.target as HTMLInputElement).value),
  //     debounceTime(300),
  //     distinctUntilChanged()
  //   );
  // }

}
