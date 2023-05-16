import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupComponent } from './group.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HostModule } from '../host/host.module';

@NgModule({
  declarations: [
    GroupComponent
  ],
  exports: [GroupComponent],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    HostModule
  ]
})
export class GroupModule { }
