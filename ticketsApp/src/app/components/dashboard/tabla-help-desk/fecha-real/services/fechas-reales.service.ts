import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class FechasRealesService {

  public urlCms:      string = this.env.apiCMS;
  public urlHelpDesk: string = this.env.apiHelpDeskSytem;

  constructor(private http: HttpClient,  private env: Environments) { }

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.env.TokenJWT()}`,
      'Content-Type': 'application/json'
    });
  }

  actualizarFechaReal( idRequerimiento: number, estado: number, model: any  ) {
    return this.http.put( this.urlHelpDesk + 'TicketRequerimientos/ActualizarFechaRealTicket/' + idRequerimiento + '/' + estado, model, { headers: this.headers } );
  }
}
