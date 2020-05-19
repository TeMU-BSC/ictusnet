import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileLoadService {

  reader: FileReader = new FileReader();

  constructor() { }

  // postFile(fileToUpload: File): Observable<boolean> {
  //   const endpoint = 'your-destination-url';
  //   const formData: FormData = new FormData();
  //   formData.append('fileKey', fileToUpload, fileToUpload.name);
  //   return this.httpClient
  //     .post(endpoint, formData, { headers: yourHeadersConfig })
  //     .map(() => { return true; })
  //     .catch((e) => this.handleError(e));

  loadFile(fileToLoad: File) {
    // this.reader.onload = event => console.log(event.target.result) // desired file content
    // this.reader.onerror = error => reject(error)
    this.reader.readAsText(fileToLoad, 'UTF-8') // you could also read images and other binaries

    localStorage.setItem(fileToLoad.name, this.reader.result.toString());
  }

}
