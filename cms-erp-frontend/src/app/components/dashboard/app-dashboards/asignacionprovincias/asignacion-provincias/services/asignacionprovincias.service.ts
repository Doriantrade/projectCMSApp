import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AsignacionprovinciasService {

  public url: string = environment.deploy_url;

  constructor( private http: HttpClient) { }

  guardarAsignacionProvincias( model: any [] ) {
    return this.http.post( this.url + 'asignacionProvincias/saveAsignacion', model );
  }

  obtenerTecnicoProvincias( codUser: string, codcia: string, type:number ) {
    return this.http.get( this.url + 'asignacionProvincias/obtenerTecnicoProvincia/' + codUser + '/' + codcia + '/'+ type );
  }

  eliminarTecnicoProvincia( id: number ) {
    return this.http.get( this.url + 'asignacionProvincias/eliminarTecnicoProvincia/' + id );
  }
  eliminarTecnicoProvinciaPorUsuario( codUser: string, ccia: string ) {
    return this.http.get( this.url + 'asignacionProvincias/eliminarTecnicoProvinciaPorUsuario/' + codUser + '/' + ccia );
  }


}
