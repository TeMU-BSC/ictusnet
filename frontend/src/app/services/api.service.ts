import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import { Document, Option, Variable } from "../models/models"

@Injectable({
  providedIn: "root",
})
export class ApiService {

  apiUrl = environment.apiUrl
  public variables: Variable[]
  public options: Option[]

  constructor(private http: HttpClient) {
    this.getVariables().subscribe(response => this.variables = response)
    this.getOptions().subscribe(response => this.options = response)
  }

  getVariables(): Observable<Variable[]> {
    return this.http.get<Variable[]>(`${this.apiUrl}/variables`)
  }

  getOptions(): Observable<Option[]> {
    return this.http.get<Option[]>(`${this.apiUrl}/options`)
  }

  getDemo(): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/demo`)
  }

  uploadDocuments(files: FileList): Observable<any> {
    const formData = new FormData()
    Array.from(files).forEach(file => formData.append('files[]', file))
    return this.http.post<any>(`${this.apiUrl}/documents`, formData)
  }

  getDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/documents`)
  }

}
