import { Component, EventEmitter, OnDestroy, OnInit, Output, HostListener } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import Swal from 'sweetalert2';
import { LoginService } from '../../login/services/login.service';
import { NavsideService } from './services/navside.service';
import { ImagecontrolService } from '../image-control/services/imagecontrol.service';
import { environment } from 'src/environments/environment';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})

export interface Modulo {
  nombre: string;
  icono: string;
  permiso: string;
}

@Component({
  selector: 'app-navside',
  templateUrl: './navside.component.html',
  styleUrls: ['./navside.component.scss']
})

export class NavsideComponent implements OnInit, OnDestroy {
  private permissionsHubConnection!: signalR.HubConnection;

  _show_spinner:      boolean = false;
  imgList:             any        = [];
  public modulosLista: any        = [];
  public modulosAgrupados: { tipo: string, groupName: string, groupIcon: string, modulos: any[] }[] = [];
  public _username:    any        = '';
  public _IMGE:        any;
  public codUser:      any        = '';
  _tipo_persona:       string     = '';
  moduleName: boolean = true;
  _fontSize: string = '15pt';
  _width: string = '40px';
  _width_navside: string = '230px';
  _user: boolean = true;
  _icon: string = 'chevron_left';

  @Output() modulo: EventEmitter<Modulo> = new EventEmitter<Modulo>();

  constructor( private validate: LoginService,
               public  Shared:   NavsideService,
               private fileserv: ImagecontrolService ) { }
  
  ngOnInit(): void {
    this.getModulos();
    this.initPermissionsHub();
  }

  ngOnDestroy(): void {
    if (this.permissionsHubConnection) {
      this.permissionsHubConnection.stop();
    }
  }

  initPermissionsHub(): void {
    this.permissionsHubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.hub + 'hubs/permissionsHub')
      .withAutomaticReconnect()
      .build();

    this.permissionsHubConnection.on('ForceUpdatePermissions', (coduser: string, fullName: string) => {
      const myUser = sessionStorage.getItem('UserCod');
      if (myUser && myUser === coduser) {
        Swal.fire({
          icon: 'warning',
          title: '¡Alerta de Permisos!',
          html: `Los permisos del usuario <b>${fullName}</b> han sido modificados por el administrador.<br><br>La sesión será recargada para aplicar los nuevos cambios.`,
          confirmButtonText: 'Entendido',
          allowOutsideClick: false,
          timer: 5000,
          timerProgressBar: true
        }).then(() => {
          window.location.reload();
        });
      }
    });

    this.permissionsHubConnection.start()
      .then(() => console.log('PermissionsHub conectado.'))
      .catch(err => console.error('Error conectando PermissionsHub:', err));
  }

  getModulos() {
    this._show_spinner = true;
    this._username = sessionStorage.getItem('UserName')?.toUpperCase();
    this.codUser = sessionStorage.getItem('UserCod');
    this.Shared.getModulos( this.codUser ).subscribe(
      {
        next: (modulos) => {
          this.modulosLista = modulos;
          this.agruparModulos();
          console.table(this.modulosLista);
        },
        error: (e) => {
          console.error(e);
          this._show_spinner = false;
        },
        complete: () => {
          let x: any = localStorage.getItem('imgperfil');
          if( x == undefined || x == null || x == '' ) this.obtenerImagen(this.codUser, 'Perfil'); 
          else this._IMGE = localStorage.getItem('imgperfil');
          this._show_spinner = false;
        }
      }
    )
  }

  agruparModulos() {
    const defaultGroup = 'OTROS';
    
    // Nombres legibles e iconos para grupos
    const groupDisplayData: any = {
      'CONFI': { name: 'Configuraciones de Sistema', icon: 'settings_suggest' },
      'MANTE': { name: 'Mantenimientos', icon: 'engineering' },
      'FUNCI': { name: 'Funcionalidades', icon: 'widgets' },
      'OTROS': { name: 'Otros Módulos', icon: 'grid_view' }
    };

    const grouped: any = {};

    for (const mod of this.modulosLista) {
      if (mod.permisos === 0) continue; // Si es 0 => Módulo no visible

      const tipo = mod.tipo && mod.tipo.trim() !== '' ? mod.tipo.trim().toUpperCase() : defaultGroup;
      if (!grouped[tipo]) {
        grouped[tipo] = [];
      }
      grouped[tipo].push(mod);
    }

    // Convertir a un arreglo para iterarlo más fácil en HTML
    this.modulosAgrupados = Object.keys(grouped).map(key => ({
      tipo: key,
      groupName: groupDisplayData[key] ? groupDisplayData[key].name : key,
      groupIcon: groupDisplayData[key] ? groupDisplayData[key].icon : 'apps',
      modulos: grouped[key]
    }));
  }

  navsideState: 'open' | 'compressed' | 'hidden' = 'open';

  @HostListener('window:keydown.Escape', ['$event'])
  handleKeyDown(event: any) {
    if (this.navsideState === 'open' || this.navsideState === 'compressed') {
      this.hideNavsideCompletely();
    } else {
      this.navsideState = 'open';
      this.applyNavsideState();
    }
  }

  constrolNavside() {
    if (this.navsideState === 'open') {
      this.navsideState = 'compressed';
    } else {
      this.navsideState = 'open';
    }
    this.applyNavsideState();
  }

  hideNavsideCompletely() {
    this.navsideState = 'hidden';
    this.applyNavsideState();
  }

  applyNavsideState() {
    if (this.navsideState === 'open') {
        this.moduleName = true;
        this._fontSize = '14pt';
        this._width = '';
        this._width_navside = '230px';
        this._user = true; 
        this._icon = 'chevron_left';
    } else if (this.navsideState === 'compressed') {
        this.moduleName = false; 
        this._fontSize = '20pt';
        this._width = '40px';
        this._width_navside = '100px';
        this._user = false; 
        this._icon = 'chevron_right';
    } else if (this.navsideState === 'hidden') {
        this.moduleName = false;
        this._user = false;
        this._width_navside = '0px';
        this._icon = 'chevron_right';
    }
  }
  
  closeSession() {
    this.validate.closeSession();
  }

  botonClick(data: any) {

    let modulo: Modulo = {
      nombre: data.moduleName,
      icono: data.icon,
      permiso: data.permisos
    }

    localStorage.setItem('modulo',modulo.nombre);
    localStorage.setItem('PMod',modulo.permiso);

    this.modulo.emit(modulo)

  }

  obtenerImagen(codBinding:string, tipo:string) {
    this._show_spinner = true;
    let codm : any = codBinding;
    this.fileserv.obtenerImagenCodBinding('IMG-'+codm, tipo).subscribe({
      next: (img) => {
        this.imgList = img;
      }, error: (e) => {
        this._show_spinner = false;
        console.error(e);
      }, complete: () => {        
        this.imgList.filter( (element:any) => {
          if(element.codentidad == 'IMG-'+codm) {
            this._IMGE = element.imagen;
            localStorage.setItem('imgperfil', this._IMGE);
          }
        })
        this._show_spinner = false; 
      }
    })
  }

}
