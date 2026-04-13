import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class MarcarepService {

  public url: string = environment.deploy_url;
  constructor(private http: HttpClient) { }

  guardarMarcaRep( model: any [] ) {
    return this.http.post( this.url + 'Repuestos/GuardarMarcaRepuestos', model );
  }

  obtenerMarcaRep( ) {
    return this.http.get( this.url + 'Repuestos/ObtenerMarcaRepuetos' );
  }

  obtenerModeloMarcaRepuestos( idMarcaRep: number ) {
    return this.http.get( this.url + 'Repuestos/ObtenerModeloMarcaRepuetos/' + idMarcaRep );
  }

  editarMarcaRepuesto( id:number, model: any [] ) {
    return this.http.put( this.url + 'Repuestos/EditarMarcaRepuestos/' + id, model );
  }

  eliminarRepuestos( id:number ) {
    return this.http.delete( this.url + 'Repuestos/EliminarMarcaRepuestos/' + id )
  }

}
