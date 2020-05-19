import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { MatButtonModule } from '@angular/material/button';
import { AnnotationService } from '../annotation.service';
import { camelCase, parseBratAnnotations } from '../helpers';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {

  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {};
  fields: FormlyFieldConfig[] = [
    {
      key: 'date',
      type: 'input',
      templateOptions: {
        label: 'Date',
        // disabled: true,
      },
    },
    {
      key: 'time',
      type: 'input',
      templateOptions: {
        label: 'Time',
        // disabled: true,
      },
    },
    {
      key: 'firstSection',
      type: 'input',
      templateOptions: {
        label: 'First section',
        disabled: true,
      },
    },
    {
      key: 'firstEntity',
      type: 'input',
      templateOptions: {
        label: 'First entity',
        disabled: true,
      },
    },
    {
      key: 'secondSection',
      type: 'input',
      templateOptions: {
        label: 'Second section',
        disabled: true,
      }
    },
    {
      key: 'secondEntity',
      type: 'input',
      templateOptions: {
        label: 'Second entity',
        disabled: true,
      }
    },
    // {
    //   key: 'diagnosticoPrincipal',
    //   type: 'input',
    //   templateOptions: {
    //     label: 'Diagnóstico principal',
    //   },
    //   hideExpression: 'model.diagnosticoPrincipal != "ICTUS"',
    // },
    // {
    //   key: 'lateralizacion',
    //   type: 'input',
    //   templateOptions: {
    //     label: 'Lateralización',
    //   },
    // },
  ];

  submit() {
    alert(JSON.stringify(this.model));
  }

  constructor(
    private ann: AnnotationService
  ) { }

  ngOnInit(): void {
    let annTsv: string;
    this.ann.getAnnotationsTsv().subscribe(
      data => annTsv = data,
      err => console.error(err),
      () => {
        const parsed = parseBratAnnotations(annTsv);
        // console.log('parsed annotations', parsed);

        // TODO replace hardcode
        this.model = {
          time: parsed[0]['notes'],  // 1
          date: parsed[1]['notes'],  // 1
          firstSection: `${parsed[2]['span']} (offset: ${parsed[2]['offset']['start']} ${parsed[2]['offset']['end']})`,  // 1
          secondSection: `${parsed[3]['span']} (offset: ${parsed[3]['offset']['start']} ${parsed[3]['offset']['end']})`,  // 1
          firstEntity: `${parsed[4]['span']} (offset: ${parsed[4]['offset']['start']} ${parsed[4]['offset']['end']})`,  // 1
          secondEntity: `${parsed[5]['span']} (offset: ${parsed[5]['offset']['start']} ${parsed[5]['offset']['end']})`,  // 1

          // diagnosticoPrincipal: parsed[54]['span'],  // 1
          // vasoCerebralAfectado: parsed[55]['span'],  // n
          // lateralizacion: parsed[56]['span'],  // 1
          // etiologiaIctus: parsed[?][?]
        }
      }
    );
  }

}
