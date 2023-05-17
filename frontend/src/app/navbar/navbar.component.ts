import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EntitiesService } from '../services/entities.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {;
  @Output('groups_change') groups_change: EventEmitter<any[]> = new EventEmitter();
  @Input('groups') groups: any[] = [];
  action: string = '';

  new_group: any = {
    nombre: '',
    hosts: []
  }

  ngOnInit(): void {

  }

  constructor(
    private entitiesService: EntitiesService,
    private modalService: NgbModal) {}

  openDialog(content: any, action: string) {
    this.action = action;
    this.modalService.open(content, { centered: true , size: 'lg', backdrop: 'static', keyboard: false }).result.then(( response => {
      if (response == 'Guardar Grupo') {
        if (this.new_group.nombre == '') {
          Swal.fire(
            'Crear Grupo',
            'Nombre de Grupo Requerido',
            'error'
          )
        } else {
          if (action == 'create') {
            this.entitiesService.create_group(this.new_group).then( (r:any) => {
              this.groups_change.emit(this.groups);
            }).catch( e => { console.log(e); });
          }
        }

      }
    }), ( r => {}));
  }


  // this.modalService.dismissAll('Guardar click');
}
