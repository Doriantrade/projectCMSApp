import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CrononewdisService {

  public url: string = environment.deploy_url;

  constructor( private http: HttpClient) { }

  obtenerAgenciasGeneraCli( ccia:string, cli:string ) {
    return this.http.get( this.url + 'Zonificacion/ObtenerAgenciasGeneral/' + ccia + '/' + cli );
  }
  
  guardarZonificacion(model:any[]) {
    return this.http.post( this.url + 'Zonificacion/guardarZonificacion', model );  
  }

  obtenerZonificacion(codzone:string, cli:string) {
    return this.http.get( this.url + 'Zonificacion/ObtenerAgenciaZonificada/' + codzone + '/' + cli );
  }

  obtenerAgenciaLocalizacion(codlocalidad:number, codzone:string) {
    return this.http.get( this.url + 'Zonificacion/ObtenerAgenciasLocalidad/' + codlocalidad + '/' + codzone   );
  }

  guardarCronoInteligente(codlocalidad:number, codcrono:string) {
    return this.http.get( this.url + 'Cronograma/CalculoAsignacionCronograma/' + codlocalidad + '/' + codcrono   );
  }
  
  eliminarZonificacion(id:number) {
    return this.http.get( this.url + 'Zonificacion/eliminarDataCardinal/' + id );
  }
  
  ActualizaEstadoAgencia(st:number, codagencia:string) {
    return this.http.get( this.url + 'Zonificacion/ActualizarAgenciaEstado/' + st + '/' + codagencia   );
  }

}
