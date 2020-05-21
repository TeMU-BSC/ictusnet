import { Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'app-bottom-sheet',
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.scss']
})
export class BottomSheetComponent {

  constructor(
    public bottomSheetRef: MatBottomSheetRef<BottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) { }

  pickField(event: MouseEvent, field: FormlyFieldConfig): void {
    this.bottomSheetRef.dismiss(field);
    event.preventDefault();
  }

}
