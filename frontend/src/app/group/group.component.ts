import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EntitiesService } from '../services/entities.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {;
  @Output('group_change') group_change: EventEmitter<any[]> = new EventEmitter();
  @Input('group') group: any = {
    nombre: '',
    hosts: []
  };

  new_host: any = {
    nombre: '',
    target: '',
    descripcion: '',
    priority: '-'
  }

  constructor(
    private entitiesService: EntitiesService,
    private modalService: NgbModal) {}

  ngOnInit(): void {

  }

  ngOnChanges() {
    if (this.group.hosts.length > 0) {
      this.group.hosts.sort((a: any, b: any) => {
        if (a.priority > b.priority) {
          return 1;
        }
        if (a.priority < b.priority) {
          return -1;
        }
        return 0;
      });
    }
  }

  openDialog(content: any) {
    this.modalService.open(content, { centered: true , size: 'lg', backdrop: 'static', keyboard: false }).result.then(( response => {
      if (response == 'Guardar Grupo') {
        if (this.group.nombre == '') {
          Swal.fire(
            'Editar Grupo',
            'Nombre de grupo requerido',
            'error'
          );
        } else {
          let toUpdate: any = {
            nombre: this.group.nombre,
            item_id: this.group.item_id
          };
          this.entitiesService.update_group(toUpdate).then( (r:any) => {
            this.emit_changes();;
          }).catch( e => { console.log(e); });
        }
      }
      if (response == 'Guardar Host') {
        if (this.new_host.priority == '' || this.new_host.nombre == '' || this.new_host.target == '' || this.new_host.descripcion == '' || this.new_host.icon == '') {
          Swal.fire(
            'Guardar Host',
            'Todos los datos son requeridos',
            'error'
          );
        } else {
          this.entitiesService.create_host(this.group.item_id, this.new_host).then( (r:any) => {
            this.emit_changes();
          }).catch( e => { console.log(e); });
        }
      }
    }), ( r => {}));
  }

  delete_group() {
    if (this.group.hosts.length > 0) {
      Swal.fire(
        'Eliminar Grupo',
        'El grupo debe estar vacío para eliminarlo',
        'error'
      );
      return;
    }
    Swal.fire({
      title: 'Eliminar Grupo ' + this.group.nombre,
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.entitiesService.delete_group(this.group.item_id).then( (r:any) => {
          this.emit_changes();
        }).catch( e => { console.log(e); });
      } else if (result.isDenied) {
        this.emit_changes();
      }
    }).catch( e => { console.log(e); });
  }

  emit_changes() {
    this.group_change.emit(this.group);
  }
}
