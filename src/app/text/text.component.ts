import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements OnInit {

  text: string;

  constructor(
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.http.get('assets/pipeline/input/377259358.utf8.txt', { responseType: 'text' }).subscribe(data => this.text = data);
  }

  select(event) {
    const start = event.target.selectionStart;
    const end = event.target.selectionEnd;
    const selection = event.target.value.substr(start, end - start);
    console.log(selection, start, end);
  }

}
