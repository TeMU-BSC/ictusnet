import { Component, OnChanges, ViewChild, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormArray, FormGroup } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { Papa } from 'ngx-papaparse';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';

import { ParsingService } from 'src/app/services/parsing.service';
import { Suggestion, Variable } from 'src/app/interfaces/interfaces';
import { downloadObjectAsJson, highlight } from 'src/app/helpers/helpers';


// TODO when a field cannot be autofilled, highlight all unspecific suggestions: Tratamiento_* (antiagregante y anticoagulante), mRankin, NIHSS
// TODO lupa: show extra help (evidencia del procedimiento) in some fields: trombolisis (intravenosa e intraarterial), trombectomia, tac craneal
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
  path: string = 'assets/alejandro_sample/10/';
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
  // getEtiologiaOptions = () => (this.panels[1]?.groups[4]?.fieldGroup[1]?.fieldGroup[0]?.templateOptions?.options as any[]);
  // getEtiologiaSubset = (comment: string) => this.getEtiologiaOptions().filter(o => o.comment === comment);
  // setEtiologiaOptions = (subset: any[]) => this.panels[1].groups[4].fieldGroup[1].fieldGroup[0].templateOptions.options = subset;

  // expansion panel
  @ViewChild(MatAccordion) accordion: MatAccordion;
  step: number = 0;
  setStep(index: number) { this.step = index }
  nextStep() { this.step++ }
  prevStep() { this.step-- }
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

    this.http.get(`${this.path}${fileId}.utf8.txt`, { responseType: 'text' }).subscribe(data => this.text = data);
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

    this.parser.getAnnotationsFromFile(`${this.path}/${fileId}.utf8.ann`).subscribe(data => {
      const allSuggestions: Suggestion[] = data;
      this.papa.parse(`assets/variables.tsv`, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: parsedVariables => {
          const variables: Variable[] = parsedVariables.data;
          this.papa.parse('assets/options.tsv', {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: parsedAdmissibles => {
              const options: any[] = parsedAdmissibles.data;
              variables.forEach(variable => {
                variable.options = options.filter(a => variable.entity.startsWith(a.entity)).map(a => ({ value: a.value, comment: a.comment }));
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
            // fxFlex: '',
          },
          fieldGroup: []
        }
      ]
    }

    // responsive approach
    fieldGroup.forEach(field => {
      if (field.templateOptions.multiple) {
        const percentage = 100 / fieldGroup.length;
        group.fieldGroup[1].templateOptions.fxFlex = `${percentage}%`;
      }
    });

    group.fieldGroup[1].fieldGroup = fieldGroup;
    return group;
  }

  /**
   * Build the form field with all needed attributes, considering some special cases.
   */
  getField(variable: Variable, suggestions: Suggestion[]): FormlyFieldConfig {

    // prepare options for select fields
    let options = variable.options.map(o => o.comment ? ({ value: o.value, label: `${o.value} (${o.comment})` }) : ({ value: o.value, label: o.value }));
    if (variable.entity === 'Etiologia') {
      options = variable.options.map(o => ({ value: o.value, label: o.value }));
    }

    // build the formly field
    const field: FormlyFieldConfig = {
      key: variable.key,
      type: variable.fieldType,
      templateOptions: {
        type: variable.inputType,
        appearance: 'outline',
        label: variable.shortLabel,
        multiple: variable.cardinality === 'n',
        options: options,
        focus: (field, event) => highlight(field.templateOptions.suggestions, 'context'),

        // custom properties
        suggestions: suggestions,
        info: variable.info ? {
          icon: 'info',
          tooltip: variable.info
        } : null,
        // addonRight: {
        //   icon: 'search',
        //   tooltip: suggestions.map(s => s.evidence).join('\n'),
        //   tooltipClass: 'multiline-tooltip',
        //   onClick: (to, addon, event) => highlight(to.suggestions, 'context'),
        // }
      }
    };

    // sort options
    if (variable.entity === 'Etiologia' || variable.entity.startsWith('Tratamiento')) {
      (field.templateOptions.options as any[]).sort((a, b) => a.value?.localeCompare(b.value));
    }

    // disable arteria field when diagnostico is not ictus
    if (variable.entity === 'Arteria_afectada') {
      field.expressionProperties = { 'templateOptions.disabled': 'model.diagnosticoPrincipal !== "ictus isquémico"' };
    }

    // listen to changes on diagnostico principal value
    if (variable.entity === 'Diagnostico_principal') {
      field.templateOptions.change = (currentField) => {

        // empty arterias afectadas field when diagnostico principal is other than 'ictus isquémico'
        if (currentField.model.diagnosticoPrincipal !== 'ictus isquémico') {
          this.model = { ...this.model, arteriasAfectadas: null };
        }

        // // update etiologia field options depending on its value
        // let subset: any[];
        // if (['ictus isquémico', 'ataque isquémico transitorio'].includes(this.model.diagnosticoPrincipal)) {
        //   subset = this.getEtiologiaSubset('isquémico');
        // } else if (['hemorragia cerebral'].includes(this.model.diagnosticoPrincipal)) {
        //   subset = this.getEtiologiaSubset('hemorragia');
        // }
        // this.setEtiologiaOptions(subset.map(s => ({ value: s.value, label: s.label })));
      }
    };

    // // initialize etiologia subset options
    // if (variable.entity === 'Etiologia') {
    //   let subset: any[];
    //   if (['ictus isquémico', 'ataque isquémico transitorio'].includes(this.model.diagnosticoPrincipal)) {
    //     subset = this.getEtiologiaSubset('isquémico');
    //   } else if (['hemorragia cerebral'].includes(this.model.diagnosticoPrincipal)) {
    //     subset = this.getEtiologiaSubset('hemorragia');
    //   }
    //   field.templateOptions.options = subset;
    // }

    return field;
  }

  getVariableSuggestions(variable: Variable, allSuggestions: Suggestion[]): Suggestion[] {
    let suggestions = allSuggestions.filter(s => variable.entity === s.entity);

    // when no exact suggestions are found, look for its coresponding unspecific entity
    if (suggestions.length === 0) {
      const unspecificEntities = [
        'Tratamiento_antiagregante',
        'Tratamiento_anticoagulante',
        'mRankin',
        'NIHSS',
      ];
      unspecificEntities.forEach(e => {
        if (variable.entity.startsWith(e)) {
          suggestions = allSuggestions.filter(s => s.entity === e);
        }
      });

      // tag as 'unspecific'
      // suggestions = suggestions.map(s => ({ ...s, unspecific: true }))
    }

    // special case
    if (variable.entity === 'Diagnostico_principal') {
      suggestions = allSuggestions.filter(s => ['Ictus_isquemico', 'Ataque_isquemico_transitorio', 'Hemorragia_cerebral'].includes(s.entity));
    }

    return suggestions;
  }

  getModelData(variable: Variable, suggestions: Suggestion[]): any {

    // input fields
    let data: any = suggestions[0]?.notes || suggestions[0]?.evidence;

    // select fields
    if (variable.fieldType === 'select') {

      // special case
      if (variable.entity === 'Diagnostico_principal') {
        const suggestion = suggestions.find(s => ['Ictus_isquemico', 'Ataque_isquemico_transitorio', 'Hemorragia_cerebral'].includes(s.entity));
        data = variable.options.find(o => o.value.startsWith(suggestion?.entity.toLowerCase().split('_')[0]))?.value;
      }

      // single option need data to be a string
      if (variable.cardinality === '1') {
        data = variable.options.find(o => o.value.match(data))?.value;
      }

      // multiple options need data to be an array of strings
      if (variable.cardinality === 'n') {
        data = [];
        suggestions.forEach(suggestion => {
          const option = variable.options.find(a => a.value.concat(' ', a.comment).match(suggestion?.evidence))?.value;
          data.push(option);
        });
      }
    }

    return data;
  }

  /**
   * Update the value of a specific field (the picked field) with an evidence in text.
   *
   * Not used anymore because
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
