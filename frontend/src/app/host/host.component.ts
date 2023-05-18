import { EntitiesService } from './../services/entities.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ForegroundService } from '../services/foreground.service';
import { ChartConfiguration, ChartOptions } from "chart.js";
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

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
  lineChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };
  lineChartOptions: ChartOptions<'bar'> = {
    responsive: false
  };
  lineChartLegend = true;

  constructor(
    private spinner: NgxSpinnerService,
    private modalService: NgbModal,
    private entitiesService: EntitiesService,
    private foregroundService: ForegroundService) {}

  ngOnInit(): void {
    this.get_host_status();
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
    this.host.pings.forEach((ping: any) => {
      const date = new Date(ping.timestamp);
      const tiempo = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      labels.push(tiempo);
      dataset.push(Number.parseFloat(ping.result));
    });
    let datasets: any[] = [
      {
        data: dataset.reverse(),
        label: 'Ping',
        fill: true,
        tension: 0.5,
        borderColor: 'black',
        backgroundColor: 'rgba(80, 222, 33, 0.3)'
      }
    ]
    this.lineChartData = {
      labels: labels.reverse(),
      datasets: datasets
    };
    this.show_graph = true;
  }

  get_pings() {
    this.host.pings = [];
    this.spinner.show();
    this.entitiesService.get_pings(this.host.target, 600).then( (r:any) => {
      this.host.pings = r.response;
      this.build_graph();
      this.spinner.hide();
    }).catch( e => { console.log(e); });
  }

  trace_route() {
    this.spinner.show();
    this.foregroundService.tracert(this.host.target).then( (r:any) => {
      let traza: string = r.response.replace(/\n/g, "<br/>");
      this.spinner.hide();
      Swal.fire({
        title: 'Ruta al Host',
        icon: 'info',
        html: '<p style="max-height: 300px; overflow-y: auto; overflow-x: hidden; font-size: 12px;">' + traza + '</p>',
        showCloseButton: true
      });
    }).catch(e => {
      console.log(e);
      this.spinner.hide();
    });
  }

  telnet() {
    Swal.fire({
      title: 'Ingrese el Puerto',
      input: 'number',
      showCancelButton: true,
      confirmButtonText: 'Telnet'
    }).then((result) => {
      if (result.isConfirmed) {
        let port: Number = Number.parseInt(result.value);
        this.spinner.show();
        this.foregroundService.telnet(this.host.target, port).then((r: any) => {
          let resultado: string = 'Conexión al puerto ' + port.toString() + ' fallida.';
          let status: SweetAlertIcon = 'error';
          if (r.response) {
            resultado = 'Conexión al puerto ' + port.toString() + ' satisfactoria.';
            status = 'success';
          }
          Swal.fire({
            title: 'Telnet',
            text: resultado,
            icon: status
          });
          this.spinner.hide();
        }).catch(e => {
          console.log(e);
          this.spinner.hide();
        });
      }
    })
  }

  openDialog(content: any, get_pings: boolean = false) {
    if (get_pings) {
      this.get_pings();
    }
    this.modalService.open(content, { centered: true , size: 'lg', backdrop: 'static', keyboard: false }).result.then(( response => {
      if (response == 'Guardar Host') {
        let toUpdate: any = {
          item_id: this.host.item_id,
          nombre: this.host.nombre,
          target: this.host.target,
          descripcion: this.host.descripcion,
          icon: this.host.icon,
          priority: this.host.priority
        };
        if (toUpdate.priority == '' || toUpdate.nombre == '' || toUpdate.target == '' || toUpdate.descripcion == '' || toUpdate.icon == '') {
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
