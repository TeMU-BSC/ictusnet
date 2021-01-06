import { Injectable } from "@angular/core"
import { HttpClient, HttpParams } from "@angular/common/http"
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import { Report } from "../interfaces/interfaces"

@Injectable({
  providedIn: "root",
})
export class ApiService {
  // url = environment.APP_API_URL
  url = 'http://localhost:3000'

  constructor(private http: HttpClient) { }

  getAnnotatedReports({ isDemo = false }): Observable<Report[]> {
    const params = new HttpParams().append('isDemo', isDemo.toString())
    return this.http.get<Report[]>(`${this.url}/reports`, { params })
  }

  upload(files: FileList): Observable<any> {
    const formData = new FormData()
    Array.from(files).forEach(file => formData.append('files[]', file))
    return this.http.post<any>(`${this.url}/upload`, formData)
  }
}
