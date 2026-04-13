import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CrearBodegasService {

  public url: string = environment.deploy_url;
  constructor(private http: HttpClient) { }

  guardarBodegas(model: any []) {
    return this.http.post( this.url + 'Bodegas/guardarBodegas', model );
  }

  editarBodegas(id: number, model: any []) {
    return this.http.put( this.url + 'Bodegas/EditarBodegas/' + id, model );
  }

  obtenerBodegas( ccia:string ) {
    return this.http.get( this.url + 'Bodegas/obtenerBodegas/' + ccia );
  }
  
  eliminarBodegas( id:number ) {
    return this.http.get( this.url + 'Bodegas/eliminarBodegas/' + id );
  }

  updateProdCliBodegas(ccli:string, cmaq:string) {
    return this.http.get( this.url + 'Transferencias/CliBodegAsign/' + ccli + '/' + cmaq )
  }

}
