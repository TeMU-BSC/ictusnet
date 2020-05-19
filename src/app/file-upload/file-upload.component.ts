import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {

  texta: string;
  textb: string;

  constructor() { }

  ngOnInit(): void {
  }

  handleFileInput(event) {
    // this.fileToUpload = files.item(0);

    var file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = (e) => {
      // The file's text will be printed here
      console.log(e.target.result)
      localStorage.setItem(file.name, e.target.result.toString());
    };
    reader.readAsText(file);

  }

  fileChange(event) {
    let file = event.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      // console.log(reader.result);
      localStorage.setItem(file.name, reader.result.toString());
    }

    this.texta = localStorage.getItem('a.txt')
    this.textb = localStorage.getItem('b.txt')
    this.textb = localStorage.getItem('377259358.utf8.txt')




    // let fileSaverService = new FileSaverService;
    // var blob = new Blob(["Hello, world!"], { type: "text/plain;charset=utf-8" });
    // fileSaverService.save(file, "hello.txt");

  }

}
