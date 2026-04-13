import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class GarantiasService {
  public url: string = environment.deploy_url;

  constructor( private http: HttpClient) { }

  guardarGarantia( model: any ) {
    return this.http.post( this.url + 'Garantias/GuardarGarantias', model );
  } 

  obtenerGarantias(ccia:string) {
    return this.http.get( this.url + 'Garantias/obtenerGarantias/' + ccia );
  }

  editarGarantias( codgarantia:string, model:any ) {
    return this.http.put( this.url+ 'Garantias/EditarGarantia/'+codgarantia, model );
  }

  obtenerContratos(ccia:string) {
    return this.http.get( this.url + 'Contratos/obtenerContratos/' + ccia );
  }

}

