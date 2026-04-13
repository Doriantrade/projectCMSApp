import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Environments } from 'src/app/environments/environments';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  public url: string = this.env.apiHelpDeskSytem;

  constructor( private http: HttpClient, public router: Router, private env: Environments ) { }

  login( model: any[] ) {
    return this.http.post( this.url+ 'Login/InicioSesion', model )
  }

  validate() {
    let token: any = sessionStorage.getItem('token');
    if( token == undefined || token == null || token == '' ) {
      // // console.log('No hay token')
      this.router.navigate(['login']);
    } else {
      // // console.log('Si hay token')
      this.router.navigate(['home']);
    }
    
  }



  closeSession() {
    sessionStorage.removeItem('ID');
    sessionStorage.removeItem('PR');
    sessionStorage.removeItem('codcli');
    sessionStorage.removeItem('usuario');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('exp');
    localStorage.removeItem('id-cliente-escogido');
    localStorage.removeItem('nombre-cliente-escogido');
    localStorage.removeItem('idRequerimientoShow');
    this.validate();
  }
  
}
