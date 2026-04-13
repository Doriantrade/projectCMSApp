import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../usuario/services/user.service';
import { NavsideService } from 'src/app/components/shared/navside/services/navside.service';
import { PermisosService } from './services/permisos.service';
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
  selector: 'app-asign-mod-user',
  templateUrl: './asign-mod-user.component.html',
  styleUrls: ['./asign-mod-user.component.scss']
})
export class AsignModUserComponent implements OnInit {
  pMod: number = 4;

  ccia:               any;
  _show_spinner: boolean = false;
  @Input() data!: any [];
  listausuarios: any = [];
  listaModulosUsuario: any = [];
  todosLosModulos: any = [];
  modulosFaltantes: any = [];
  selectedUserCode: string = '';
  showAssignmentModal: boolean = false;
  _show_modules_account: boolean = true;

  constructor(private usuario: UserService, private modulos: NavsideService, private permisos: PermisosService) { }

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    this.ccia = sessionStorage.getItem('codcia');
    this.obtenerUsuariosEmpresa();
    this.cargarTodosLosModulos();
  }

  cargarTodosLosModulos() {
    this.permisos.getAllModulos().subscribe({
      next: (res: any) => {
        this.todosLosModulos = res;
      },
      error: (e) => console.error(e)
    });
  }

  obtenerUsuariosEmpresa() {
    this._show_spinner = true;

    console.warn(this.ccia)

    this.usuario.obtenerUsuarios(this.ccia).subscribe({
      next:(usuarios) => {
        this.listausuarios = usuarios;
        console.warn(this.listausuarios);
        this._show_spinner = false;
      }, error: (e) => {
        console.error(e);
        this._show_spinner = false;
      }
    })
  }

  nivelPermisos: number = 0; // Inicialmente, el nivel de permisos es 0

  obtenerModulosUsuarios(usuario: string) {
    this.selectedUserCode = usuario;
    this._show_spinner = true;
    this.modulos.getModulos(usuario).subscribe({
      next: (modulo:any) => {
        this._show_spinner = false;
        this.listaModulosUsuario = modulo;
        // Establecer el nivel de permisos del primer módulo como el nivelPermisos
        this.nivelPermisos = modulo[0].permisos;
        console.log(this.nivelPermisos)
      },
      error: (e) => {
        console.error(e);
        this._show_spinner = false;
      },
      complete: () => {
        console.warn(this.listaModulosUsuario);
        this._show_modules_account = false;  
        this.calcularFaltantes();
      }
    });

  }

  calcularFaltantes() {
    if(!this.todosLosModulos || this.todosLosModulos.length === 0) return;
    
    // Filtrar los que no están en la lista del usuario actual
    this.modulosFaltantes = this.todosLosModulos.filter((tm: any) => 
       !this.listaModulosUsuario.some((lm: any) => lm.id.toString() === tm.id.toString())
    );
  }

  abrirModalAgregacion() {
    this.calcularFaltantes();
    this.showAssignmentModal = true;
  }

  cerrarModalAgregacion() {
    this.showAssignmentModal = false;
  }

  asignarModuloUsuario(modulo: any) {
    this._show_spinner = true;
    this.permisos.asignarModulo(this.selectedUserCode, modulo.id.toString(), this.ccia).subscribe({
      next: () => {
        this._show_spinner = false;
        Toast.fire({ icon: 'success', title: 'Módulo ' + modulo.moduleName + ' asignado exitosamente' });
        // Recargar módulos del usuario
        this.obtenerModulosUsuarios(this.selectedUserCode);
      },
      error: (e) => {
        console.error(e);
        this._show_spinner = false;
        Toast.fire({ icon: 'error', title: 'Error al asignar el módulo' });
      }
    });
  }


  actualiarPermisos(data:any, value:any) {
    this._show_spinner = true;
    this.permisos.updatePermisos(value, data.id, data.cod_user).subscribe({
      next: () => {
        this._show_spinner = false;
        Toast.fire({ icon: 'success', title: 'El módulo ' + data.moduleName + ' ha sido actualizado al estado ' + value });
      }, error: (e) => {
        console.error(e);
        Toast.fire({ icon: 'error', title: 'Oops! algo ha ocurrido. ' });
      }
    })
  }


}
