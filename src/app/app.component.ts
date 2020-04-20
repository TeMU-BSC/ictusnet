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
  selection: Selection;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get('assets/document.txt', { responseType: 'text' }).subscribe(data => this.document = data);
  }

  saveSpan(event) {
    if (window.getSelection().toString()) {
      this.selection = window.getSelection();
    }

    // this.selectedText = this.selection.toString();
    // this.start = this.selection.getRangeAt(0).startOffset;
    // this.end = this.selection.getRangeAt(0).endOffset;
    // if (this.selectedText.length) {
    //   console.log(this.text, this.start, this.end);
    //   alert(`Selected text: ${this.text}\nStart: ${this.start}\nEnd: ${this.end}`);
    // }
  }

}
