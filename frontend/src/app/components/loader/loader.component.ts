import { Component } from '@angular/core'
import { LoaderService } from './loader.service'

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {

  isLloading: boolean

  constructor(private loaderService: LoaderService) {
    this.loaderService.isLoading.subscribe(v => this.isLloading = v)
  }

}
