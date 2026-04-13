import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class MaquinariaService {
  public url: string = environment.deploy_url;
  constructor(private http: HttpClient) { }

  guardarMaquinaria(model: any []) {
    return this.http.post( this.url + 'Maquinaria/GuardarMaquinaria', model );
  }

  obtenerMaquinaria( cci: string ) {
    return this.http.get( this.url + 'Maquinaria/obtenerMaquinaria/' + cci );
  }

  putMaquinaria(codmaquina: string, model: any []) {
    return this.http.put( this.url + 'Maquinaria/EditarMaquinaria/' + codmaquina, model );
  }

  eliminarMaquinaria( codmaquina: string ) {
    return this.http.get( this.url + 'Maquinaria/eliminarMaquinaria/' + codmaquina );
  }
  
  obtenerMaquinariaIMG() {
    return this.http.get( this.url + 'Maquinaria/obtenerMaquinariaIMG' );
  }

  ObtenerMaquinasSinBodega(ccia:string, option:number) {
    return this.http.get( this.url + 'Maquinaria/ObtenerMaquinasSinBodega/'+ ccia + '/' + option);
  }

  ObtenerMaquinaUnit( tpmaq:string, marca:string, modelo:string, tipo:number, codmaquina: string ) {
    return this.http.get( this.url + 'Maquinaria/ObtenerMaquinaUnit/'+ tpmaq + '/' + marca + '/' + modelo + '/' + tipo + '/' + codmaquina  );
  }

  guardarImagenMaquinaria(model:any[]) {
    return this.http.post( this.url+ 'Maquinaria/GuardarImagenProductos', model );
  }

}
