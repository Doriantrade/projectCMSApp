import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  public url: string = environment.deploy_url;

  constructor( private http: HttpClient) { }

  getVersion(version: string) {
    return this.http.get( this.url + 'versionamiento/obtenerVersionamiento/' + version );
  }
  getVersionCMS() {
    return this.http.get( this.url + 'versionamiento/obtenerVersionCMS' );
  }

  obtenerEmpresa() {
    return this.http.get( this.url + 'Empresa/obtenerEmpresa' );
  }

}
