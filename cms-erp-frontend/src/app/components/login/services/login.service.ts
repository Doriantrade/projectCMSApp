import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  public url: string = environment.deploy_url;

  constructor( private http: HttpClient, public router: Router ) { }

  login( model: any[] ) {
    return this.http.post( this.url + 'login/login', model )
  }

  validate() {
    let UserCod: any = sessionStorage.getItem('UserCod');
    if( UserCod == undefined || UserCod == null || UserCod == '' ) {
      // alert('No hay nada')
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  closeSession() {
    sessionStorage.removeItem('UserCod');
    sessionStorage.removeItem('UserName');
    sessionStorage.removeItem('cedula');
    sessionStorage.removeItem('tipo');
    sessionStorage.removeItem('imagen');
    sessionStorage.removeItem('email');
    localStorage.removeItem('imgperfil');
    localStorage.removeItem('codcia');
    this.validate();
  }

}
