import { Component } from '@angular/core'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { ApiService } from './services/api.service'
import { Report } from './interfaces/interfaces'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  faGithub = faGithub;
  files: FileList
  reports: Report[]
  selectedReport: Report
  isDemo = false
  isLoading = false

  filenames: string[]

  constructor(private api: ApiService) { }

  getAnnotatedReports(): void {
    this.isLoading = true
    this.api.getAnnotatedReports({ isDemo: this.isDemo }).subscribe(reports => {
      this.reports = reports
      this.selectedReport = this.reports[0]
      this.isLoading = false
      // this.filenames = reports.map(report => report.filename)
    })
  }

  fileChange(event: Event): void {
    this.files = (event.target as HTMLInputElement).files
    this.api.upload(this.files).subscribe(result => {
      console.log(result.message)

      this.load(this.files)
      console.log(`Check F12 -> Application > LocalStorage.`)

      this.getAnnotatedReports()

      // this.load(annFiles)
    })
  }

  load(files: FileList): void {
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = () => {
        const content = reader.result.toString()
        localStorage.setItem(file.name, content)
      }
    })
    // localStorage.clear();
  }

  readFromLocalStorage() {
    this.filenames = Array.from(localStorage)
    // Array.from(localStorage).forEach(item => this.filenames.push(item))

    // for (var i = 0; i < localStorage.length; i++) {
    //   this.filenames.push(localStorage.key(i))
    // }
    this.selectedReport = this.reports[0]
  }

}
