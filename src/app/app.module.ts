import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// http
import { HttpClientModule } from '@angular/common/http';

// forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { FormlyWrapperAddons } from './addons.wrapper';
import { addonsExtension } from './addons.extension';
import { FlexLayoutType } from './flex-layout.type';

// styling
import { MaterialModule } from './styling/material.module'
import { FlexLayoutModule } from '@angular/flex-layout';

// app
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    FormlyWrapperAddons,
    FlexLayoutType,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    MaterialModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule.forRoot({
      wrappers: [
        { name: 'addons', component: FormlyWrapperAddons },
      ],
      extensions: [
        { name: 'addons', extension: { onPopulate: addonsExtension } },
      ],
      types: [
        { name: 'flex-layout', component: FlexLayoutType }
      ],
    }),
    FormlyMaterialModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
