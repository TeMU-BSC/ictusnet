import { Injectable } from '@angular/core';

import { DropdownQuestion } from './question-dropdown';
import { QuestionBase } from './question-base';
import { TextboxQuestion } from './question-textbox';
import { of } from 'rxjs';

@Injectable()
export class QuestionService {

  // TODO: get from a remote source of question metadata
  getQuestions() {

    let questions: QuestionBase<string>[] = [

      //   new DropdownQuestion({
      //     key: 'brave',
      //     label: 'Bravery Rating',
      //     options: [
      //       {key: 'solid',  value: 'Solid'},
      //       {key: 'great',  value: 'Great'},
      //       {key: 'good',   value: 'Good'},
      //       {key: 'unproven', value: 'Unproven'}
      //     ],
      //     order: 3
      //   }),

      //   new TextboxQuestion({
      //     key: 'firstName',
      //     label: 'First name',
      //     value: 'Bombasto',
      //     required: true,
      //     order: 1
      //   }),

      //   new TextboxQuestion({
      //     key: 'emailAddress',
      //     label: 'Email',
      //     type: 'email',
      //     order: 2
      //   })
      // ];

      new TextboxQuestion({
        key: 'fechaDeIngreso',
        label: 'Fecha de ingreso',
        value: '12 de mayo de 2020',
        required: true,
        order: 1
      }),

      new DropdownQuestion({
        key: 'diagnosticoPrincipal',
        label: 'Diagnóstico principal',
        options: [
          { key: 'ictusIsquemico', value: 'ictus isquémico' },
          { key: 'ataqueIsquemicoTransitorio', value: 'ataque isquémico transitorio' },
          { key: 'hemorragiaCerebral', value: 'hemorragia cerebral' },
        ],
        order: 2
      }),

      // TODO this variable is conditional: ONLY if diagnosticoPrincipal has the value "ictusIsquemico"
      new DropdownQuestion({
        key: 'vasoCerebralAfectado',
        label: 'Vaso cerebral afectado',
        options: [
          { key: 'acc', value: 'Arteria carótida común (o ACC) o primitiva' },
          { key: 'aci', value: 'Arteria carótida interna (o ACI)' },
          { key: 'c1', value: 'Arteria carótida interna segmento cervical o C1' },
          { key: 'tica', value: 'Arteria carótida interna terminal (o ACI-T/ TICA)' },
          { key: 'acm', value: 'Arteria cerebral media (o ACM)' },
          { key: 'm1', value: 'Arteria cerebral media segmento M1' },
          { key: 'a1', value: 'Arteria cerebral anterior segmento A1' },
          // ...
        ],
        order: 2
      }),

      new TextboxQuestion({
        key: 'emailAddress',
        label: 'Email',
        type: 'email',
        order: 2
      })
    ];

    return of(questions.sort((a, b) => a.order - b.order));
  }
}
