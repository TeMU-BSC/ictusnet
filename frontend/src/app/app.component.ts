import { Component } from '@angular/core'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { ApiService } from './services/api.service'
import { Document, Option, Variable } from './models/models'
import { MatDialog } from '@angular/material/dialog'
import { DialogComponent } from './components/dialog/dialog.component'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  faGithub = faGithub
  documents: Document[] = []
  currentDocument: Document
  files: FileList
  loading = false
  uploading = false

  constructor(
    private api: ApiService,
    public dialog: MatDialog,
  ) {
    this.loadDemo()
  }

  goToThisGithubRepo() {
    window.open('https://github.com/TeMU-BSC/ictusnet')
  }

  loadDemo(): void {
    this.api.getDemo().subscribe(response => {
      this.documents = response['documents']
      this.currentDocument = this.documents[0]
      this.saveCurrentDocumentToLocalStorage()
    })
  }

  uploadDocuments(event: Event): void {
    this.uploading = true
    this.files = (event.target as HTMLInputElement).files
    this.api.uploadDocuments(this.files).subscribe(result => {
      this.uploading = false
      this.dialog.open(DialogComponent, {
        width: '500px',
        data: {
          title: 'Subida finalizada',
          content: `Se han subido correctamente ${result.documentCount} documentos.`,
          acceptButton: { text: 'Vale' }
        }
      })
      this.getDocuments()
    })
  }

  getDocuments(): void {
    this.loading = true
    this.api.getDocuments().subscribe(response => {
      this.documents = response['documents']
      this.currentDocument = this.documents[0]
      this.loading = false
    })
  }

  /**
   * Store in LocalStorage the current working document filename;
   * and then read from LocalStorage to come back where the user left.
   */
  saveCurrentDocumentToLocalStorage(): void {
    localStorage.setItem('currentDocument', this.currentDocument?.filename)
  }

}
