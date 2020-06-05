import Mark from 'mark.js';
import { Suggestion } from 'src/app/interfaces/interfaces';

/**
 * Remove the spelling accents may contain the given text.
 * https://stackoverflow.com/a/37511463
 */
export function removeAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Convert a string to camelCase format.
 */
export const camelCase = (str) => str
  .replace(/\s(.)/g, ($1) => $1.toUpperCase())
  .replace(/\s/g, '')
  .replace(/^(.)/, ($1) => $1.toLowerCase());

/**
 * Parse an annotation multiline string in brat format, commonly present in files with `.ann` extension.
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Ranges
 */
export function parseBratSuggestions(multilineBratSuggestions: string): Suggestion[] {
  const annotations: Suggestion[] = []
  const regex: RegExp = /(\w\d+)\t(\w+) ((\d+) (\d+))\t(.*)(\n#\d+\t\w+ \w\d+\t(.*))?/gm;
  let match: RegExpExecArray;
  while ((match = regex.exec(multilineBratSuggestions)) !== null) {
    annotations.push({
      id: match[1],
      entity: match[2],
      offset: {
        start: Number(match[4]),
        end: Number(match[5]),
      },
      evidence: match[6],
      notes: match[8]
    });
  }
  return annotations;
}

/**
 * Check if an input is a valid date in `YYYY-MM-DD` format.
 *
 * https://stackoverflow.com/a/1353711
 */
export function isValidDate(input: string): boolean {
  const d = new Date(input);
  return d instanceof Date && !isNaN(d as any);
}

/**
 * Check if an input is a valid time in `hh:mm` format.
 *
 * https://stackoverflow.com/a/14472703
 */
export function isValidTime(input: string): boolean {
  return /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(input);
}

/**
 * Highlight, in the text with class `className`, the offsets present in the given suggestions.
 * Note: Requires an HTML element with the given `className` to exist.
 *
 * https://markjs.io/#markranges
 * https://jsfiddle.net/julmot/hexomvbL/
 *
 */
export function highlight(suggestions: Suggestion[], className: string) {
  const instance = new Mark(`.${className}`);
  const ranges = suggestions.map(sugg => ({ start: sugg.offset.start, length: sugg.offset.end - sugg.offset.start }));
  const options = {
    each: (element: HTMLElement) => setTimeout(() => element.classList.add("animate"), 250),
    done: (numberOfMatches: number) => {
      // numberOfMatches ? document.getElementsByTagName('mark')[0].scrollIntoView() : null;

      if (numberOfMatches) {

        // https://github.com/iamdustan/smoothscroll/issues/47#issuecomment-350810238
        let item = document.getElementsByTagName('mark')[0];  // what we want to scroll to
        let wrapper = document.getElementById('wrapper');  // the wrapper we will scroll inside
        let count = item.offsetTop - wrapper.scrollTop - 200;  // xx = any extra distance from top ex. 60
        wrapper.scrollBy({ top: count, left: 0, behavior: 'smooth' })
      }
    }
  };
  instance.unmark({
    done: () => instance.markRanges(ranges, options)
  });
}

/**
 * Create a temporary anchor <a> HTML element to simulate a click on it to
 * download a given object as a JSON file. When the file is downloaded, the
 * temporary HTML is removed.
 */
export function downloadObjectAsJson(object: any, fileName: string): void {
  const element = document.createElement('a');
  const href = `data:text/json;charset=UTF-8,${encodeURIComponent(JSON.stringify(object, (k, v) => v === undefined ? null : v))}`;
  element.setAttribute('href', href);
  element.setAttribute('download', fileName);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();  // simulate click
  document.body.removeChild(element);
}
