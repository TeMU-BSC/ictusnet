import { Component } from '@angular/core'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { ApiService } from './services/api.service'
import { Report } from './interfaces/interfaces'
// import * as DEMO_FILENAMES from 'src/assets/demo.json'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  faGithub = faGithub;
  files: FileList
  filenames: string[]
  // selected: string
  reports: Report[]
  selectedReport: Report

  constructor(private api: ApiService) { }

  demo(): void {
    // this.filenames = this.demoFilenames
    // this.selected = this.filenames[0]

    this.api.demo().subscribe(reports => {
      this.reports = reports
      this.selectedReport = this.reports[0]
      this.filenames = reports.map(report => report.filename)
    })
  }

  updateFiles(event): void {
    this.files = event.target.files
    this.load(this.files)
    this.api.upload(this.files).subscribe((response) => {
      alert(`${response["message"]} Check F12 -> Application > LocalStorage.`)
    })
  }

  load(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file: File = files.item(i)
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = () => {
        const content = reader.result.toString()
        localStorage.setItem(file.name, content)
      }
    }
    // localStorage.clear();
  }

  readFromLocalStorage() {
    this.filenames = []
    for (var i = 0; i < localStorage.length; i++) {
      this.filenames.push(localStorage.key(i))
    }
    this.selectedReport = this.reports[0]
  }

}
