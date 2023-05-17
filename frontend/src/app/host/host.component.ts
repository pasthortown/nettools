import { EntitiesService } from './../services/entities.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ForegroundService } from '../services/foreground.service';
import { ChartConfiguration, ChartOptions } from "chart.js";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.scss']
})
export class HostComponent implements OnInit {
  @Output('host_change') host_change: EventEmitter<any[]> = new EventEmitter();
  @Input('group_id') group_id: string = '';
  @Input('host') host: any = {
    nombre: '',
    target: ''
  };

  show_graph = false;
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };
  lineChartOptions: ChartOptions<'line'> = {
    responsive: false
  };
  lineChartLegend = true;

  constructor(
    private modalService: NgbModal,
    private entitiesService: EntitiesService,
    private foregroundService: ForegroundService) {}

  ngOnInit(): void {
    this.start_monitoreo();
  }

  start_monitoreo(): void {
    setTimeout(() => {
      this.get_host_status();
      this.start_monitoreo();
    }, 5000);
  }

  get_host_status() {
    this.entitiesService.get_pings(this.host.target, 1).then( (r: any) => {
      let ping: any = r.response[0];
      if (ping.result > 0) {
        this.host.status = 'active';
      } else {
        this.host.status = 'inactive';
      }
    }).catch( e => { console.log(e); });
  }

  build_graph() {
    this.show_graph = false;
    let labels: any[] = [];
    let dataset: any[] = [];
    let count = 0;
    this.host.pings.forEach((ping: any) => {
      count++;
      labels.push(count.toString());
      dataset.push(Number.parseFloat(ping.result));
    });
    let datasets: any[] = [
      {
        data: dataset,
        label: 'Ping',
        fill: true,
        tension: 0.5,
        borderColor: 'black',
        backgroundColor: 'rgba(255,0,0,0.3)'
      }
    ]
    this.lineChartData = {
      labels: labels,
      datasets: datasets
    };
    this.show_graph = true;
  }

  openDialog(content: any, get_pings: boolean = false) {
    if (get_pings) {
      this.host.pings = [];
      this.entitiesService.get_pings(this.host.target, 100).then( (r:any) => {
        this.host.pings = r.response;
        this.build_graph();
      }).catch( e => { console.log(e); });
    }
    this.modalService.open(content, { centered: true , size: 'lg', backdrop: 'static', keyboard: false }).result.then(( response => {
      if (response == 'Guardar Host') {
        let toUpdate: any = {
          item_id: this.host.item_id,
          nombre: this.host.nombre,
          target: this.host.target,
          descripcion: this.host.descripcion,
          icon: this.host.icon
        };
        if (toUpdate.nombre == '' || toUpdate.target == '' || toUpdate.descripcion == '' || toUpdate.icon == '') {
          Swal.fire(
            'Guardar Host',
            'Todos los datos son requeridos',
            'error'
          );
        } else {
          this.entitiesService.update_host(this.group_id, toUpdate).then( (r:any) => {
            this.host_change.emit(this.host);
          }).catch( e => { console.log(e); });
        }
      }
    }), ( r => {}));
  }

  delete_host() {
    Swal.fire({
      title: 'Eliminar Host ' + this.host.nombre,
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.entitiesService.delete_host(this.group_id, this.host.item_id).then( (r: any) => {
          this.host_change.emit(this.host);
        }).catch( e => { console.log(e); });;
      } else if (result.isDenied) {
        this.host_change.emit(this.host);
      }
    }).catch( e => { console.log(e); });
  }
}
