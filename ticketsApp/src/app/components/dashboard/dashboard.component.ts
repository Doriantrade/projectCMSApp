import { Component, ElementRef, EventEmitter, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { EncryptService } from '../shared/services/encrypt.service';
import { jwtDecode } from "jwt-decode";
import { Environments } from 'src/app/environments/environments';
import { LoginService } from '../login/services/login.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { MaintenanceNotificationService } from './services/maintenance-notification.service';

import Swal from 'sweetalert2';
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
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit {

  TicketTagIdPadre: string = '';
  cantidadTicketsListen: number = 0;
  @ViewChild('audioAlert') audioAlert!: ElementRef;
  @Output() emitFileMediaCotiza: EventEmitter<any> = new EventEmitter();
  @Output() emitRepuRequerCotiza: EventEmitter<any> = new EventEmitter();

  view_cli: boolean = true;
  show_alert_tickets: boolean = false;
  navside_state: 'open' | 'compressed' | 'hidden' = 'open';
  form_view: boolean = false;
  nameidentifier: any;
  sub: any;
  name: any;
  role: any;
  authorizationdecision: any;
  exp: any;
  iss: any;
  aud: any;
  codcli: any;

  notificaciones: any[] = [];
  imagenCLiente: any;
  private intervalo: any = null;

  // signal r
  private urlHub = this.env.apiHelpDeskSytemh;
  private urlHubCMS = this.env.apiCMSfile;
  private cotizacionAprobadaHub: HubConnection;
  private mantenimientoHub: HubConnection;
  private locationHub: HubConnection;

  constructor(
    private ngZone: NgZone,
    private ncrypt: EncryptService,
    private env: Environments,
    private log: LoginService,
    public maintenanceNotificationService: MaintenanceNotificationService) {

    this.cotizacionAprobadaHub = new HubConnectionBuilder()
      .withUrl(this.urlHub + 'hubs/SendCotizAproHub').build();

    this.cotizacionAprobadaHub
      .on("SendAprobarCotizacionHub", (l: any, d: any) => {
        this.ticketCotizacionAprob(l, d);
      });

    this.mantenimientoHub = new HubConnectionBuilder()
      .withUrl(this.urlHubCMS + 'hubs/estadosMantenimientosCanbiados').build();

    this.mantenimientoHub
      .on("MantenimimetoEstadosSend", (data: any) => {
        this.obtenerMantenimientosEstados(data);
      });

    this.locationHub = new HubConnectionBuilder()
      .withUrl(this.urlHub + 'locationHub').build();

    this.locationHub.on("RecibirUbicacion", (data: any) => {
      this.getGeoLocalizacionTecnicoMobile(data);
    });

  }


  getGeoLocalizacionTecnicoMobile(data: any) {
    console.log('//////////////////////////////////////////////////////////');
    console.log('RECIBIENDO UBICACION EN TIEMPO REAL');
    console.table(data);
    console.log('//////////////////////////////////////////////////////////');
  }


  connectSignalR() {

    this.cotizacionAprobadaHub.start().then(() => {
      // console.log('CONECTADO@! HUB DE COTIZACION')
    }).catch(e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DEL ESTADO DE LA COTIZACION:', e);
    })

    // CONEXION A MANTENIMIENTO DE LA APP MOBIL DE TECNICOS
    this.mantenimientoHub.start().then(() => {
      console.log('CONECTADO@! HUB DE MANTENIMIENTOS')
    }).catch(e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DEL ESTADO DE MANTENIMIENTOS:', e);
    })

    // CONEXION A HUB DE LOCALIZACION
    this.locationHub.start().then(() => {
      console.log('CONECTADO@! HUB DE LOCALIZACION');
      // Unirse al grupo "0" para recibir las pruebas
      this.locationHub.invoke('JoinTicketGroup', '0')
        .catch(err => console.error('Error al unirse al grupo de ticket:', err));
    }).catch(e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DE LOCALIZACION:', e);
    })

  }

  obtenerMantenimientosEstados(data: any) {
    console.warn('Notificación de mantenimiento recibida:', data);
    this.maintenanceNotificationService.addNotification(data);
  }

  ticketCotizacionAprob(data: any, listaRepu: any) {
    this.emitFileMediaCotiza.emit(data);
    this.emitRepuRequerCotiza.emit(listaRepu);
    data.imagenCLiente = this.env.apiCMSfile + 'icon-cliente/' + data.imagen;
    if (this.role == 'A') {
      this.notificaciones.unshift(data);
      const audioElement: HTMLAudioElement | null = document.querySelector('audio');
      if (audioElement) audioElement.play().catch(error => console.error("Error al reproducir audio:", error));
    }
  }

  cerrarNotificacion(noti: any) {
    this.notificaciones = this.notificaciones.filter(n => n !== noti);
  }

  ngOnInit(): void {
    this.log.validate();
    this.getToken();
    this.connectSignalR();
    this.iniciarTemporizadorDeExpiracion();
  }

  iniciarTemporizadorDeExpiracion(): void {
    const expTimestamp = sessionStorage.getItem('exp');

    if (!expTimestamp) {
      console.error("Error: No se encontró 'exp' en sessionStorage.");
      return;
    }

    const fechaExpiracion = new Date(parseInt(expTimestamp, 10) * 1000);

    this.ngZone.runOutsideAngular(() => {
      this.intervalo = setInterval(() => {
        this.ngZone.run(() => {
          this.actualizarTemporizador(fechaExpiracion);
        });
      }, 1000);
    });
  }
  msj_time_exp: any;
  private actualizarTemporizador(fechaExpiracion: Date): void {
    const tiempoRestanteMs = fechaExpiracion.getTime() - Date.now();

    if (tiempoRestanteMs <= 0) {
      this.detenerTemporizador();
      // // console.log("El token ha expirado.");
      // Lógica para manejar la expiración
      this.log.closeSession();
      return;
    }

    // Convertir a horas, minutos y segundos
    const segundosTotales = Math.floor(tiempoRestanteMs / 1000);
    const horas = Math.floor(segundosTotales / 3600);
    const minutos = Math.floor((segundosTotales % 3600) / 60);
    const segundos = segundosTotales % 60;

    // Formatear el resultado
    let tiempoFormateado = '';

    if (horas > 0) {
      tiempoFormateado = `${horas}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    } else {
      tiempoFormateado = `${minutos}:${segundos.toString().padStart(2, '0')}`;
    }

    this.msj_time_exp = `Esta sesión expira en: ${tiempoFormateado}`;
  }

  private detenerTemporizador(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
  }

  ngOnDestroy(): void {
    this.detenerTemporizador();
  }

  obtenerCantidadTickets(event: any) {
    this.cantidadTicketsListen = event;
    // // console.warn( 'Cantidad: ' + event );
  }

  codigoClientePadre: string = '';
  obtenerCodCLiListenTicket(event: any) {
    this.codigoClientePadre = event;
  }

  obtenerTicketTagId(event: any) {
    this.TicketTagIdPadre = event;
    console.log('Component Dashboard emitiendo el ticket: ' + this.TicketTagIdPadre)
  }

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

      const rolEncrypt: any = this.ncrypt.encryptWithAsciiSeed(this.role, this.env.es, this.env.hash);

      sessionStorage.setItem('PR', rolEncrypt);
      sessionStorage.setItem('ID', this.nameidentifier);
      sessionStorage.setItem('codcli', this.codcli);
      sessionStorage.setItem('exp', this.exp.toString());

      if (this.role == 'R004') {
        this.view_cli = true;
        this.show_alert_tickets = false;
      }
      else if (this.role == 'R003') {
        this.view_cli = false;
        this.show_alert_tickets = true;
      }
      else if (this.role == 'R001') {
        this.view_cli = false;
        this.show_alert_tickets = true;
      }
    }
  }

  getti: any;
  getTicket(event: any) {
    if (event) {
      this.getti = event;
      // console.warn('Ticket enviado desde mi formulario al dashboard');
      console.table(this.getti);
    }
  }

  showFormPermission(event: any) {
    this.form_view = event;
  }

  dataUpdateTicketDasboard: any;
  ObtenerDataTicketUpdate(event: any) {
    if (event) {
      this.form_view = true;
      this.dataUpdateTicketDasboard = event;
      // // // console.warn(this.dataUpdateTicketDasboard);
    }
  }

  closeFormularioTicket(event: any) {
    this.form_view = event;
  }

  listenTicket(event: any) {
    // // console.log(event);
  }

  toggleLeftPanel() {
    if (this.navside_state === 'open') {
      this.navside_state = 'compressed';
    } else {
      this.navside_state = 'open';
    }
  }

  hideCompletelyLevel() {
    this.navside_state = 'hidden';
  }

}
