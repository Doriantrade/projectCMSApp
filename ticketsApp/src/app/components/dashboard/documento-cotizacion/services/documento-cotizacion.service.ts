import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root',
})
export class DocumentoCotizacionService {
  public urlCms: string = this.env.apiCMS;
  public urlHelpDesk: string = this.env.apiHelpDeskSytem;

  constructor(private http: HttpClient, public router: Router, private env: Environments) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.env.TokenJWT()}`,
      'Content-Type': 'application/json'
    });
  }

  obtenerCotizacion(idTicket: number, ccia: string) {
    return this.http.get(this.urlHelpDesk + 'cotizacion/ObtenerCotizacion/' + idTicket + '/' + ccia, { headers: this.headers } );
  }

  obtenerNotaReporteRepuestos(idTicket: number, ccia: string) {
    return this.http.get(this.urlHelpDesk + 'NotaEntregaRepuesos/ObtenerNotaEntregaRepuesos/' + idTicket + '/' + ccia, { headers: this.headers });
  }
}
