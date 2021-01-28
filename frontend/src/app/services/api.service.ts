import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import { Report, Variable } from "src/app/interfaces/interfaces"

@Injectable({
  providedIn: "root",
})
export class ApiService {

  apiUrl = environment.apiUrl

  constructor(private http: HttpClient) { }

  getVariables(): Observable<Variable[]> {
    return this.http.get<Variable[]>(`${this.apiUrl}/variables`)
  }

  uploadReports(files: FileList): Observable<any> {
    const formData = new FormData()
    Array.from(files).forEach(file => formData.append('files[]', file))
    return this.http.post<any>(`${this.apiUrl}/reports`, formData)
  }

  getReports(completed: boolean | null = null): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}/reports/completed/${completed}`)
  }

  getReport(filename: string): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/reports/${filename}`)
  }

  updateReport(filename: string, report: Report): Observable<Report> {
    return this.http.put<Report>(`${this.apiUrl}/reports/${filename}`, report)
  }

  deleteReport(filename: string): Observable<Report> {
    return this.http.delete<Report>(`${this.apiUrl}/reports/${filename}`)
  }

  resetDatabase() {
    return this.http.delete<Report>(`${this.apiUrl}/database`)
  }

}
