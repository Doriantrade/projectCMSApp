import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class TablaHelpDeskService {

  public urlCms:      string = this.env.apiCMS;
  public urlHelpDesk: string = this.env.apiHelpDeskSytem;
  public ticketActualizado$ = new Subject<void>();

  constructor(private http: HttpClient, public router: Router, private env: Environments) { }

  notificarActualizacionTicket() {
    this.ticketActualizado$.next();
  }

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.env.TokenJWT()}`,
      'Content-Type': 'application/json'
    });
  }

  obtenerTickets( codcli: any ) {
    return this.http.get( this.urlHelpDesk + 'TicketResolucion/ObtenerTicket/' + codcli );
  }

  updateTicketsEstado( id:number, estado: number) {
    // console.log(this.urlHelpDesk + 'TicketResolucion/ActualizarTicketEstado/' + id + '/' + estado)
    return this.http.get( this.urlHelpDesk + 'TicketResolucion/ActualizarTicketEstado/' + id + '/' + estado );
  }

  obtenerTicketsConMensajesNoLeidos( codcli: string ) {
    return this.http.get( this.urlHelpDesk + 'TicketResolucion/obtenerMensajesNoLeidosTickets/' + codcli );
  }

  eliminarTicketsProceso( idReuqer: number ) {
    return this.http.delete( this.urlHelpDesk + 'TicketRequerimientos/EliminarRequerimiento/' + idReuqer, { headers: this.headers } );
  }
}
