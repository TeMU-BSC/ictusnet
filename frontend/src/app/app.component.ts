import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import * as DEMO_FILENAMES from 'src/assets/demo.json';
import { ParsingService } from './services/parsing.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  menuOpen = false;
  faGithub = faGithub;
  filenames: string[];
  selected: string;

  demoDirectory: string = 'assets/alejandro_sample/10/';
  demoFilenames = (DEMO_FILENAMES as any).default;

  files: FileList;
  uploadedFiles: Array<File>;

  constructor(
    private http: HttpClient,
    private parser: ParsingService,
  ) { }

  loadDemo() {
    this.filenames = this.demoFilenames;
    this.selected = this.filenames[0];
  }

  uploadFiles(event) {
    this.files = event.target.files;
    // console.log(this.files);

    // loop through files
    for (let i = 0; i < this.files.length; i++) {
      const file: File = this.files.item(i);
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        const content = reader.result.toString();
        localStorage.setItem(file.name, content);
        console.log(localStorage);

        localStorage.clear();
      }
    }

    // this.demoFilenames.forEach(filename => {
    //   this.parser.getTextFromFile(`${this.demoDirectory}${filename}.utf8.txt`).subscribe(data => console.log(data));
    // });

  }

  // https://blog.jscrambler.com/implementing-file-upload-using-node-and-angular/
  upload(event) {
    this.uploadedFiles = event.target.files;
    let formData = new FormData();
    for (var i = 0; i < this.uploadedFiles.length; i++) {
      formData.append("uploads[]", this.uploadedFiles[i], this.uploadedFiles[i].name);
    }
    this.http.post('/api/upload', formData).subscribe(response => {
      console.log('response received is ', response);
    });
  }

}
