import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  public url: string = environment.deploy_url;
  constructor( private http: HttpClient) { }

  guardarUsuarios(model: any []) {
    return this.http.post( this.url + 'User/guardarUsuario', model );
  }

  obtenerUsuarios( ccia:string ) {
    return this.http.get( this.url + 'User/ObtenerUsuariosExec/'+ccia );
  }

  obtenerUsuariosCronos( idlocalidad:number ) {
    return this.http.get( this.url + 'User/ObtenerTecniCrono/'+idlocalidad );
  }

  crearCuentas( userCod: string, ccia: string, tcuenta: string ) {
    return this.http.get( this.url + 'User/CrearCuentas/'+ userCod + '/' + ccia + '/' + tcuenta );
  }

  eliminarUsuario( coduser: string, ccia: string ) {
    return this.http.get( this.url + 'User/eliminarUsuario/' + coduser + '/' + ccia );
  }

  editarUsuario( coduser: string, model: any [] ) {
    return this.http.put( this.url + 'User/EditarUsuario/' + coduser, model );
  }

  obtenerCuentaUsuario(coduser:string) {
    return this.http.get( this.url + 'User/ObtenerCuentaUsuario/' + coduser );
  }

}
