import { Annotation } from './interfaces';

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
export function parseBratAnnotations(multilineBratAnnotations: string): Annotation[] {
  const annotations: Annotation[] = []
  const regex: RegExp = /(\w\d+)\t(\w+) ((\d+) (\d+))\t(.*)(\n#\d+\t\w+ \w\d+\t(.*))?/gm;
  let match: RegExpExecArray;
  while ((match = regex.exec(multilineBratAnnotations)) !== null) {
    annotations.push({
      id: match[1],
      entity: match[2],
      offset: {
        start: Number(match[4]),
        end: Number(match[5]),
      },
      span: match[6],
      notes: match[8]
    });
  }
  return annotations;
}
