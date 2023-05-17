import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {

  options = {};

  constructor(private http: HttpClient) { }

  build_headers() {
    let headers: HttpHeaders = new HttpHeaders().set('token', environment.token as string)
    this.options = {headers: headers};
  }

  update_group(group: any) {
    this.build_headers();
    const data = { group: group };
    return this.http.post(environment.api_entities + 'update_group', JSON.stringify(data), this.options ).toPromise();
  }

  update_host(group_id: string, host: any) {
    this.build_headers();
    const data = { group_id: group_id, host: host };
    return this.http.post(environment.api_entities + 'update_host', JSON.stringify(data), this.options ).toPromise();
  }

  create_group(group: any) {
    this.build_headers();
    const data = { group: group };
    return this.http.post(environment.api_entities + 'create_group', JSON.stringify(data), this.options ).toPromise();
  }

  create_host(group_id: string, host: any) {
    this.build_headers();
    const data = { group_id: group_id, host: host };
    return this.http.post(environment.api_entities + 'create_host', JSON.stringify(data), this.options ).toPromise();
  }

  delete_group(group_id: string) {
    this.build_headers();
    const data = { group_id: group_id };
    return this.http.post(environment.api_entities + 'delete_group', JSON.stringify(data), this.options ).toPromise();
  }

  delete_host(group_id: string, host_id: string) {
    this.build_headers();
    const data = { group_id: group_id, host_id: host_id };
    return this.http.post(environment.api_entities + 'delete_host', JSON.stringify(data), this.options ).toPromise();
  }

  get_pings(target: string, quantity: number) {
    this.build_headers();
    const data = { target: target, quantity: quantity};
    return this.http.post(environment.api_entities + 'get_pings', JSON.stringify(data), this.options ).toPromise();
  }

  get_groups() {
    this.build_headers();
    const data = {};
    return this.http.post(environment.api_entities + 'get_groups', JSON.stringify(data), this.options ).toPromise();
  }
}
