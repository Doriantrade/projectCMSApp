import { Component, OnInit } from '@angular/core';
import { DashboardService } from './services/dashboard.service';
import { ImagecontrolService } from '../shared/image-control/services/imagecontrol.service';
import { LoginService } from '../login/services/login.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  _show_spinner: boolean = false;
  moduloEmitter: any;
  _usuario: boolean = false;
  _asignacion: boolean = false;
  _dashboard: boolean = true;
  _clientes: boolean = false;
  _maquinaria: boolean = false;
  // _version: string = '1.0.0 en desarrollo';
  _date: any;
  panelOpenState = false;
  _agencias: boolean = false;
  _perfil_usuario: boolean = false;
  _bodegas: boolean = false;
  _configuracion: boolean = false;
  _imagenes_productos: boolean = false;
  _garantias: boolean = false;
  _cronograma: boolean = false;
  _repuestos: boolean = false;
  _monitorear: boolean = false;
  _mantenimiento_tickets: boolean = false;

  constructor(private dash: DashboardService, private log: LoginService) { }

  ngOnInit(): void {
    this.obtenerVersionCMS();
    this.obtenerEmpresa();
    this.log.validate();

    // /** Persistencia de ubicacion modular */
    let xmodulo: any = localStorage.getItem('modulo');
    // this.recibirModulo(xmodulo);  

    let arrmodulo = {
      nombre: xmodulo
    }

    console.log(arrmodulo);
    this.recibirModulo(arrmodulo);

  }


  recibirModulo(modulo: any) {

    this.moduloEmitter = modulo;

    switch (this.moduloEmitter.nombre) {
      case 'Usuario':
        this._usuario = true;
        this._dashboard = false;
        this._asignacion = false;
        this._clientes = false;
        this._agencias = false;
        this._maquinaria = false;
        this._perfil_usuario = false;
        this._bodegas = false;
        this._configuracion = false;
        this._imagenes_productos = false;
        this._garantias = false;
        this._cronograma = false;
        this._repuestos = false; this._monitorear = false;
        this._mantenimiento_tickets = false;
        break;
      case 'Cobertura Técnica':
        this._usuario = false;
        this._dashboard = false;
        this._asignacion = true;
        this._clientes = false;
        this._agencias = false;
        this._perfil_usuario = false;
        this._bodegas = false;
        this._configuracion = false;
        this._maquinaria = false;
        this._imagenes_productos = false;
        this._garantias = false;
        this._cronograma = false;
        this._repuestos = false; this._monitorear = false;
        this._mantenimiento_tickets = false;
        break;
      case 'Clientes':
        this._usuario = false;
        this._dashboard = false;
        this._asignacion = false;
        this._clientes = true;
        this._agencias = false;
        this._maquinaria = false;
        this._perfil_usuario = false;
        this._bodegas = false;
        this._configuracion = false;
        this._imagenes_productos = false;
        this._garantias = false;
        this._cronograma = false;
        this._repuestos = false; this._monitorear = false;
        this._mantenimiento_tickets = false;
        break;
      case 'Agencias':
        this._usuario = false;
        this._dashboard = false;
        this._asignacion = false;
        this._clientes = false;
        this._agencias = true;
        this._maquinaria = false;
        this._perfil_usuario = false;
        this._bodegas = false;
        this._configuracion = false;
        this._imagenes_productos = false;
        this._garantias = false;
        this._cronograma = false;
        this._repuestos = false; this._monitorear = false;
        this._mantenimiento_tickets = false;
        break;
      case 'Maquinaria':
        this._usuario = false;
        this._dashboard = false;
        this._asignacion = false;
        this._clientes = false;
        this._agencias = false;
        this._maquinaria = true;
        this._perfil_usuario = false;
        this._bodegas = false;
        this._configuracion = false;
        this._imagenes_productos = false;
        this._garantias = false;
        this._cronograma = false;
        this._repuestos = false; this._monitorear = false;
        this._mantenimiento_tickets = false;
        break;
      case 'Perfil':
        this._usuario = false;
        this._dashboard = false;
        this._asignacion = false;
        this._clientes = false;
        this._agencias = false;
        this._maquinaria = false;
        this._perfil_usuario = true;
        this._bodegas = false;
        this._configuracion = false;
        this._imagenes_productos = false;
        this._garantias = false;
        this._cronograma = false;
        this._repuestos = false; this._monitorear = false;
        this._mantenimiento_tickets = false;
        break;
      case 'Bodegas Virtuales':
        this._usuario = false;
        this._dashboard = false;
        this._asignacion = false;
        this._clientes = false;
        this._agencias = false;
        this._maquinaria = false;
        this._perfil_usuario = false;
        this._bodegas = true;
        this._configuracion = false;
        this._imagenes_productos = false;
        this._garantias = false;
        this._cronograma = false;
        this._repuestos = false; this._monitorear = false;
        this._mantenimiento_tickets = false;
        break;
      case 'Configuración':
        this._usuario = false;
        this._dashboard = false;
        this._asignacion = false;
        this._clientes = false;
        this._agencias = false;
        this._maquinaria = false;
        this._perfil_usuario = false;
        this._bodegas = false;
        this._configuracion = true;
        this._imagenes_productos = false;
        this._garantias = false;
        this._cronograma = false;
        this._repuestos = false; this._monitorear = false;
        this._mantenimiento_tickets = false;
        break;
      case 'Imagenes Productos':
        this._usuario = false;
        this._dashboard = false;
        this._asignacion = false;
        this._clientes = false;
        this._agencias = false;
        this._maquinaria = false;
        this._perfil_usuario = false;
        this._bodegas = false;
        this._configuracion = false;
        this._imagenes_productos = true;
        this._garantias = false;
        this._cronograma = false;
        this._repuestos = false; this._monitorear = false;
        this._mantenimiento_tickets = false;
        break;
      case 'Contratos y garantías':
        this._usuario = false;
        this._dashboard = false;
        this._asignacion = false;
        this._clientes = false;
        this._agencias = false;
        this._maquinaria = false;
        this._perfil_usuario = false;
        this._bodegas = false;
        this._configuracion = false;
        this._imagenes_productos = false;
        this._garantias = true;
        this._cronograma = false;
        this._repuestos = false; this._monitorear = false;
        this._mantenimiento_tickets = false;
        break;
      case 'Cronograma':
        this._usuario = false;
        this._dashboard = false;
        this._asignacion = false;
        this._clientes = false;
        this._agencias = false;
        this._maquinaria = false;
        this._perfil_usuario = false;
        this._bodegas = false;
        this._configuracion = false;
        this._imagenes_productos = false;
        this._garantias = false;
        this._cronograma = true;
        this._repuestos = false; this._monitorear = false;
        this._mantenimiento_tickets = false;
        break;
      case 'Repuestos':
        this._usuario = false;
        this._dashboard = false;
        this._asignacion = false;
        this._clientes = false;
        this._agencias = false;
        this._maquinaria = false;
        this._perfil_usuario = false;
        this._bodegas = false;
        this._configuracion = false;
        this._imagenes_productos = false;
        this._garantias = false;
        this._cronograma = false;
        this._repuestos = true;
        this._monitorear = false;
        this._mantenimiento_tickets = false;
        break;
      case 'Monitoreo':
        this._usuario = false;
        this._dashboard = false;
        this._asignacion = false;
        this._clientes = false;
        this._agencias = false;
        this._maquinaria = false;
        this._perfil_usuario = false;
        this._bodegas = false;
        this._configuracion = false;
        this._imagenes_productos = false;
        this._garantias = false;
        this._cronograma = false;
        this._repuestos = false;
        this._monitorear = true;
        this._mantenimiento_tickets = false;
        break;
      case 'Mantenimiento Tickets':
        this._usuario = false;
        this._dashboard = false;
        this._asignacion = false;
        this._clientes = false;
        this._agencias = false;
        this._maquinaria = false;
        this._perfil_usuario = false;
        this._bodegas = false;
        this._configuracion = false;
        this._imagenes_productos = false;
        this._garantias = false;
        this._cronograma = false;
        this._repuestos = false;
        this._monitorear = false;
        this._mantenimiento_tickets = true;
        break;
    }
  }

  versionCMSLista: any = [];
  obtenerVersionCMS() {
    this._show_spinner = true;
    this.dash.getVersionCMS().subscribe({
      next: (cms) => {
        this.versionCMSLista = cms;
        this._show_spinner = false;
      }, error: (e) => {
        console.error(e);
        this._show_spinner = false;
      }
    })
  }

  versionlista: any = [];
  obtenerVersionamiento(version: string) {
    this._show_spinner = true;
    this.dash.getVersion(version).subscribe({
      next: (version) => {
        this.versionlista = version;
        this._show_spinner = false;
      }, error: (e) => {
        this._show_spinner = false;
      }
    })
  }
  listEmpresa: any = [];
  obtenerEmpresa() {
    this._show_spinner = true;
    this.dash.obtenerEmpresa().subscribe({
      next: (empresa) => {
        this.listEmpresa = empresa;
        this._show_spinner = false;
      },
      error: (e) => {
        console.error(e);
        this._show_spinner = false;
      },
      complete: () => {
        sessionStorage.setItem('codcia', this.listEmpresa[0].codcia);
        this._show_spinner = false;
      }
    })
  }


}
