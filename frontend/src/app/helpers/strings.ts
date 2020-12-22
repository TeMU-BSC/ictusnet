/**
 * Remove the spelling accents may contain the given text.
 * https://stackoverflow.com/a/37511463
 */
export const removeAccents = (text: string): string => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

/**
 * Convert a string to camelCase format.
 */
export const camelCase = (str: string): string => {
  return str
    .replace(/\s(.)/g, ($1) => $1.toUpperCase())
    .replace(/\s/g, '')
    .replace(/^(.)/, ($1) => $1.toLowerCase())
}

/**
 * Check if an input is a valid date in `YYYY-MM-DD` format.
 *
 * https://stackoverflow.com/a/1353711
 */
export const isValidDate = (input: string): boolean => {
  const d = new Date(input)
  return d instanceof Date && !isNaN(d as any)
}

/**
 * Check if an input is a valid time in `hh:mm` format.
 *
 * https://stackoverflow.com/a/14472703
 */
export const isValidTime = (input: string): boolean => /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(input)
