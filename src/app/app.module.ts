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
import { FormlyWrapperAddons } from './components/dynamic/addons.wrapper';
import { addonsExtension } from './components/dynamic/addons.extension';
import { FlexLayoutType } from './components/dynamic/flex-layout.type';

// styling
import { MaterialModule } from './material/material.module'
import { FlexLayoutModule } from '@angular/flex-layout';

// highlighting
import { HighlightPipe } from './pipes/highlight.pipe';

// app
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DynamicComponent } from './components/dynamic/dynamic.component';
import { StaticComponent } from './components/static/static.component';

@NgModule({
  declarations: [
    AppComponent,
    FormlyWrapperAddons,
    FlexLayoutType,
    HighlightPipe,
    DynamicComponent,
    StaticComponent,
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
