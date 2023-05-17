import { Component, OnInit } from '@angular/core';
import { EntitiesService } from './services/entities.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'frontend';
  groups: any[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    private entitiesService: EntitiesService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.get_groups();
  }

  get_groups() {
    this.spinner.show();
    this.groups = [];
    this.entitiesService.get_groups().then( (r: any) => {
      this.groups = r.response;
      this.spinner.hide();
    }).catch( e => {
      console.log(e);
      this.spinner.hide();
     });
  }
}
