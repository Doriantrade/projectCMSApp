import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class MasterTableService {

  public urlCms: string = this.env.apiCMS;
  public urlHelpDesk: string = this.env.apiHelpDeskSytem;

  constructor(private http: HttpClient, private env: Environments) { }

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.env.TokenJWT()}`,
      'Content-Type': 'application/json'
    });
  }

  obtenerDatosMasterTable(master: string) {
    return this.http.get('https://cmsbackticket.cashmachserv.com/api/' + 'Master/ObtenerMasterTable/' + master, { headers: this.headers });
    // return this.http.get( this.urlHelpDesk + 'Master/ObtenerMasterTable/' + master, { headers: this.headers } );
  }

}
