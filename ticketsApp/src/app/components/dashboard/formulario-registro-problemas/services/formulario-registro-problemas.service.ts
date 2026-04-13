import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})

export class FormularioRegistroProblemasService {

  public urlCms:      string = this.env.apiCMS;
  public urlHelpDesk: string = this.env.apiHelpDeskSytem;

  constructor(private http: HttpClient, public router: Router, private env: Environments) { }

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.env.TokenJWT()}`,
      'Content-Type': 'application/json'
    });
  }

  obtenerMaquinaria( cci: string ) {
    return this.http.get( this.urlCms + 'Maquinaria/obtenerMaquinaria/' + cci, { headers: this.headers } );
  }

  updateTicket(id:number, model:any []) {
    return this.http.put( this.urlHelpDesk + 'TicketResolucion/ActualizarTicket/' + id, model, { headers: this.headers } );
  }

  obtenerAgencias( cci: string, filter: string, codprov: number ) {
    return this.http.get( this.urlCms + 'ClienteAgencia/obtenerAgencias/' + cci + '/' + filter + '/' + codprov, { headers: this.headers } );
  }

  obtenerAsignacionMaquinAgencia(cagencia: string, codcia: string) {
    return this.http.get( this.urlCms + 'MaquinaAgencia/obtenerAsignacionmaquinacliente/' + cagencia + '/' + codcia, { headers: this.headers } );
  }

  guardarTicket( model:any [] ) {
    return this.http.post( this.urlHelpDesk + 'TicketResolucion/GuardarTickets', model, { headers: this.headers } );
  }

  guardarTicketRequerimiento( model: any [] ) {
    return this.http.post( this.urlHelpDesk + 'TicketRequerimientos/GuardarTicketsRequerimiento', model, { headers: this.headers } );
  }

  obtenerTicketsRequerimientos(codcli: string, codcia: string, type: number) {
    return this.http.get( this.urlHelpDesk + 'TicketRequerimientos/ObtenerTicketsRequerimientos/' + codcli + '/' + codcia + '/' + type, { headers: this.headers } );
  }

}
