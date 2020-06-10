import { Component } from '@angular/core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import * as DEMO_FILENAMES from 'src/assets/demo.json';
import { ParsingService } from './services/parsing.service';
import { HttpClient } from '@angular/common/http';

// TODO https://blog.jscrambler.com/implementing-file-upload-using-node-and-angular/

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
    const files = event.target.files;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("documents[]", files[i], files[i]['name']);
    }
    this.http.post('http://localhost:3000/upload', formData).subscribe(response => console.log('response: ', response))
  }

}
