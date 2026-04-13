import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class RepuestosService {

  public url: string = environment.deploy_url;
  constructor(private http: HttpClient) { }

  guardarRepuestos( model: any [] ) {
    return this.http.post( this.url + 'Repuestos/guardarRepuestos', model );
  }

  actualizarRepuestos( codrep: string, model: any [] ) {
    return this.http.put( this.url + 'Repuestos/EditarRepuestos/' + codrep, model );
  }

  obtenerRepuestos( usercrea: string, ccia: string ) {
    return this.http.get( this.url + 'Repuestos/obtenerRepuestos/' + usercrea + '/' + ccia );  
  }

  eliminarRepuestos( coderep: string, usercrea: string ) {
    return this.http.get( this.url + 'Repuestos/eliminarRepuestos/' + usercrea + '/' + coderep );  
  }

  guardarRepuestoBodegas( model: any [] ) {
    return this.http.post( this.url + 'Repbodasigna/GuardarRepbodasigna', model )
  }

}


