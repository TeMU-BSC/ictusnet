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
      },
    },
    {
      key: 'time',
      type: 'input',
      templateOptions: {
        label: 'Time',
      },
    },
    {
      key: 'firstSection',
      type: 'input',
      templateOptions: {
        label: 'First section',
      },
    },
    {
      key: 'secondSection',
      type: 'input',
      templateOptions: {
        label: 'Second section',
      }
    },
    {
      key: 'firstEntity',
      type: 'input',
      templateOptions: {
        label: 'First entity',
      },
    },
    {
      key: 'secondEntity',
      type: 'input',
      templateOptions: {
        label: 'Second entity',
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
        console.log('parsed annotations', parsed);

        // TODO replace hardcode
        this.model = {
          time: parsed[0]['span'],  // 1
          date: parsed[1]['span'],  // 1
          firstSection: parsed[2]['span'],  // 1
          secondSection: parsed[3]['span'],  // 1
          firstEntity: parsed[4]['span'],  // 1
          secondEntity: parsed[5]['span'],  // 1

          // diagnosticoPrincipal: parsed[54]['span'],  // 1
          // vasoCerebralAfectado: parsed[55]['span'],  // n
          // lateralizacion: parsed[56]['span'],  // 1
          // etiologiaIctus: parsed[?][?]
        }
      }
    );
  }

}
