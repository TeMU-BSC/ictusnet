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
  files: string[] = [
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
  selected: string;
  // selected: string = '321108781';    // default selected file

  selectFirst() {
    this.selected = '321108781';
  }

}
