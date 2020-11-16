import { Component, OnChanges, ViewChild, Input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';

import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';

import { Papa } from 'ngx-papaparse';
import Mark from 'mark.js';

import { ParsingService } from 'src/app/services/parsing.service';
import { Suggestion, Variable } from 'src/app/interfaces/interfaces';
import { downloadObjectAsJson } from 'src/app/helpers/helpers';
import { panelIcons, unspecifiedEntities, admissibleEvidences } from 'src/app/constants/constants';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';


// TODO https://js.devexpress.com/Demos/WidgetsGallery/Demo/ContextMenu/Basics/Angular/Light/


export interface PanelType {
  icon?: string;
  title?: string;
  groups?: FormlyFieldConfig[];
}

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FieldComponent implements OnChanges {

  @Input() fileId: string;  // development
  @Input() file: File;  // production
  text: string;
  loading: boolean = true;
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
  step: number = 0;  // default open panel
  setStep(index: number) { this.step = index }
  nextStep() { this.step++ }
  prevStep() { this.step-- }

  constructor(
    private papa: Papa,
    private parser: ParsingService,
    public dialog: MatDialog,
  ) { }

  ngOnChanges(): void {
    this.loadForm(this.fileId);
    document.getElementById('wrapper').scrollTop = 0;
  }

  /**
   * Load the form with the given text file.
   */
  loadForm(fileId: string) {
    this.loading = true;
    this.text = '';
    this.model = {};
    this.panels = [];

    // TODO replace demo path and fileIds for real uploaded files
    const path: string = 'assets/alejandro_sample/10';
    this.downloadFilename = `${fileId}.json`;
    this.parser.getTextFromFile(`${path}/${fileId}.utf8.txt`).subscribe(data => this.text = data);
    this.parser.getAnnotationsFromFile(`${path}/${fileId}.utf8.ann`).subscribe(data => {
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
              this.loading = false;
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
    const unespecifiedSuggestions = this.suggestions.filter(s => s.entity.startsWith(unspecifiedEntities[groupName]));
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
            fxLayoutGap: '1rem',
            lantern: unespecifiedSuggestions.length > 0 ? {
              icon: 'highlight',
              tooltip: ['Evidencias auxiliares:'].concat(unespecifiedSuggestions.map(s => s.evidence)).join('\n'),
              tooltipClass: 'multiline-tooltip',
              action: () => this.highlight(unespecifiedSuggestions, 'context', 'unspecified'),
            } : null,
          },
          fieldGroup: [
            {
              template: `<p class="group-title">${groupName}</p>`,
            }
          ]
        },
        {
          type: 'flex-layout',
          templateOptions: {
            fxLayout: 'row',
            fxLayoutGap: '1rem',
            fxFlex: '45%',
          },
          fieldGroup: []
        }
      ]
    }

    // row wrap layout when more than two fields per group
    if (fields.length > 2) {
      group.fieldGroup[1].templateOptions.fxLayout = 'row wrap';
    }

    // special cases
    if ([
      'Diagnóstico principal',
      'Arterias afectadas',
      'Localizaciones',
      'Lateralización',
      'Etiología',
    ].includes(groupName)) {
      group.fieldGroup[1].templateOptions.fxFlex = '90%';
    }

    // populate the group with the actual fields
    group.fieldGroup[1].fieldGroup.push(...fields);

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
        focus: (field, event) => this.highlight(field.templateOptions.suggestions, 'context', 'attention'),

        // custom properties
        suggestions: suggestions,
        addonRight: {
          info: variable.info ? {
            icon: 'info',
            color: 'primary',
            tooltip: variable.info,
          } : null,
          locate: suggestions.length > 0 ? {
            icon: 'search',
            color: 'attention',
            tooltip: suggestions.map(s => s.evidence).join('\n'),
            tooltipClass: 'multiline-tooltip',
            onClick: (to, addon, event) => this.highlight(to.suggestions, 'context', 'attention'),
          } : null,
        },
      },
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

      // set initial available options of etiologia depending on the initial autofilled value of diagnostico principal
      case 'Etiologia':
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

    // sort alphabetically the options of some fields
    if (variable.entity === 'Etiologia' || variable.entity.startsWith('Tratamiento')) {
      (field.templateOptions.options as any[]).sort((a, b) => a.value?.localeCompare(b.value));
    }

    return field;
  }

  /**
   * Return the according suggestions for the given variable, taking into accound some special cases.
   */
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

    // single option select needs some rule-based criteria to be autofilled
    if (variable.fieldType === 'select' && variable.cardinality === '1') {

      // check first special case
      if (variable.entity === 'Diagnostico_principal') {
        const suggestion = suggestions.find(s => ['Ictus_isquemico', 'Ataque_isquemico_transitorio', 'Hemorragia_cerebral'].includes(s.entity));
        data = variable.options.find(o => o.value.toLowerCase().startsWith(suggestion?.entity.toLowerCase().split('_')[0]))?.value;
      }

      // rest of the cases: lateralizacion and etiologia
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
  * https://github.com/iamdustan/smoothscroll/issues/47#issuecomment-350810238
  * https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle
  *
  */
  highlight(suggestions: Suggestion[], className: string, color: string): void {
    const instance = new Mark(`.${className}`);
    const ranges = suggestions.map(s => ({ start: s.offset.start, length: s.offset.end - s.offset.start }));
    const options = {
      each: (element: HTMLElement) => setTimeout(() => element.classList.add('animate', color), 250),
      done: (numberOfMatches: number) => {
        if (numberOfMatches) {
          let item = document.getElementsByTagName('mark')[0];  // what we want to scroll to
          let wrapper = document.getElementById('wrapper');  // the wrapper we will scroll inside
          const lineHeightPixels: number = Number(window.getComputedStyle(wrapper).getPropertyValue('line-height').replace('px', ''));
          let count = item.offsetTop - wrapper.scrollTop - lineHeightPixels * 10;  // any extra distance from top
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
   * @deprecated Not used anymore because there is no need to manually fill a field selecting an evidence in text.
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

  /**
   * Open a confirmation dialog before reseting the form.
   */
  confirmReset(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        title: 'Restablecer formulario',
        content: '¿Quieres volver al estado inicial de este formulario?',
        cancel: 'Atrás',
        buttonName: 'Restablecer',
        color: 'warn'
      }
    })
    dialogRef.afterClosed().subscribe(confirmation => {
      if (confirmation) {
        this.ngOnChanges();
      }
    })
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

}
