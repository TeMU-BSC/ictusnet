import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import * as DEMO_FILENAMES from 'src/assets/demo.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  faGithub = faGithub;
  files: FileList;
  filenames: string[];
  selected: string;

  // TODO replace demo path and fileIds for real uploaded files
  demoDirectory: string = 'assets/alejandro_sample/10';
  demoFilenames = (DEMO_FILENAMES as any).default;
  demo(): void {
    this.filenames = this.demoFilenames;
    this.selected = this.filenames[0];
  }

  constructor(private http: HttpClient) { }

  updateFiles(event): void {
    this.files = event.target.files;
    this.load(this.files);
    this.upload(this.files);
  }

  load(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file: File = files.item(i);
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        const content = reader.result.toString();
        localStorage.setItem(file.name, content);
      }
    }
    // localStorage.clear();
  }

  // https://blog.jscrambler.com/implementing-file-upload-using-node-and-angular/
  upload(files: FileList): void {
    let formData = new FormData();
    for (var i = 0; i < files.length; i++) {
      formData.append("uploads[]", files[i], files[i].name);
    }
    this.http.post('/api/upload', formData).subscribe(response => {
      alert(`${response['message']} Check F12 -> Application > LocalStorage.`);
      // this.readFromLocalStorage();
    });
  }

  readFromLocalStorage() {
    this.filenames = [];
    for (var i = 0; i < localStorage.length; i++) {
      this.filenames.push(localStorage.key(i));
    }
    this.selected = this.filenames[0];
  }

}
