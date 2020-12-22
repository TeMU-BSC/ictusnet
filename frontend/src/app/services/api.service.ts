import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
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

  demo(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.url}/demo`)
  }

  // https://blog.jscrambler.com/implementing-file-upload-using-node-and-angular/
  upload(files: FileList): Observable<any> {
    let formData = new FormData()
    for (var i = 0; i < files.length; i++) {
      formData.append("uploads[]", files[i], files[i].name)
    }
    return this.http.post<any>(`${this.url}/upload`, formData)
  }
}
