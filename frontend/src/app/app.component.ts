import { Component } from '@angular/core'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { ApiService } from './services/api.service'
import { Document } from './interfaces/interfaces'
import { MatDialog } from '@angular/material/dialog'
import { DialogComponent } from './components/dialog/dialog.component'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  faGithub = faGithub;
  files: FileList
  documents: Document[]
  selectedDocument: Document
  loading = false
  uploading = false

  constructor(
    private api: ApiService,
    public dialog: MatDialog,
  ) { }

  getDemo(): void {
    this.loading = true
    this.api.getDemo().subscribe(response => {
      this.documents = response['documents']
      this.selectedDocument = this.documents[0]
      this.loading = false
    })
  }

  getDocuments(): void {
    this.loading = true
    this.api.getDocuments().subscribe(response => {
      this.documents = response['documents']
      this.selectedDocument = this.documents[0]
      this.loading = false
    })
  }

  fileChange(event: Event): void {
    this.uploading = true
    this.files = (event.target as HTMLInputElement).files
    this.api.uploadDocuments(this.files).subscribe(result => {
      this.uploading = false
      this.dialog.open(DialogComponent, {
        width: '500px',
        data: {
          title: 'Subida finalizada',
          content: `Se han subido correctamente ${result.documentCount} documentos.`,
          cancelButton: '',
          acceptButton: 'Vale',
          buttonColor: 'primary',
        }
      })
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
    const filenames = Array.from(localStorage)
    console.log(filenames)

  }

}
