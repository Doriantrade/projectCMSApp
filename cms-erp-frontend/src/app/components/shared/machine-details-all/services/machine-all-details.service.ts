import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})

export class MachineAllDetailsService {

  public url: string = environment.deploy_url;
  constructor( private http: HttpClient) { }

  obtenerMaquinaHistorico(codprod:any) {
    return this.http.get( this.url + 'Maquinaria/obtenerMaquinariaHistorico/'+codprod );
  }



}
