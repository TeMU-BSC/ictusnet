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
      const allSuggestions: Suggestion[] = data;
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
              variables.forEach(variable => {
                variable.admissibles = admissibles.filter(a => variable.entity.startsWith(a.entity)).map(a => ({ value: a.value, comment: a.comment }));
                const suggestions = this.getVariableSuggestions(variable, allSuggestions);
                console.log(variable.entity, suggestions);

                // TODO add suggestions to this field
                // ...

                this.model = { ...this.model, [variable.key]: this.getModelData(variable, suggestions) }

                // else if (variable.entity.startsWith('Tratamiento_antiagregante')) {
                //   variableSuggestions = suggestions.filter(sugg => ['Tratamiento_antiagregante', 'Tratamiento_antiagregante_hab', 'Tratamiento_antiagregante_alta'].includes(sugg.entity));
                // }
                // else if (variable.entity.startsWith('Tratamiento_anticoagulante')) {
                //   variableSuggestions = suggestions.filter(sugg => ['Tratamiento_anticoagulante', 'Tratamiento_anticoagulante_hab', 'Tratamiento_anticoagulante_alta'].includes(sugg.entity));
                // }

                // this.autofill(variable, variableSuggestions);
              });
              this.panels = [...this.panels, ...this.getPanels(variables, allSuggestions)];
            }
          });
        }
      });
    });
  }

  getVariableSuggestions(variable: Variable, allSuggestions: Suggestion[]): Suggestion[] {
    let suggestions = allSuggestions.filter(suggestion => variable.entity.startsWith(suggestion.entity));

    // special case
    if (variable.entity === 'Diagnostico_principal') {
      suggestions = allSuggestions.filter(suggestion => ['Ictus_isquemico', 'Ataque_isquemico_transitorio', 'Hemorragia_cerebral'].includes(suggestion.entity));
    }

    return suggestions;
  }

  getModelData(variable: Variable, suggestions: Suggestion[]): any {
    let data: any;

    data = suggestions ? (suggestions[0]?.notes || suggestions[0]?.evidence) : null;

    // multiple values
    if (variable.fieldType === 'select' && variable.cardinality === 'n') {
      data = [];
      suggestions.forEach(suggestion => {
        const option = variable.admissibles.find(a => a.value.concat(' ', a.comment).match(suggestion?.evidence))?.value;
        data.push(option);
      });
    }

    return data;
  }

  getPanels(variables: Variable[], allSuggestions: Suggestion[]): PanelType[] {
    const panels: PanelType[] = [];
    new Set(variables.map(v => v.section)).forEach(sectionName => {
      const sectionVariables = variables.filter(v => v.section === sectionName);
      const groups: FormlyFieldConfig[] = [];
      new Set(sectionVariables.map(v => v.group)).forEach(groupName => {
        const groupVariables = variables.filter(v => v.group === groupName);
        const fields: FormlyFieldConfig[] = [];
        groupVariables.filter(v => v.group === groupName).forEach(variable => {
          const suggestions = this.getVariableSuggestions(variable, allSuggestions);
          const field = this.getField(variable, suggestions);
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
          template: `<p><b>${groupName}</b></p>`
        },
        {
          type: 'flex-layout',
          templateOptions: {
            fxLayout: 'row wrap',
            fxLayoutGap: '0.5rem',
          },
          fieldGroup: []
        }
      ]
    }
    fieldGroup.forEach(field => group.fieldGroup[1].fieldGroup?.push(field));
    return group;

    // const group: FormlyFieldConfig = {
    //   type: 'flex-layout',
    //   templateOptions: {
    //     fxLayout: 'row wrap',
    //     fxLayoutGap: '0.5rem',
    //   },
    //   fieldGroup: [
    //     {
    //       template: `<p fxLayout="row">${groupName}</p><br/>`
    //     }
    //   ]
    // }
    // fieldGroup.forEach(field => group.fieldGroup.push(field));
    // return group;
  }

  getField(variable: Variable, suggestions: Suggestion[]): FormlyFieldConfig {
    const field: FormlyFieldConfig = {
      key: variable.key,
      type: variable.fieldType,
      templateOptions: {
        type: variable.inputType,
        appearance: 'outline',
        label: variable.shortLabel,
        multiple: variable.cardinality === 'n',
        options: variable.admissibles.map(a => a.comment ? ({ value: a.value, label: `${a.value} (${a.comment})` }) : ({ value: a.value, label: a.value })),
        focus: (field, event) => this.focusedField = field.key,
      }
    };

    // custom properties
    field.templateOptions.suggestions = suggestions;
    if (suggestions) {
      field.templateOptions.addonRight = {
        icon: 'search',
        // tooltip: suggestions[0]?.evidence || null,
        // tooltip: `Evidencias en el texto:\n${suggestions.map(s => s.evidence).join(' | ')}`,
        // tooltipPosition: 'right',
        onClick: (to, addon, event) => this.highlight(to.suggestions, 'context'),
      }
    }
    if (variable.help) {
      field.templateOptions.help = {
        icon: 'info',
        tooltip: variable.help,
        tooltipPosition: 'right',
      };
    }

    return field;
  }

  /**
   * Autofill the form fields with suggestions.
   *
   * TODO treat special cases (1, n) and *_hab, *_alta, *_previa, *_alta
   */
  autofillOld(variable: Variable, suggestions: Suggestion[]) {
    let sugg: Suggestion;
    let autofill: string;
    let suggs: Suggestion[];
    let autofills: string[];

    // input fields like dates, times and integers
    if (variable.fieldType === 'input') {
      sugg = suggestions.find(sugg => sugg.entity === variable.entity);
      autofill = sugg?.notes;
    }

    // select fields
    else if (variable.fieldType === 'select') {

      // select fields that accept only one value
      if (variable.cardinality === '1') {
        autofill = variable.admissibles.find(a => a.value.match(sugg?.evidence))?.value;

        // special case: 'Diagnostico_principal' is not an entity per se
        if (variable.entity === 'Diagnostico_principal') {
          sugg = suggestions.find(sugg => ['Ictus_isquemico', 'Ataque_isquemico_transitorio', 'Hemorragia_cerebral',].includes(sugg.entity));
          autofill = variable.admissibles.find(a => a.value.startsWith(sugg?.entity.toLowerCase().split('_')[0]))?.value;
        }
      }

      // select fields that accept multiple values
      if (variable.cardinality === 'n') {

        // special case: 'Tratamiento_*' entities can be unspecific
        if (variable.entity === 'Tratamiento_antiagregante') {
          suggs = suggestions.filter(sugg => [
            'Tratamiento_antiagregante',
            'Tratamiento_antiagregante_hab',
            'Tratamiento_antiagregante_alta',
          ].includes(sugg.entity));
        } else if (variable.entity === 'Tratamiento_anticoagulate') {
          suggs = suggestions.filter(sugg => [
            'Tratamiento_anticoagulate',
            'Tratamiento_anticoagulate_hab',
            'Tratamiento_anticoagulate_alta',
          ].includes(sugg.entity));
        }
        autofills = variable.admissibles.filter(a => a.value.concat(' ', a.comment).match(sugg?.evidence)).map(a => a.value);
        // console.log(variable.entity, autofills);

      }
    }
    // select fields that accept multiple values
    // else if ([
    //   'Arteria_afectada',
    //   'Localizacion',
    // ].includes(variable.entity)) {
    //   autofill = variable.admissibles.filter(a => a.value.match(sugg?.evidence)).map(a => a.value);
    // }

    // update the model
    this.model[variable.key] = autofills || autofill;
  }

  /**
   * Autofill the form fields with suggestions.
   */
  autofill(suggestions: Suggestion[]) {

  }

  findUnspecificSuggestions(entityPrefix: string) {
    entityPrefix = 'Tratamiento_antiagregante';

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
      each: (element: HTMLElement) => setTimeout(() => element.classList.add("animate"), 250),
      done: (numberOfMatches: number) => numberOfMatches ? document.getElementsByTagName('mark')[0].scrollIntoView() : null
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
   * Download the form completed so far in the given format.
   *
   * Accepted formats:
   *  - json
   */
  download(format: string) {
    format === 'json' ? downloadObjectAsJson(this.model, this.downloadFilename) : null;
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
