import { NgModule } from '@angular/core'

// Import the NgModule for each component you want to use:
// import { MatAutocompleteModule } from '@angular/material/autocomplete'
// import { MatBottomSheetModule } from '@angular/material/bottom-sheet'
import { MatButtonModule } from '@angular/material/button'
// import { MatCardModule } from '@angular/material/card'
// import { MatChipsModule } from '@angular/material/chips'
// import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
// import { MatListModule } from '@angular/material/list'
// import { MatMenuModule } from '@angular/material/menu'
// import { MatRadioModule } from '@angular/material/radio'
// import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar'
// import { MatTableModule } from '@angular/material/table'
// import { MatTabsModule } from '@angular/material/tabs'
// import { MatToolbarModule } from '@angular/material/toolbar'
// import { MatTooltipModule } from '@angular/material/tooltip'
// import { MaterialFileInputModule } from 'ngx-material-file-input'
import { MAT_LABEL_GLOBAL_OPTIONS } from '@angular/material/core';

const material = [
  // MatAutocompleteModule,
  // MatBottomSheetModule,
  MatButtonModule,
  // MatCardModule,
  // MatToolbarModule,
  MatIconModule,
  MatFormFieldModule,
  MatInputModule,
  // MatListModule,
  // MatTableModule,
  // MatChipsModule,
  // MatTabsModule,
  // MatRadioModule,
  // MatSnackBarModule,
  // MatTooltipModule,
  // MatDialogModule,
  // MatMenuModule,
  // MaterialFileInputModule
]

@NgModule({
  declarations: [
  ],
  imports: material,
  exports: material,
  providers: [
    // { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 5000 } },

    // { provide: MatDialogRef, useValue: {} },
    // { provide: MAT_DIALOG_DATA, useValue: {} },

    { provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: { float: 'always' } }
  ],
  bootstrap: []
})
export class MaterialModule { }
