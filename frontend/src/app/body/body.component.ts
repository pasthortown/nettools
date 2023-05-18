import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss']
})
export class BodyComponent implements OnInit {;
  @Output('groups_change') groups_change: EventEmitter<any[]> = new EventEmitter();
  @Input('groups') groups: any[] = [];
  @Input('profile_selected') profile_selected: any = { item_id: 'all', nombre: 'Visión Completa', groups: [] };

  groups_shown: any[] = [];

  ngOnInit(): void {

  }

  ngOnChanges() {
    if (typeof this.profile_selected.groups != 'undefined') {
      this.groups_shown = [];
      this.groups.forEach((element: any) => {
        let existe = false;
        this.profile_selected.groups.forEach((element_2: any) => {
          if (element.item_id == element_2.item_id) {
            existe = true;
          }
        });
        if (this.profile_selected.item_id == 'all') {
          existe = true;
        }
        if (existe) {
          this.groups_shown.push(element);
        }
      });
    }
  }

  send_changes() {
    this.groups_change.emit(this.groups);
  }
}
