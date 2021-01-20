import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import { Document, Option, Variable } from "../interfaces/interfaces"

@Injectable({
  providedIn: "root",
})
export class ApiService {

  apiUrl = environment.apiUrl
  public variables: Variable[]
  public options: Option[]
  public demo: Document[]

  constructor(private http: HttpClient) {
    this.http.get<Variable[]>(`${this.apiUrl}/variables`).subscribe(response => this.variables = response)
    this.http.get<Option[]>(`${this.apiUrl}/options`).subscribe(response => this.options = response)
    this.http.get<Document[]>(`${this.apiUrl}/demo`).subscribe(response => this.demo = response['documents'])
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
