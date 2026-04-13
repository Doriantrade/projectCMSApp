import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { LoginService } from './services/login.service';
import { Environments } from 'src/app/environments/environments';

import { EncryptService } from '../shared/services/encrypt.service';
import { Router } from '@angular/router';

import Swal from 'sweetalert2'
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
})

@Component({
  selector:    'app-login',
  templateUrl: './login.component.html',
  styleUrls: [ './login.component.scss' ]
})

export class LoginComponent implements OnInit {
  loginModel: any = [];
  hide                    = true;
  _show:          boolean = false;
  _show_spinner:  boolean = false;
  versionamiento: string  = this.env.version;
  showPassword = false;

  public user: any = [];
  
  public loginForm = new FormGroup({
    email:       new FormControl(''),
    contrasenia: new FormControl('')
  });

  constructor( private log: LoginService, private env: Environments, private router: Router, private ncrypt: EncryptService  ) { }

  ngOnInit(): void {
    this.log.validate();
  }

  onSubmit() {
    this.logins();
  }

  togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
  }

  logins() {
    this._show_spinner = true;
    this.loginModel = {
      "usuario": this.loginForm.controls['email'].value,
      "password": this.loginForm.controls['contrasenia'].value
    }
    
    // console.warn(this.loginModel)

    this.log.login(this.loginModel).subscribe({
      next: (x: any) => {

        console.warn(x);

        Toast.fire({
          icon: 'success',
          title: 'Te has logeado con éxito'
        });
        
        const tokenEn: any = this.ncrypt.encryptWithAsciiSeed(x.token, 5, 10);

        sessionStorage.setItem('token', tokenEn);
        let xuser: any = this.loginForm.controls['email'].value;
        sessionStorage.setItem('usuario', xuser);
        setTimeout(() => {
          this.router.navigate(['home']);
        }, 2000);
        this._show_spinner = false;
      }, 
      error: (e) => {
        console.error(e);
        this._show_spinner = false;
        
        if (e.status === 401 || e.status === 403) {
          // Credenciales incorrectas o no autorizado
          Toast.fire({
            icon: 'error',
            title: 'Usuario o contraseña incorrectos'
          });
        } else if (e.status === 404) {
          // Recurso no encontrado
          Toast.fire({
            icon: 'error',
            title: e.error
          });
        } else if (e.status === 0 || e.status === 500) {
          // Error del servidor o sin conexión
          Toast.fire({
            icon: 'error',
            title: 'Problemas con el servidor. Intente más tarde'
          });
        } else if (e.status === 400) {
          // Solicitud mal formada
          Toast.fire({
            icon: 'error',
            title: 'Datos de entrada inválidos'
          });
        } else {
          // Error genérico
          Toast.fire({
            icon: 'error',
            title: 'Ocurrió un error inesperado. Intente nuevamente'
          });
        }
      }, 
      complete: () => {
        // Lógica opcional al completar
      }
    });
  
  }


}
