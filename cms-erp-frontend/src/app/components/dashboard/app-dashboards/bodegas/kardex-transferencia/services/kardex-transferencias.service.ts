import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { HttpClient } from '@microsoft/signalr';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class KardexTransferenciasService {

  public url: string = environment.deploy_url;
  constructor(private http: HttpClient) { }

  obtenerReportecabecera(ccia:string, ccab:string ) {
    return this.http.get( this.url + 'Transferencias/repoOrdenTransferProd/'+ccia +'/'+ ccab);
  }

  obtenerMonInv() {
    return this.http.get( this.url + 'Transferencias/invmov' );
  }

  obtenerDetalle( codcab:string ) {
    return this.http.get( this.url + 'Transferencias/obtenerDetalleTrans/' + codcab );
  }

}
