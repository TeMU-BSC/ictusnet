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

// https://www.npmjs.com/package/ngx-markjs
// dependency: npm install mark.js --save-dev
// import { NgxMarkjsModule } from 'ngx-markjs';

// import { HighlightPipe } from './pipes/highlight.pipe';

import { TextInputHighlightModule } from 'angular-text-input-highlight';

// app
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DemoComponent } from './demo/demo.component';
// import { MarkComponent } from './mark/mark.component';

@NgModule({
  declarations: [
    AppComponent,
    FormlyWrapperAddons,
    FlexLayoutType,
    DemoComponent,
    // MarkComponent,
    // HighlightPipe,
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
    // NgxMarkjsModule,
    TextInputHighlightModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
