import { Component, Input, OnInit } from '@angular/core'
import { ActivatedRoute, ParamMap } from '@angular/router'
import { Report } from 'src/app/interfaces/interfaces'
import { ApiService } from 'src/app/services/api.service'
import { Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  @Input() report: Report
  @Output() emitDeleteReportToParent: EventEmitter<void> = new EventEmitter<void>()
  

  constructor(
    private api: ApiService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // this.fetchReport()
  }

  // fetchReport(): void {
  //   this.route.paramMap.subscribe((paramsAsMap: ParamMap) => {
  //     const filename = paramsAsMap.get('filename')
  //     this.api.getReport(filename).subscribe(response => this.report = response)
  //   })
  // }

}
