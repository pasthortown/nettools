import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss']
})
export class BodyComponent implements OnInit {;
  @Output('groups_change') groups_change: EventEmitter<any[]> = new EventEmitter();
  @Input('groups') groups: any[] = [];

  ngOnInit(): void {

  }

  send_changes() {
    this.groups_change.emit(this.groups);
  }
}
