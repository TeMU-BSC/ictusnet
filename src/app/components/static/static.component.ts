import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';

@Component({
  selector: 'app-static',
  templateUrl: './static.component.html',
  // templateUrl: './simple.component.html',
  styleUrls: ['./static.component.scss']
})
export class StaticComponent {

  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('downloadButton') downlaodButton: HTMLElement;

  step: number = 0;
  setStep(index: number) {
    this.step = index;
  }
  nextStep() {
    this.step++;
  }
  prevStep() {
    this.step--;
  }

  confirm() {
    confirm('¿Estas seguro?');
  }

  finish() {
    this.accordion.closeAll();
    this.downlaodButton.focus();
  }

  download() {
    // TODO (copy from what I've already done in the other component)
  }

}
