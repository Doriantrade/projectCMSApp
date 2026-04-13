
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
@Injectable({
  providedIn: 'root'
})
export class MantenimientoCronogramaService {
  public url: string = environment.deploy_url;
  constructor( private http: HttpClient ) { }

  guardarMantenimiento(model:any) {
    return this.http.post( this.url + 'Mantenimiento/guardarMantenimiento', model );
  }

  obtenerMantenimientos( codagencia:string, m:number, a:number, l:number ) {

    console.warn( 'codagencia, m, a, l Desde el servicio' );
    console.warn( codagencia, m, a, l );

    return this.http.get( this.url + 'Mantenimiento/ObtenerMantenimientoCrono/' + codagencia + '/' + m + '/' + a + '/' + l );
  }

  eliminarMantenimiento( id:number ) {
    return this.http.get( this.url + 'Mantenimiento/eliminarMantenimiento/' + id );
  }

}
