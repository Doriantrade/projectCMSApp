import { Component } from '@angular/core';
import { TablaHelpDeskService } from '../../dashboard/tabla-help-desk/services/tabla-help-desk.service';
import { EncryptService } from '../services/encrypt.service';
import { Environments } from 'src/app/environments/environments';
import { jwtDecode } from "jwt-decode";
import { LoginService } from '../../login/services/login.service';
import Swal from 'sweetalert2'
import { FormularioRegistroProblemasService } from '../../dashboard/formulario-registro-problemas/services/formulario-registro-problemas.service';
import { ConfiguracionesComponent } from '../configuraciones/configuraciones.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalMantenimientosComponent } from '../../dashboard/modal-mantenimientos/modal-mantenimientos.component';
import { PerfilComponent } from './perfil/perfil.component';
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  }
});

@Component({
  selector: 'app-navside',
  templateUrl: './navside.component.html',
  styleUrls: ['./navside.component.scss']
})

export class NavsideComponent {

  _view_repo: boolean = false;
  _view_cotiza: boolean = false;
  width_offCanvas: string = '25%'
  cliente_choice: string = 'NO SELECCIONADO';
  _show_spinner: boolean = true;
  sub: any;
  nameidentifier: any;
  name: any;
  role: any;
  authorizationdecision: any;
  exp: any;
  iss: any;
  aud: any;
  codcli: any;
  head_agen: any = 'Agencia';
  view_cli: boolean = true;
  actionButton: boolean = true;

  listaTickets: any = [];
  listaTicketsGhost: any = [];

  nombreUser: any;
  ccia: any;
  _cli_view: boolean = true;

  ngOnInit(): void {
    this.getToken();
  }

  constructor(public dialog: MatDialog, private form: FormularioRegistroProblemasService, private ncrypt: EncryptService, private env: Environments, private log: LoginService) { }

  cerrarSesion = () => this.log.closeSession();

  getToken() {
    let xtoken: any = sessionStorage.getItem('token');
    const xtokenDecript: any = this.ncrypt.decryptWithAsciiSeed(xtoken, this.env.es, this.env.hash);
    if (xtokenDecript != null || xtokenDecript != undefined) {
      var decoded: any = jwtDecode(xtokenDecript);
      this.sub = decoded["sub"];
      this.nameidentifier = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      this.name = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
      this.role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      this.authorizationdecision = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/authorizationdecision"];
      this.exp = decoded["exp"];
      this.iss = decoded["iss"];
      this.aud = decoded["aud"];
      this.codcli = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/country"];

      this.nombreUser = this.name[0];
      this.ccia = this.name[1];

      if (this.role == 'R004') {
        this._cli_view = false;
      } else if (this.role == 'R002') {
        this._cli_view = false;
      } else if (this.role == 'R003') {
        this._cli_view = true;
      }


      sessionStorage.setItem('ccia', this.ccia);

    }
  }


  openDataConfigDialog() {

    let xidCliente: any = localStorage.getItem('id-cliente-escogido');
    if (xidCliente == null || xidCliente == undefined) {
      Swal.fire({
        title: "Cliente no seleccionado",
        text: "Debes seleccionar un ticket en el panel izquierdo de la pantalla, o un cliente de la lista ubicada en el panel derecho de la misma.",
        icon: "question"
      });

      return

    }

    const dialogRef = this.dialog.open(ConfiguracionesComponent, {
      height: '95%',
      width: '80%',
      data: xidCliente
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {

      }
    });

  }

  openMaintenanceModal() {
    this.dialog.open(ModalMantenimientosComponent, {
      width: '80%',
      maxWidth: '900px',
      panelClass: 'custom-dialog-container'
    });
  }

  openProfileModal() {
    let xidUser: any = sessionStorage.getItem('codcli');
    if (!xidUser) {
      Swal.fire({
        title: "Error",
        text: "No se encontró el ID del usuario.",
        icon: "error"
      });
      return;
    }

    this.dialog.open(PerfilComponent, {
      width: '400px',
      data: xidUser
    });
  }

  obtenerTicketsRequerimientos(): void {
    this._show_spinner = true;
    let x: any = localStorage.getItem('id-cliente-escogido');
    let y: any = localStorage.getItem('nombre-cliente-escogido');
    if (x == undefined || x == null) {
      Swal.fire({
        title: "Cliente no seleccionado",
        text: "Debes seleccionar un cliente de la lista ubicada en la parte izquierda de la pantalla, para visualizar sus reportes.",
        icon: "question"
      });
      this.cliente_choice = 'NO SELECCIONADO';
      this.width_offCanvas = '25%'
    } else {
      this.cliente_choice = y;
      this.form.obtenerTicketsRequerimientos(x, 'CMS-001-2023', 1).subscribe({
        next: (tickets: any) => {
          this.listaTickets = tickets;
          this.listaTicketsGhost = [...tickets];
          // // console.warn(this.listaTickets);
          this.listaTickets.forEach((ticket: any) => {
            // this.obtenerMantenimientosAgregados(ticket.idTicket);

            // Definir etiquetas para tipo de requerimiento
            const requerimientoMap: any = {
              '001': 'MP',
              '002': 'MC',
              '003': 'ME'
            };
            ticket.tRequerTag = requerimientoMap[ticket.tipoRequerimiento] || '';

            // Formatear ID de requerimiento
            ticket.idRequerimientoPad = `#${ticket.tRequerTag}-${ticket.idTicket.toString().padStart(9, '0')}`;

            // Definir nombres para `espacioSirve`
            const espacioSirveMap: any = {
              'BOB': 'BÓBEDA',
              'BOD': 'BÓBEDA',
              'CAJ': 'CAJA'
            };

            ticket.espacioSirveNombre = espacioSirveMap[ticket.espacioSirve] || 'DESCONOCIDO';

            // Definir colores y significados según el estado
            const estadoMap: any = {
              '1': { color: '#B8DEF6', significado: 'Enviado pero no leído aún.' },
              '2': { color: '#FFECA1', significado: 'Requerimiento asignado.' },
              '3': { color: '#65ecc3', significado: 'En proceso.' },
              '4': { color: '#75f52c', significado: 'Ticket cerrado.' },
              '5': { color: '#F4E900', significado: 'En solución pero en espera de repuestos.' }
            };

            const estadoInfo: any = estadoMap[ticket.estado];
            ticket.colorEstado = estadoInfo?.color || '#FFFFFF';
            ticket.estadoSignificado = estadoInfo?.significado || 'Estado desconocido.';

            // Asociar mantenimientos agregados al ticket
          });
        },
        error: (error) => {
          this._show_spinner = false;
          console.error('Error obteniendo tickets:', error);
        },
        complete: () => {
          this._show_spinner = false;
          // // console.log('Procesamiento de tickets completado.');
          // // console.warn(this.listaTickets);
        }
      });
    }


  }

  idTicketSend: any = [];
  sendIdTicket(id: number, idRequerPad: any) {
    this._view_repo = true;
    this.idTicketSend = [{ id: id, idRequerPad: idRequerPad }];
    if (this._view_repo) this.width_offCanvas = '50%'
    else this.width_offCanvas = '25%'
    // // console.warn('Enviado: ' + this.idTicketSend);
  }



}
