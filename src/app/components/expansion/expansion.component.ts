import { Component, OnChanges, ViewChild, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';

import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';

import { Papa } from 'ngx-papaparse';
import Mark from 'mark.js';

import { ParsingService } from 'src/app/services/parsing.service';
import { Suggestion, Variable, PanelType } from 'src/app/interfaces/interfaces';
import { downloadObjectAsJson } from 'src/app/helpers/helpers';
import { panelIcons, unspecifiedEntities, admissibleEvidences } from 'src/app/constants/constants';


// TODO lupa: show extra help (evidencia del procedimiento) in the groups: trombolisis (intravenosa e intraarterial), trombectomia, tac craneal
// TODO https://js.devexpress.com/Demos/WidgetsGallery/Demo/ContextMenu/Basics/Angular/Light/


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
  variables: Variable[];
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
  step: number = 4;
  setStep(index: number) { this.step = index }
  nextStep() { this.step++ }
  prevStep() { this.step-- }

  constructor(
    private papa: Papa,
    private parser: ParsingService,
  ) { }

  ngOnChanges(): void {
    this.model = {};
    this.panels = [];
    this.loadFile(this.fileId);
    document.getElementById('wrapper').scrollTop = 0;
  }

  /**
   * Load a single text file from user.
   */
  loadFile(fileId: string) {
    this.downloadFilename = `${fileId}.json`;
    this.parser.getTextFromFile(`${this.path}${fileId}.utf8.txt`).subscribe(data => this.text = data);


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

    this.parser.getAnnotationsFromFile(`${this.path}${fileId}.utf8.ann`).subscribe(data => {
      this.suggestions = data;
      const allSuggestions = this.suggestions;
      this.papa.parse(`assets/variables.tsv`, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: parsedVariables => {
          this.variables = parsedVariables.data;
          const variables = this.variables;
          this.papa.parse('assets/options.tsv', {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: parsedOptions => {
              const options: any[] = parsedOptions.data;
              variables.forEach(variable => {
                variable.options = options.filter(a => variable.entity.startsWith(a.entity)).map(a => ({ value: a.value, comment: a.comment }));
                const suggestions = this.getVariableSuggestions(variable, allSuggestions);
                this.model = { ...this.model, [variable.key]: this.autofill(variable, suggestions) }
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
      icon: panelIcons[sectionName],
      title: sectionName,
      groups: groups,
    };
    return panel;
  }

  getGroup(groupName: string, fields: FormlyFieldConfig[]): FormlyFieldConfig {

    const group: FormlyFieldConfig = {
      type: 'flex-layout',
      templateOptions: {
        fxLayout: 'column',
      },
      fieldGroup: [
        {
          type: 'flex-layout',
          templateOptions: {
            fxLayout: 'row wrap',
            fxLayoutAlign: 'start center',
            fxLayoutGap: '0.5rem',
            unspecified: Object.keys(unspecifiedEntities).includes(groupName),
            button: {
              icon: 'highlight',
              tooltip: 'Resaltar todas las evidencias auxiliares para este grupo de variables.',
              tooltipPosition: 'right',
              action: () => this.highlight(this.suggestions.filter(s => s.entity.startsWith(unspecifiedEntities[groupName])), 'context'),
            }
          },
          fieldGroup: [
            {
              template: `<div class="group-title">${groupName}</div>`,
            }
          ]
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
    fields.forEach(field => {
      if (field.templateOptions.multiple) {
        const percentage = 100 / fields.length;
        group.fieldGroup[1].templateOptions.fxFlex = `${percentage}%`;
      }
    });

    group.fieldGroup[1].fieldGroup.push(...fields);


    // const group: FormlyFieldConfig = {
    //   type: 'flex-layout',
    //   templateOptions: {
    //     fxLayout: 'row wrap',
    //     fxLayoutGap: '0.5rem',
    //   },
    //   fieldGroup: [
    //     {
    //       type: 'flex-layout',
    //       template: `<div class=group-title>${groupName}</div>`,
    //       templateOptions: {
    //         fxLayout: 'column',
    //       }
    //     }
    //   ]
    // };

    return group;
  }

  /**
   * Build the form field with all needed attributes, considering some special cases.
   */
  getField(variable: Variable, suggestions: Suggestion[]): FormlyFieldConfig {

    // prepare options for select fields
    let options = variable.options.map(o => ({ ...o, label: o.value }));

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
        focus: (field, event) => this.highlight(field.templateOptions.suggestions, 'context'),

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

    // special cases
    switch (variable.entity) {

      // listen to disgnostico changes to dynamically toggle etiologia's available subset options
      case 'Diagnostico_principal':
        field.templateOptions.change = (currentField) => {
          let subset: any[];
          if (currentField.model.diagnosticoPrincipal.includes('isquémico')) {
            subset = this.variables.find(v => v.entity === 'Etiologia').options.filter(o => o.comment === 'isquémico').map(o => ({ ...o, label: o.value }));
          } else if (currentField.model.diagnosticoPrincipal.includes('hemorragia')) {
            subset = this.variables.find(v => v.entity === 'Etiologia').options.filter(o => o.comment === 'hemorragia').map(o => ({ ...o, label: o.value }));
          }
          this.panels[1].groups[4].fieldGroup[1].fieldGroup[0].templateOptions.options = subset;



          // PENDING AITOR/MARTA CONFIRMATION: empty arterias afectadas field when diagnostico principal is other than 'ictus isquémico'
          // if (currentField.model.diagnosticoPrincipal !== 'ictus isquémico') {
          //   this.model = { ...this.model, arteriasAfectadas: null };
          // }
        }
        break;

      case 'Arteria_afectada':
        // field.expressionProperties = { 'templateOptions.disabled': 'model.diagnosticoPrincipal !== "ictus isquémico"' };
        break;

      case 'Etiologia':

        // set initial available options depending on the initial autofilled value of diagnostico principal
        let subset: any[];
        if (['ictus isquémico', 'ataque isquémico transitorio'].includes(this.model.diagnosticoPrincipal)) {
          subset = (field.templateOptions.options as any[]).filter(o => o.comment === 'isquémico');
        } else if (['hemorragia cerebral'].includes(this.model.diagnosticoPrincipal)) {
          subset = (field.templateOptions.options as any[]).filter(o => o.comment === 'hemorragia');
        }
        field.templateOptions.options = subset;
        break;

      default:
        break;
    }

    // append (comment) on tratameinto fields that have commercial name
    if (variable.entity.startsWith('Tratamiento')) {
      field.templateOptions.options = variable.options.map(o => o.comment ? ({ value: o.value, label: `${o.value} (${o.comment})` }) : ({ value: o.value, label: o.value }));
    }

    // sort some options
    if (variable.entity === 'Etiologia' || variable.entity.startsWith('Tratamiento')) {
      (field.templateOptions.options as any[]).sort((a, b) => a.value?.localeCompare(b.value));
    }

    return field;
  }

  getVariableSuggestions(variable: Variable, allSuggestions: Suggestion[]): Suggestion[] {
    let suggestions = allSuggestions.filter(s => variable.entity === s.entity);

    // special case
    if (variable.entity === 'Diagnostico_principal') {
      suggestions = allSuggestions.filter(s => ['Ictus_isquemico', 'Ataque_isquemico_transitorio', 'Hemorragia_cerebral'].includes(s.entity));
    }

    return suggestions;
  }

  /**
 * Search for a suitable value or values to autofill a formly field.
 */
  autofill(variable: Variable, suggestions: Suggestion[]): any {
    let data: any;

    if (variable.fieldType === 'input') {
      data = suggestions.find(s => s.notes)?.notes;
    }

    // single option select needs string data
    if (variable.fieldType === 'select' && variable.cardinality === '1') {

      // special cases
      if (variable.entity === 'Diagnostico_principal') {
        const suggestion = suggestions.find(s => ['Ictus_isquemico', 'Ataque_isquemico_transitorio', 'Hemorragia_cerebral'].includes(s.entity));
        data = variable.options.find(o => o.value.toLowerCase().startsWith(suggestion?.entity.toLowerCase().split('_')[0]))?.value;
      }

      // autofill with option:
      else {
        data = variable.options.find(o =>

          // 1. if that includes the first evidence as a substring
          o.value.toLowerCase().includes(suggestions[0]?.evidence.toLowerCase())

          // 2. or if any of the predefined admissible values includes the first evidence
          || admissibleEvidences[variable.key][o.value]?.includes(suggestions[0]?.evidence)

          // 3. or if evidence starts with the first letter of that option
          || suggestions[0]?.evidence.toLowerCase().startsWith(o.value.toLowerCase()[0])
        )?.value;
      }
    }

    // multiple option select needs array of strings
    if (variable.fieldType === 'select' && variable.cardinality === 'n') {
      data = suggestions.map(s => variable.options.find(o => o.value.toLowerCase().concat(' ', o.comment).includes(s?.evidence.toLowerCase()))?.value);
      data = [...new Set(data)];
    }

    return data;
  }

  /**
  * Highlight, in the text with class `className`, the offsets present in the given suggestions.
  * Note: Requires an HTML element with the given `className` to exist.
  *
  * https://markjs.io/#markranges
  * https://jsfiddle.net/julmot/hexomvbL/
  *
  */
  highlight(suggestions: Suggestion[], className: string): void {
    const instance = new Mark(`.${className}`);
    const ranges = suggestions.map(sugg => ({ start: sugg.offset.start, length: sugg.offset.end - sugg.offset.start }));
    const options = {
      each: (element: HTMLElement) => setTimeout(() => element.classList.add("animate"), 250),
      done: (numberOfMatches: number) => {
        // numberOfMatches ? document.getElementsByTagName('mark')[0].scrollIntoView() : null;

        if (numberOfMatches) {

          // https://github.com/iamdustan/smoothscroll/issues/47#issuecomment-350810238
          let item = document.getElementsByTagName('mark')[0];  // what we want to scroll to
          let wrapper = document.getElementById('wrapper');  // the wrapper we will scroll inside
          let count = item.offsetTop - wrapper.scrollTop - 200;  // xx = any extra distance from top ex. 60
          wrapper.scrollBy({ top: count, left: 0, behavior: 'smooth' })
        }
      }
    };
    instance.unmark({
      done: () => instance.markRanges(ranges, options)
    });
  }

  /**
   * Update the value of a specified field (the picked field) with an evidence in text.
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
