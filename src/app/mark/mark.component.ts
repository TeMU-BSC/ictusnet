import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';

// import { Mark } from 'mark.js';
// /home/alejandro/code/ictusnet/node_modules/mark.js/src/lib/mark.js

@Component({
  selector: 'app-mark',
  templateUrl: './mark.component.html',
  styleUrls: ['./mark.component.scss']
})
export class MarkComponent implements AfterViewInit {

  title = 'ngx-markjs-demo';
  @ViewChild('search', { static: false }) searchElemRef: ElementRef;
  searchText$: Observable<string>;
  searchConfig = { separateWordSearch: false };

  ngAfterViewInit() {
    this.searchText$ = fromEvent(this.searchElemRef.nativeElement, 'keyup').pipe(
      map((e: Event) => (e.target as HTMLInputElement).value),
      debounceTime(300),
      distinctUntilChanged()
    );


    // var context = document.querySelector(".context"); // requires an element with class "context" to exist
    // var instance = new Mark(context);
    // instance.markRanges([{
    //   start: 15,
    //   length: 5
    // }, {
    //   start: 25,
    //   length: 8
    // }]); // marks matches with ranges 15-20 and 25-33



    // context.markRanges(ranges, {
    //   debug: true,
    //   each: function(node, range) {
    //     var start = range.start,
    //       found = results.find(function(el) {
    //         return el.offset === start;
    //       }) || null;
    //     if (found) {
    //       node.classList.add(found.rule.issueType);
    //       node.setAttribute('title', found.rule.issueType + ': ' + found.rule.description);
    //     }
    //   }
    // });

  }

}
