import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class MensajeriaTicketService {

  public urlCms:      string = this.env.apiCMS;
  public urlHelpDesk: string = this.env.apiHelpDeskSytem;

  constructor(private http: HttpClient, private env: Environments) { }

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.env.TokenJWT()}`,
      'Content-Type': 'application/json'
    });
  }

  enviarMensaje( model:any [] ) {
    return this.http.post( this.urlHelpDesk + 'MensajeriaTicket/GuardarMensajesTicket', model, { headers: this.headers });
  }

  obtenerMensaje( idrequerimineto: number, top: number ) {
    return this.http.get( this.urlHelpDesk + 'MensajeriaTicket/ObtenerMensajesTicket/'+idrequerimineto+'/'+top, { headers: this.headers } );
  }

  actualizarMensajeEstado( idrequerimineto: number, coduser: string ) {
    return this.http.get( this.urlHelpDesk + 'MensajeriaTicket/ActualizarEstadoMensajes/'+idrequerimineto+'/'+coduser, { headers: this.headers } );
  }

  eliminarMensajes( idmensaje: any ) {
    return this.http.delete( this.urlHelpDesk + 'MensajeriaTicket/BorrarMensajeTicket/'+idmensaje, { headers: this.headers } );
  }

  guardarIntervalo(model:any) {
    return this.http.post( this.urlHelpDesk + 'intervalosTicket/GuardarIntervalosTicket', model, { headers: this.headers } );
  }

  guardarIntervaloMsj(model:any) {
    return this.http.post( this.urlHelpDesk + 'IntervalosTicketMsj/GuardarIntervalosTicketMsj', model, { headers: this.headers } );
  }
}