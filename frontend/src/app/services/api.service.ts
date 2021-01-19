import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import { Document } from "../interfaces/interfaces"

@Injectable({
  providedIn: "root",
})
export class ApiService {

  apiUrl = environment.apiUrl

  constructor(private http: HttpClient) { }

  getDemo(): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/demo`)
  }

  getDocuments(): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/documents`)
  }

  uploadDocuments(files: FileList): Observable<any> {
    const formData = new FormData()
    Array.from(files).forEach(file => formData.append('files[]', file))
    return this.http.post<any>(`${this.apiUrl}/documents`, formData)
  }

}
