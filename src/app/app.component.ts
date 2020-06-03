import { Component } from '@angular/core';
import { faGithubAlt } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  faGithubAlt = faGithubAlt;

  fileId: string = '321687159';
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

  selectFile(fileId: string) {
    this.selectedFileId = fileId;
  }

  // files: string[] = [
  //   '321108781.utf8.ann',
  //   '321108781.utf8.txt',
  //   '321687159.utf8.ann',
  //   '321687159.utf8.txt',
  //   '324602237.utf8.ann',
  //   '324602237.utf8.txt',
  //   '325139862.utf8.ann',
  //   '325139862.utf8.txt',
  //   '328077361.utf8.ann',
  //   '328077361.utf8.txt',
  //   '328342806.utf8.ann',
  //   '328342806.utf8.txt',
  //   '328359837.utf8.ann',
  //   '328359837.utf8.txt',
  //   '330011073.utf8.ann',
  //   '330011073.utf8.txt',
  //   '330459779.utf8.ann',
  //   '330459779.utf8.txt',
  //   '330682083.utf8.ann',
  //   '330682083.utf8.txt',
  // ];

}
