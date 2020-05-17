import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Papa } from 'ngx-papaparse';

import { parseBratAnnotations } from './helpers';
import { Annotation } from './annotation';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {

  constructor(
    private http: HttpClient,
    private papa: Papa,
  ) { }

  getAnnotationsTsv(): Observable<any> {
    return this.http.get('assets/pipeline/output/377259358.utf8.ann', { responseType: 'text' });
  }
}
