import { Annotation } from './annotation';

export const camelCase = (str) => str
  .replace(/\s(.)/g, ($1) => $1.toUpperCase())
  .replace(/\s/g, '')
  .replace(/^(.)/, ($1) => $1.toLowerCase());

// String.prototype.toCamelCase = function () {
//   return this.replace(/(\-[a-z])/g, ($1) => $1.toUpperCase().replace('-', ''));
// };

/**
 * Parse an annotation multiline string in brat format, commonly present in files with `.ann` extension.
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Ranges
 */
export function parseBratAnnotations(multilineBratAnnotations: string): Annotation[] {
  const annotations: Annotation[] = []
  const regex: RegExp = /^(T\d+)\t(\w+) ((\d+) (\d+))\t(.*)$/gm;
  let match: RegExpExecArray;
  while ((match = regex.exec(multilineBratAnnotations)) !== null) {
    annotations.push({
      id: match[1],
      category: match[2],
      offset: {
        start: Number(match[4]),
        end: Number(match[5]),
      },
      span: match[6]
    });
  }
  return annotations;
}
