import { Component, OnInit, ViewChild, Input, OnChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormArray, FormGroup } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { Papa } from 'ngx-papaparse';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';

import { ParsingService } from 'src/app/services/parsing.service';
import { Suggestion, Variable } from 'src/app/interfaces/interfaces';
import { downloadObjectAsJson } from 'src/app/helpers/helpers';
import Mark from 'mark.js';

// TODO show extra help in some fields: trombolisis (intravenosa e intraarterial), trombectomia, tac craneal
// TODO show unspecified suggestions in some fields: tratamientos (antiagregante y anticoagulante), mrankin, nihss
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
export class ExpansionComponent implements OnChanges {

  // core atrtibutes
  @Input() fileId: string;
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
    'Procedimientos': 'healing',
    // 'Tratamientos y escalas de valoración': 'analytics',
    'Tratamientos': 'local_pharmacy',
    'Pruebas y escalas de valoración': 'analytics',
  };

  constructor(
    private http: HttpClient,
    private papa: Papa,
    private parser: ParsingService
  ) { }

  ngOnChanges(): void {
    this.model = {};
    this.panels = [];
    this.loadFile(this.fileId);
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
                this.model = { ...this.model, [variable.key]: this.getModelData(variable, suggestions) }
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

    // else if (variable.entity.startsWith('Tratamiento_antiagregante')) {
    //   variableSuggestions = suggestions.filter(sugg => ['Tratamiento_antiagregante', 'Tratamiento_antiagregante_hab', 'Tratamiento_antiagregante_alta'].includes(sugg.entity));
    // }
    // else if (variable.entity.startsWith('Tratamiento_anticoagulante')) {
    //   variableSuggestions = suggestions.filter(sugg => ['Tratamiento_anticoagulante', 'Tratamiento_anticoagulante_hab', 'Tratamiento_anticoagulante_alta'].includes(sugg.entity));
    // }

    return suggestions;
  }

  getModelData(variable: Variable, suggestions: Suggestion[]): any {
    let data: any;
    data = suggestions ? (suggestions[0]?.notes || suggestions[0]?.evidence) : null;

    // special case
    if (variable.entity === 'Diagnostico_principal') {
      const suggestion = suggestions.find(suggestion => ['Ictus_isquemico', 'Ataque_isquemico_transitorio', 'Hemorragia_cerebral'].includes(suggestion.entity));
      data = variable.admissibles.find(a => a.value.startsWith(suggestion?.entity.toLowerCase().split('_')[0]))?.value;
    }

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

            // good UX
            // fxLayout: 'row',

            // bad UX
            fxLayout: 'row wrap',
            fxLayoutGap: '0.5rem',
            // fxFlex: '',
          },
          fieldGroup: []
        }
      ]
    }

    // bad UX: force more than one field per line
    fieldGroup.forEach(field => {
      if (field.templateOptions.multiple) {
        const percentage = 100 / fieldGroup.length;
        group.fieldGroup[1].templateOptions.fxFlex = `${percentage}%`;
      }
    });
    fieldGroup.forEach(field => group.fieldGroup[1].fieldGroup?.push(field));

    return group;
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
        tooltip: suggestions.map(s => s.evidence).join('\n'),
        // tooltip: `Evidencias en el texto:\n${suggestions.map(s => s.evidence).join(' | ')}`,
        tooltipClass: 'multiline-tooltip',
        onClick: (to, addon, event) => this.highlight(to.suggestions, 'context'),
      }
    }

    if (variable.help) {
      field.templateOptions.help = {
        icon: 'info',
        tooltip: variable.help,
      };
    }

    if (variable.entity === 'Arteria_afectada') {
      field.expressionProperties = { 'templateOptions.disabled': 'model.diagnosticoPrincipal !== "ictus isquémico"' };
    }

    if (variable.entity === 'Diagnostico_principal') {
      field.templateOptions.change = (field, event) => field.model.diagnosticoPrincipal !== 'ictus isquémico' ? this.model = { ...this.model, arteriasAfectadas: null } : null
    };

    return field;
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
    this.ngOnChanges();
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
  format === 'ann' ? this.http.get(`assets/${this.fileId}.utf8.ann`, { responseType: 'text' }).subscribe(data => console.log(data)) : null;

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

  // TRY TO FIX BUG: EXPAND ALL / COLLAPSE ALL
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
