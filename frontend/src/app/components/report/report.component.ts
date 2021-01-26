import { Component, Input, OnInit } from '@angular/core'
import { ActivatedRoute, ParamMap } from '@angular/router'
import { Report } from 'src/app/interfaces/interfaces'
import { ApiService } from 'src/app/services/api.service'

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  @Input() report: Report

  constructor(
    private api: ApiService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // this.fetchReport()
  }

  fetchReport(): void {
    this.route.paramMap.subscribe((paramsAsMap: ParamMap) => {
      const filename = paramsAsMap.get('filename')
      console.log(filename)

      this.api.getReport(filename).subscribe(response => this.report = response)
    })
  }

}
