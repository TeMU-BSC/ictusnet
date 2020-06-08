import { Component } from '@angular/core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  menuOpen = false;
  faGithub = faGithub;
  files: string[];
  selected: string;

  loadDemo() {
    this.files = [
      '321108781',
      '321687159',
      '324602237',
      '325139862',
      '328077361',
      '328342806',
      '328359837',
      '330011073',
      '330459779',
      '330682083',
    ];
    this.selected = this.files[0];
  }

  uploadFiles(event) {

    // ONLY txt file
    this.files = event.target.files;
    // var reader = new FileReader();
    // reader.readAsText(this.file);
    // reader.onload = () => {
    //   this.text = reader.result.toString();

    //   // TODO localstorage with array of files
    //   localStorage.setItem(this.file.name, reader.result.toString());
    //   this.text = localStorage.getItem('377259358.utf8.txt');
    // }

    console.log(this.files);

  }

}
