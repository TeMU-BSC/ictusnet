import { Component, OnInit } from '@angular/core'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { ApiService } from './services/api.service'
import { Report } from './interfaces/interfaces'
import { MatDialog } from '@angular/material/dialog'
import { DialogComponent } from './components/dialog/dialog.component'
import { downloadObjectAsJson } from './helpers/json'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  faGithub = faGithub
  reports: Report[] = []
  files: FileList
  loading = false
  uploading = false
  filters = [
    { name: 'Bandeja de entrada', icon: 'inbox' },
    { name: 'Completados', icon: 'assignment_turned_in' },
    { name: 'Todos', icon: 'all_inbox' },
  ]
  currentReport: Report
  currentFilter: any

  constructor(
    private api: ApiService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.getReports()
  }

  goToThisGithubRepo(): void {
    window.open('https://github.com/TeMU-BSC/ictusnet')
  }

  setFilter(filter: any): void {
    this.currentFilter = filter
    console.log(this.currentFilter)

  }

  uploadReports(event: Event): void {
    this.uploading = true
    this.files = (event.target as HTMLInputElement).files
    this.api.uploadReports(this.files).subscribe(result => {
      this.uploading = false
      this.dialog.open(DialogComponent, {
        width: '500px',
        data: {
          title: 'Subida finalizada',
          content: `Se han subido correctamente ${result.reportCount} informes.`,
          actions: {
            accept: { text: 'Vale' }
          }
        }
      })
      this.getReports()
    })
  }

  getReports(): void {
    this.api.getReports().subscribe(response => {
      this.reports = response
      this.currentReport = this.reports[0]
    })
  }

  /**
   * Store in LocalStorage the current working report filename;
   * and then read from LocalStorage to come back where the user left.
   */
  // saveCurrentReportToLocalStorage(): void {
  //   localStorage.setItem('currentReport', this.currentReport?.filename)
  // }

  downloadAllReports(): void {
    this.api.getReports().subscribe(response => {
      const results = response
      const timestamp = new Date().toISOString()
      downloadObjectAsJson(results, `ictusnet-results-${timestamp}.json`)
    })
  }

  resetDatabase(): void {
    const confirmed = confirm('Esta es una funcionalidad de desarrollo para testear la herramienta web. ¿Seguro que quieres borrar los datos actuales en MongoDB?')
    if (confirmed) {
      this.api.resetDatabase().subscribe(response => {
        this.dialog.open(DialogComponent, {
          width: '500px',
          data: {
            title: 'Database has been reset successfully',
            content: `${response['message']}`,
            actions: {
              accept: { text: 'OK' }
            }
          }
        })
        this.getReports()
      })
    }
  }

}
