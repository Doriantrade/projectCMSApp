import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2'
import { LoginService } from './services/login.service';

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
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  hide = true;
  _show: boolean = false;
  estado_servidor: string = 'on';
  public user: any = [];

  public loginForm = new FormGroup({
    email:    new FormControl(''),
    contrasenia: new FormControl('')
  });

  constructor( private log: LoginService ) { }

  ngOnInit(): void {
    this.log.validate();
    setTimeout(() => {
      this._show = true;
      this.mostrarLetrasPorConsola()
    },  2000);
  }

  onSubmit() { 
    this.logins();
  }

  logins() {

    this.log.login(this.loginForm.value).subscribe({
      next: (x) => {
        this.user = x;
        console.warn(this.user)
        Toast.fire({
          icon: 'success',
          title: 'Te has logeado con éxito'
        })
      }, error: (error) => {
        Toast.fire({
          icon: 'error',
          title: 'Error en los datos de ingreso'
        })
        console.error(error)
      }, complete: () => {
        sessionStorage.setItem('cedula',   this.user.cedula);
        sessionStorage.setItem('UserCod',  this.user.coduser);
        sessionStorage.setItem('email',    this.user.email);
        sessionStorage.setItem('tipo',     this.user.tipo);
        sessionStorage.setItem('UserName', this.user.nombre);
        this.log.validate();
      }
    })

  }

  textoCompleto = 'Bienvenido a CASH MACHINES SERVICE... \n Estado: ' + this.estado_servidor;
  textoMostrado = '';
  mostrarLetrasPorConsola() {
    const intervalId = setInterval(() => {
      if (this.textoMostrado.length < this.textoCompleto.length) {
        this.textoMostrado += this.textoCompleto[this.textoMostrado.length];
      } else {
        clearInterval(intervalId);
      }
    }, 250);
  }

}
