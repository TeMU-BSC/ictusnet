import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ictusnet';
  document: string;
  hola = 'hola';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get('assets/document.txt', { responseType: 'text' }).subscribe(
      data => this.document = data,
      err => console.error(err),
      () => console.log(typeof(this.document))
    );
  }
}
