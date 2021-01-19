import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import { Document } from "../interfaces/interfaces"

@Injectable({
  providedIn: "root",
})
export class ApiService {
  // url = environment.APP_API_URL
  url = 'http://localhost:3000'

  constructor(private http: HttpClient) { }

  getDemo(): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.url}/demo`)
  }

  getDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.url}/documents`)
  }

  uploadDocuments(files: FileList): Observable<any> {
    const formData = new FormData()
    Array.from(files).forEach(file => formData.append('files[]', file))
    return this.http.post<any>(`${this.url}/documents`, formData)
  }
}
