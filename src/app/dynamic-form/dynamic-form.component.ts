import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';
import { MatButtonModule } from '@angular/material/button';
import { AnnotationService } from '../annotation.service';
import { parseBratAnnotations } from '../helpers';

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
      key: 'fechaDeIngreso',
      type: 'input',
      templateOptions: {
        label: 'Fecha de ingreso',
      },
    },
    {
      key: 'horaDeIngreso',
      type: 'input',
      templateOptions: {
        label: 'Hora de ingreso',
      },
    },
    {
      key: 'diagnosticoPrincipal',
      type: 'input',
      templateOptions: {
        label: 'Diagnóstico principal',
      },
    },
    {
      key: 'vasoCerebralAfectado',
      type: 'input',
      templateOptions: {
        label: 'Vaso cerebral afectado',
      },
      hideExpression: 'model.diagnosticoPrincipal != "ICTUS"',
    },
    {
      key: 'lateralizacion',
      type: 'input',
      templateOptions: {
        label: 'Lateralización',
      },
    },
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
        console.log(parsed);

        this.model = {
          fechaDeIngreso: parsed[1]['span'],  // 1
          horaDeIngreso: parsed[0]['span'],  // 1

          diagnosticoPrincipal: parsed[54]['span'],  // 1
          vasoCerebralAfectado: parsed[55]['span'],  // n
          lateralizacion: parsed[56]['span'],  // 1

          // etiologiaIctus: parsed[?][?]
        }
      }

    );


  }

}
