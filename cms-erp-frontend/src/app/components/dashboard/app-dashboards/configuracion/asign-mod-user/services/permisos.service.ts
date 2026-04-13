import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {

  public url: string = environment.deploy_url;
  constructor(private http: HttpClient) { }

  updatePermisos(permod: number, id:string, ccuser:string) {
    return this.http.get( this.url + 'modulos/EditarPermisosModulos/'+ permod +'/' +id+'/'+ccuser )
  }

  getAllModulos() {
    return this.http.get(this.url + 'modulos/GetAllModulos');
  }

  asignarModulo(coduser: string, idmod: string, codcia: string) {
    return this.http.post(this.url + `modulos/AsignarModulo/${coduser}/${idmod}/${codcia}`, {});
  }

  
}
