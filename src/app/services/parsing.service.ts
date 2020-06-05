import { Injectable } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { Suggestion } from 'src/app/interfaces/interfaces';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParsingService {

  annotations: Suggestion[];

  constructor(
    private papa: Papa,
  ) {
    this.getAnnotationsFromFile('assets/alejandro_sample/10/321687159.utf8.ann')
  }

  getAnnotationsFromFile(filepath: string): Observable<Suggestion[]> {
    const annotations: Suggestion[] = [];
    this.papa.parse(filepath, {
      download: true,
      skipEmptyLines: true,
      complete: results => {
        const annotationLines = results.data.filter((line: string[][]) => line.map((l: string[]) => l[0])[0].startsWith('T'));
        const annotatorNotesLines = results.data.filter((line: string[][]) => line.map((l: string[]) => l[0])[0].startsWith('#'));
        annotationLines.forEach((line: string[]) => {
          let foundNotesLine = annotatorNotesLines.find(note => note[1].split(' ')[1] === line[0])
          annotations.push({
            id: line[0],
            entity: line[1].split(' ')[0],
            offset: {
              start: Number(line[1].split(' ')[1]),
              end: Number(line[1].split(' ')[2]),
            },
            evidence: line[2],
            notes: foundNotesLine ? foundNotesLine[2] : null
          });
        });
      }
    });
    this.annotations = annotations;
    return of(annotations);
  }

}
