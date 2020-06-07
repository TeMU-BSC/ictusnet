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
