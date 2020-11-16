import { Component } from '@angular/core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { ApiService } from 'src/app/services/api.service';
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

  constructor(private api: ApiService) { }

  updateFiles(event): void {
    this.files = event.target.files;
    this.load(this.files);
    this.api.upload(this.files).subscribe((response) => {
      alert(`${response["message"]} Check F12 -> Application > LocalStorage.`);
    });
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

  readFromLocalStorage() {
    this.filenames = [];
    for (var i = 0; i < localStorage.length; i++) {
      this.filenames.push(localStorage.key(i));
    }
    this.selected = this.filenames[0];
  }

}
