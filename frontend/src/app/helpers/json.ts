/**
 * Create a temporary anchor <a> HTML element to simulate a click on it to
 * download a given object as a JSON file. When the file is downloaded, the
 * temporary HTML is removed.
 */
export const downloadObjectAsJson = (object: any, fileName: string): void => {
  const element = document.createElement('a')
  const href = `data:text/json;charset=UTF-8,${encodeURIComponent(JSON.stringify(object, (k, v) => v === undefined ? null : v))}`
  element.setAttribute('href', href)
  element.setAttribute('download', fileName)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()  // simulate click
  document.body.removeChild(element)
}
