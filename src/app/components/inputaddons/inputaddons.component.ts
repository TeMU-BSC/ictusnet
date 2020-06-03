import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions, FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-inputaddons',
  templateUrl: './inputaddons.component.html',
  styleUrls: ['./inputaddons.component.scss']
})
export class InputaddonsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {};

  fields: FormlyFieldConfig[] = [
    {
      key: 'left',
      type: 'input',
      templateOptions: {
        placeholder: 'Formly is terrific!',
        addonLeft: {
          class: 'fa fa-euro',
          text: 'heeey'
        },
        label: 'One add-on on the left (icon)',
      },
    },
    {
      key: 'both',
      type: 'input',
      templateOptions: {
        placeholder: 'How great is this?',
        addonLeft: {
          class: 'fa fa-home',
        },
        addonRight: {
          text: '$',
        },
        label: 'One add-on on both side (left: icon, right: text)',
      },
    },
    {
      key: 'right',
      type: 'input',
      templateOptions: {
        placeholder: 'Nice, isn\'t it??',

        addonRight: {
          class: 'fa fa-heart',
        },
        label: 'One add-on on the right (icon)',
      },
    },
  ];

  submit() {
    alert(JSON.stringify(this.model));
  }

}
