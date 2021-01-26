import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { ReportComponent } from './components/report/report.component'

const routes: Routes = [
  { path: 'report/:filename', component: ReportComponent, outlet: 'report' },
  // { path: '**', component: PageNotFoundComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
