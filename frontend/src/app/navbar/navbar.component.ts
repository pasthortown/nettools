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
  @Output('profile_select') profile_select: EventEmitter<any[]> = new EventEmitter();
  @Output('profile_change') profile_change: EventEmitter<any[]> = new EventEmitter();
  @Input('profiles') profiles: any[] = [];

  new_group: any = {
    nombre: '',
    hosts: []
  }

  new_profile: any = {
    nombre: '',
    groups: []
  }

  groups_can_show: any[] = [];
  profile_selected: any = { item_id: 'all', nombre: 'Visión Completa', groups: [] };

  constructor(
    private entitiesService: EntitiesService,
    private modalService: NgbModal) { }

  ngOnInit(): void {

  }

  set_toUpdate_profile() {
    this.new_profile = {
      item_id: this.profile_selected.item_id,
      nombre: this.profile_selected.nombre,
      groups: this.profile_selected.groups
    };

  }

  reset_profile() {
    this.new_profile = {
      nombre: '',
      groups: []
    }
  }

  build_groups_can_show() {
    this.groups_can_show = [];
    this.groups.forEach((element_groups: any) => {
      let exist = false;
      this.new_profile.groups.forEach((element_new_profile_groups: any) => {
        if (element_groups.item_id == element_new_profile_groups.item_id) {
          exist = true;
        }
      });
      if (!exist) {
        this.groups_can_show.push({item_id: element_groups.item_id, nombre: element_groups.nombre});
      }
    });
  }

  openDialog(content: any) {
    this.build_groups_can_show();
    this.modalService.open(content, { centered: true , size: 'lg', backdrop: 'static', keyboard: false }).result.then(( response => {
      if (response == 'Guardar Grupo') {
        if (this.new_group.nombre == '') {
          Swal.fire(
            'Crear Grupo',
            'Nombre de Grupo Requerido',
            'error'
          )
        } else {
          this.entitiesService.create_group(this.new_group).then( (r:any) => {
            this.groups_change.emit(this.groups);
          }).catch( e => { console.log(e); });
        }

      }
      if (response == 'Guardar Perfil') {
        if (this.new_profile.nombre == '') {
          Swal.fire(
            'Crear Perfil',
            'Nombre de Perfil Requerido',
            'error'
          )
        } else {
          this.entitiesService.create_profile(this.new_profile).then( (r:any) => {
            this.profile_change.emit(this.profiles);
          }).catch( e => { console.log(e); });
        }
      }
      if (response == 'Actualizar Perfil') {
        if (this.new_profile.nombre == '') {
          Swal.fire(
            'Actualizar Perfil',
            'Nombre de Perfil Requerido',
            'error'
          )
        } else {
          this.entitiesService.update_profile(this.new_profile).then( (r:any) => {
            this.select_profile('all');
            this.profile_change.emit(this.profiles);
          }).catch( e => { console.log(e); });
        }

      }
    }), ( r => {}));
  }

  select_profile(profile_value: string) {
    this.profiles.forEach((element: any) => {
      if (profile_value == element.item_id) {
        this.profile_selected = element;
        this.profile_select.emit(this.profile_selected);
      }
    });
  }

  remover_profile_group(profile_group: any) {
    let new_groups: any[] = [];
    this.new_profile.groups.forEach((element:any) => {
      if (element != profile_group) {
        new_groups.push(element);
      }
    });
    this.new_profile.groups = new_groups;
  }

  isGroupAdded(group: any): boolean {
    let toReturn: boolean = false;
    this.new_profile.groups.forEach((element:any) => {
      if (element == group) {
        toReturn = true;
      }
    });
    return toReturn;
  }

  delete_profile() {
    this.entitiesService.delete_profile(this.profile_selected.item_id).then((r: any) => {
      this.profile_change.emit(this.profiles);
    }).catch(e => { console.log(e); });
  }
}
