import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

// http
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'

// formly
import { FormlyModule } from '@ngx-formly/core'
import { FormlyMaterialModule } from '@ngx-formly/material'
import { FormlyWrapperAddons } from './formly/addons.wrapper'
import { FlexLayoutType } from './formly/flex-layout.type'
import { addonsExtension } from './formly/addons.extension'

// styling
import { MaterialModule } from './material/material.module'
import { FlexLayoutModule } from '@angular/flex-layout'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

// highlighting
// npm install mark.js

// app
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { FieldComponent } from './components/form/form.component'
import { LoaderInterceptor } from './interceptors/loader.interceptor'
import { LoaderComponent } from './components/loader/loader.component'
import { DialogComponent } from './components/dialog/dialog.component'

@NgModule({
  declarations: [
    AppComponent,
    FormlyWrapperAddons,
    FlexLayoutType,
    FieldComponent,
    LoaderComponent,
    DialogComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    FontAwesomeModule,
    FormlyModule.forRoot({
      extras: { lazyRender: true },
      validationMessages: [
        { name: 'required', message: 'This field is required' },
      ],
      wrappers: [
        { name: 'addons', component: FormlyWrapperAddons },
      ],
      extensions: [
        { name: 'addons', extension: { onPopulate: addonsExtension } },
      ],
      types: [
        { name: 'flex-layout', component: FlexLayoutType },
      ],
    }),
    FormlyMaterialModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
