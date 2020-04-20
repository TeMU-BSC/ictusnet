import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Annotation {
  id: string;
  category: string;
  offset: string;
  start: number;
  end: number;
  span: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'ictusnet';

  text: string;
  annTsv: string;
  annotations: Annotation[] = [];

  selection: Selection;
  selectedText: string;
  start: number;
  end: number;

  // annotations testing
  id = 0;
  category = 'CATEGORY_PLACEHOLDER';
  notes = 'AnnotatorNotes';
  note = 'This is some note';
  annPreview: string;
  savedSingleAnnotation: string;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get('assets/document.txt', { responseType: 'text' }).subscribe(data => this.text = data);
    this.http.get('assets/document.ann', { responseType: 'text' }).subscribe(data => this.annTsv = data);
  }

  showSelection() {
    if (window.getSelection().toString()) {
      this.selection = window.getSelection();
      this.selectedText = this.selection.toString();
      this.start = this.selection.getRangeAt(0).startOffset;
      this.end = this.selection.getRangeAt(0).endOffset;
      this.annPreview = `T${this.id}\t${this.category}\t${this.start} ${this.end}\t${this.selectedText}\n` +
        `#${this.id}\t${this.notes} T${this.id}\t${this.note}`;
    }
  }

  saveAnn() {
    this.savedSingleAnnotation = this.annPreview;
  }

  /**
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Ranges
   */
  parseAnn() {
    const regex = /^(T\d)\t(\w+)\t((\d+) (\d+))\t(.*)$/gm;
    let match: RegExpExecArray;
    while ((match = regex.exec(this.annTsv)) !== null) {
      this.annotations.push({
        id: match[1],
        category: match[2],
        offset: match[3],
        start: Number(match[4]),
        end: Number(match[5]),
        span: match[6]
      });
    }
  }

}
