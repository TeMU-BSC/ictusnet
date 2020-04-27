export const camelCase = (str) => str
  .replace(/\s(.)/g, ($1) => $1.toUpperCase())
  .replace(/\s/g, '')
  .replace(/^(.)/, ($1) => $1.toLowerCase());

// String.prototype.toCamelCase = function () {
//   return this.replace(/(\-[a-z])/g, ($1) => $1.toUpperCase().replace('-', ''));
// };
