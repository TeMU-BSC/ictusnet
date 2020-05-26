import { Pipe, PipeTransform } from '@angular/core'

// DECS-INDEXER
// import { toRegex } from 'diacritic-regex'
// import { removeConsecutiveSpaces } from '../utilities/functions'

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  // DECS-INDEXER
  // specialCharacters = ['+', '-', '(', ')', '[', ']', '.', '*', '?', '$']
  // transform(value: string, search: string): string {
  //   let regex: RegExp
  //   if (search) {
  //     search = removeConsecutiveSpaces(search)
  //     this.specialCharacters.forEach(char => search = search.replace(char, `\\${char}`))
  //     regex = toRegex()(search)
  //   }
  //   return value.replace(regex, '<strong>$&</strong>')
  // }

  // https://stackoverflow.com/a/44962110
  transform(value: any, args: any): any {
    if (!args) { return value; }
    var re = new RegExp(args, 'gi'); //'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
    return value.replace(re, "<mark>$&</mark>");
  }

}
