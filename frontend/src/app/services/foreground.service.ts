import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ForegroundService {

  options = {};

  constructor(private http: HttpClient) { }

  build_headers() {
    let headers: HttpHeaders = new HttpHeaders().set('token', environment.token as string)
    this.options = {headers: headers};
  }

  ping(target: string) {
    this.build_headers();
    const data = { target: target };
    return this.http.post(environment.api_foreground + 'ping', JSON.stringify(data), this.options ).toPromise();
  }

  tracert(target: string) {
    this.build_headers();
    const data = { target: target };
    return this.http.post(environment.api_foreground + 'tracert', JSON.stringify(data), this.options ).toPromise();
  }

  telnet(target: string, port: Number) {
    this.build_headers();
    const data = { target: target, port: port };
    return this.http.post(environment.api_foreground + 'telnet', JSON.stringify(data), this.options ).toPromise();
  }

}
