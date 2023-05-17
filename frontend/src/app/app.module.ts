import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavbarComponent } from './navbar/navbar.component';
import { BodyComponent } from './body/body.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { GroupModule } from './group/group.module';
import { HostModule } from './host/host.module';
import { HttpClientModule } from '@angular/common/http';
import { EntitiesService } from './services/entities.service';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    BodyComponent
  ],
  imports: [
    BrowserModule,
    GroupModule,
    HostModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),
    AppRoutingModule,
    NgbModule
  ],
  providers: [EntitiesService],
  bootstrap: [AppComponent]
})
export class AppModule { }
