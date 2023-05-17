import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HostComponent } from './host.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ForegroundService } from '../services/foreground.service';
import { EntitiesService } from '../services/entities.service';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    HostComponent
  ],
  exports: [HostComponent],
  imports: [
    CommonModule,
    NgChartsModule,
    FormsModule,
    NgbModule
  ],
  providers: [EntitiesService, ForegroundService]
})
export class HostModule { }
