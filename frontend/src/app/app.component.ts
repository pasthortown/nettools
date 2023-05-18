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
  profiles: any[] = [];
  profile_selected: any = { item_id: 'all', nombre: 'Visión Completa', groups: [] };

  constructor(
    private spinner: NgxSpinnerService,
    private entitiesService: EntitiesService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.get_groups();
  }

  get_profiles() {
    this.spinner.show();
    this.profiles = [];
    this.entitiesService.get_profiles().then( (r: any) => {
      this.profiles = r.response;
      this.profiles.push({ item_id: 'all', nombre: 'Visión Completa', groups: [] });
      if (this.profiles.length > 0) {
        this.profiles.sort((a: any, b: any) => {
          if (a.nombre > b.nombre) {
            return 1;
          }
          if (a.nombre < b.nombre) {
            return -1;
          }
          return 0;
        });
      }
      this.spinner.hide();
    }).catch( e => {
      console.log(e);
      this.spinner.hide();
     });
  }

  get_groups() {
    this.spinner.show();
    this.groups = [];
    this.entitiesService.get_groups().then( (r: any) => {
      this.groups = r.response;
      this.spinner.hide();
      this.get_profiles();
    }).catch( e => {
      console.log(e);
      this.spinner.hide();
     });
  }

  select_profile(event: any) {
    this.profile_selected = event;
  }
}
