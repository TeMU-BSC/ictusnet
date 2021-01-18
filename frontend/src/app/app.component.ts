import { Component } from '@angular/core'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { ApiService } from './services/api.service'
import { Document } from './interfaces/interfaces'

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

  constructor(private api: ApiService) { }

  getAnnotatedDocuments(isDemo = false): void {
    this.loading = true
    this.api.getAnnotatedDocuments({ isDemo }).subscribe(documents => {
      this.documents = documents
      this.selectedDocument = this.documents[0]
      this.loading = false
    })
  }

  fileChange(event: Event): void {
    this.uploading = true
    this.files = (event.target as HTMLInputElement).files
    this.api.upload(this.files).subscribe(result => {
      console.log(result.message)

      // this.load(this.files)
      this.getAnnotatedDocuments()
      this.uploading = false
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
