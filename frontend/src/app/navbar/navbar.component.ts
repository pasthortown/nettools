import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  constructor(
    private modalService: NgbModal) {}

  openDialog(content: any) {
    this.modalService.open(content, { centered: true , size: 'lg', backdrop: 'static', keyboard: false }).result.then(( response => {

    }), ( r => {}));
  }


  // this.modalService.dismissAll('Guardar click');
}
