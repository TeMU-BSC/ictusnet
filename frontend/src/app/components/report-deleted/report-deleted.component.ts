import { Component, Inject } from '@angular/core'
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar'
import { interval } from 'rxjs'
import { take } from 'rxjs/operators'

@Component({
  selector: 'app-report-deleted',
  templateUrl: './report-deleted.component.html',
  styleUrls: ['./report-deleted.component.scss']
})
export class ReportDeletedComponent {

  percentage: number = 100
  remainingTime = 0

  constructor(
    public snackBarRef: MatSnackBarRef<ReportDeletedComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any,
  ) {
    this.startCountdown(this.data.duration)
  }

  startCountdown(milliseconds: number) {
    const seconds = milliseconds / 1000
    this.remainingTime = seconds
    const numbers = interval(1000)
    const countdownSeconds = numbers.pipe(take(seconds + 1))
    countdownSeconds.subscribe(next => {
      this.remainingTime = seconds - next
      this.percentage = 100 - (100 / seconds * next)
    })
  }

}
