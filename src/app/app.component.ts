import { Component } from '@angular/core';
import { faGithubAlt } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  fileIds: string[] = [
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
  selectedFileId: string = this.fileIds[0];
  faGithubAlt = faGithubAlt;

  selectFile(fileId: string) { this.selectedFileId = fileId }

}
