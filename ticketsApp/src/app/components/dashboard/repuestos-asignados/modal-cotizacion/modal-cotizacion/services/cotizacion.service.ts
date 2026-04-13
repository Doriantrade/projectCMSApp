import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})

export class CotizacionService {

  public urlCms:      string = this.env.apiCMS;
  public urlHelpDesk: string = this.env.apiHelpDeskSytem;
  constructor( private http: HttpClient, private env: Environments ) { }

    private get headers(): HttpHeaders {
      return new HttpHeaders({
        'Authorization': `Bearer ${this.env.TokenJWT()}`,
        'Content-Type': 'application/json'
      });
    }


  guardarCabCotiza( model: any ) {
    return this.http.post( this.urlHelpDesk + "CabCotiza/guardarCabCotiza", model, { headers: this.headers });
  }

  actualizarCabCotiza( id: number, codUserAprueba: string, estado: number ) {
    return this.http.get( this.urlHelpDesk + "CabCotiza/actualizarCotizacion/" + id + "/" + codUserAprueba  + "/" + estado, { headers: this.headers });
  }

  eliminarCotizacion( idRequer: number, idResMantenimiento: number ) {
    return this.http.delete( this.urlHelpDesk + "CabCotiza/eliminarCotizacion/" + idRequer + '/' + idResMantenimiento, { headers: this.headers });
  }
  
  obtenerCabCotizaUnit( id: number ) {
    return this.http.delete( this.urlHelpDesk + "CabCotiza/obtenerCabCotizaUnit/" + id, { headers: this.headers });
  }
  
}
