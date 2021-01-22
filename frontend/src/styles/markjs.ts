import Mark from 'mark.js'

import { Annotation } from "src/app/interfaces/interfaces"


/**
* Highlight the offset range (start, end) present in each given annotation within the HTML elements which have the CSS class named 'context'.
*
* https://markjs.io/#markranges
* https://jsfiddle.net/julmot/hexomvbL/
* https://github.com/iamdustan/smoothscroll/issues/47#issuecomment-350810238
* https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle
*
*/
export function highlight(annotations: Annotation[], highlightType: 'hint' | 'evidence' | 'auxiliar'): void {
  const instance = new Mark('.context')
  const ranges = annotations.map(a => ({ start: a.offset.start, length: a.offset.end - a.offset.start }))
  const options = {
    each: (element: HTMLElement) => setTimeout(() => element.classList.add('animate', highlightType), 250),
    done: (numberOfMatches: number) => {
      if (numberOfMatches) {
        const item = document.getElementsByTagName('mark')[0]  // what we want to scroll to
        const wrapper = document.getElementById('wrapper')  // the wrapper we will scroll inside
        const lineHeightPixels: number = Number(window.getComputedStyle(wrapper).getPropertyValue('line-height').replace('px', ''))
        const top = item.offsetTop - wrapper.scrollTop - lineHeightPixels * 10  // extra pixels distance from top
        wrapper.scrollBy({ top: top, left: 0, behavior: 'smooth' })
      }
    }
  }
  instance.unmark({
    done: () => instance.markRanges(ranges, options)
  })
}
