import { FormularioRegistroProblemasService } from '../formulario-registro-problemas/services/formulario-registro-problemas.service';
import { ModalCotizacionComponent } from '../repuestos-asignados/modal-cotizacion/modal-cotizacion/modal-cotizacion.component';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MensajeriaTicketService } from './mensajeria-ticket/services/mensajeria-ticket.service';
import { ModalPreviewComponent } from '../../shared/modal-preview/modal-preview.component';
import { ImagecontrolService } from '../../shared/imagen-control/imagecontrol.service';
import { TablaHelpDeskService } from './services/tabla-help-desk.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { EncryptService } from '../../shared/services/encrypt.service';
import { Environments } from 'src/app/environments/environments';
import { MatDialog } from '@angular/material/dialog';
import { jwtDecode } from "jwt-decode";
import { FechasRealesService } from './fecha-real/services/fechas-reales.service';
import { ModalEstadoColorComponent } from '../../shared/modal-estado-color/modal-estado-color.component';
import { animate, state, style, transition, trigger } from '@angular/animations';

import Swal from 'sweetalert2';
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
})

@Component({
  selector: 'app-tabla-help-desk',
  templateUrl: './tabla-help-desk.component.html',
  styleUrls: ['./tabla-help-desk.component.scss'],
  animations: [
    trigger('slidePanel', [
      state('visible', style({
        transform: 'translateX(0)',
        display: 'block'
      })),
      state('hidden', style({
        transform: 'translateX(100%)',
        display: 'none'
      })),
      transition('visible <=> hidden', [
        animate('300ms ease-in-out')
      ]),
    ])
  ]
})

export class TablaHelpDeskComponent implements OnInit, OnChanges {

  @ViewChild('audioPlayer') audioPlayer!: ElementRef;
  @Output() dataUpdateTicketEmit: EventEmitter<any> = new EventEmitter();
  @Output() showFormPermission: EventEmitter<any> = new EventEmitter();
  @Output() ticketAlertEmit: EventEmitter<any> = new EventEmitter();
  @Output() codCliToPanelCliente: EventEmitter<any> = new EventEmitter();
  @Input() listenTicket: any;
  @Input() listenCodCli: any;
  @Input() listenTagTicket: any;

  nticketEmitido: any;
  cont: number = 0;

  public math = Math;
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  paginatedTickets: any[] = [];

  show_panel_cliente: boolean = false;
  panelState: 'visible' | 'hidden' = 'visible';
  panelHidden: boolean = false;
  show_files_cotiza: boolean = false;
  getFileMediaListen: any;
  getListaRepuRequer: any;
  ticketSend: any = [];
  numberTicket: string = '';
  modelDataSend: any = [];
  listaTicketPendientes: any = [];
  _show_order_work: boolean = true;
  _cli_view: boolean = false;
  _show_resumen_mantenimiento: boolean = false;
  _show_file_media_ticket: boolean = false;
  _show_fecha_real: boolean = false;
  nameidentifier: any;

  sub:                            any;
  name:                           any;
  role:                           any;
  authorizationdecision:          any;
  exp:                            any;
  iss:                            any;
  aud:                            any;
  codcli:                         any;
  head_agen:                      any = 'Agencia';
  actionButton:                   boolean = true;
  listaTickets:                   any = [];
  listaTicketsGhost:              any = [];
  _show_messenger:                boolean = false;
  activeTicketId:                 number | null = null;
  icon_action:                    string = 'message';
  listaTicketsNoLeidos:           any = [];
  intervaloModel:                 any = [];
  intervaloModelMsj:              any = [];
  idTicketEmit:                   number = 0;
  toggle_maxim:                   boolean = false;
  widthMessenger:                 string = '40%';
  xcodcli:                        any;
  xccia:                          any;
  urlServer:                      any;
  modelCliente:                   any = [];
  mantenimientosAgregados:        any = [];
  listaTecnicosRecibidos:         any = [];
  listaRepuestosRecibidos:        any = [];
  _show_spinner:                  boolean = false;
  showImg:                        boolean = true;
  modelSendRequer:                any = [];
  width_box:                      any = '100%';
  listaAlertaMantenimientosHoras: any = [];
  isIsolated:                     boolean = false;
  autoTriggeredClientLoad:        boolean = false;

  actionMenuTicket: any = [
    {
      description: "Orden de trabajo",
      icon: "receipt",
      codec: "000",
    },
    {
      description: "Fecha real",
      icon: "calendar_month",
      codec: "004"
    },
    {
      description: "Resumen de Mantenimiento",
      icon: "engineering",
      codec: "001"
    },
    {
      description: "Documentación media",
      icon: "perm_media",
      codec: "003"
    }
  ]



  playAudio() {
    this.audioPlayer.nativeElement.play();
  }

  togglePanel() {
    this.panelState = this.panelState === 'visible' ? 'hidden' : 'visible';
  }

  showPanel() {
    this.panelState = 'visible';
  }

  private urlHub: any;
  private urlHubK: any;
  private estadoTickets!: HubConnection;
  private tecnicoEnviado!: HubConnection;
  private ticketsSendAlertData!: HubConnection;
  private cantFileHub!: HubConnection;
  private mensajesHub!: HubConnection;
  private eliminaTecinoSignal!: HubConnection;
  private eliminarFileSignal!: HubConnection;
  private _tiempoMantenimiento!: HubConnection;
  private updateTicketSub: any;

  ngOnInit(): void {
    this.xcodcli = sessionStorage.getItem('codcli');
    this.xccia = sessionStorage.getItem('ccia');
    this.getToken();
    this.urlServer = this.env.apiHelpDeskSytemh;
    this.requestNotificationPermission();
    this.subscribeToPushNotifications();
    this.connectSignalR();
    
    this.updateTicketSub = this.helpdeskserv.ticketActualizado$.subscribe(() => {
      this.obtenerTicketsRequerimientos(this.listenCodCli);
    });
  }

  ngOnDestroy(): void {
    if (this.updateTicketSub) {
       this.updateTicketSub.unsubscribe();
    }
  }

  // En tabla-help-desk.component.ts
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['listenCodCli'] && this.listenCodCli) {
      console.warn('Estamos escuchando un cambio en listenCodCli:', this.listenCodCli);
      // this.obtenerTicketsRequerimientos(this.listenCodCli);
    }

    if (changes['listenTicket'] && this.listenTicket) {      
      if (this.role == 'R004' || this.role == 'R002') {
        console.warn('Estamos escuchando un cambio en listenTicket, y desde el ROL Cliente:', this.listenTicket);
        // this.obtenerTicketsRequerimientos(this.listenCodCli);
      }
    }

    if (changes['listenTagTicket'] && this.listenTagTicket) {
      console.warn('Recibido desde el Dashboard el ticket a expandir:', this.listenTagTicket);
      console.warn(this.listenTagTicket)
      this.autoTriggeredClientLoad = true;
      this.expandirTicketLocally(this.listenTagTicket);
    }
    
  }

  expandirTicketLocally(tagTicket: any) {
    
    if (!this.listaTicketsGhost) return;
    // Filter from the GHOST list (master copy) to show only the selected ticket
    const ticketEncontrado = this.listaTicketsGhost.find((x: any) =>
      '#' + tagTicket == x.idRequerimientoPad || x.idRequerimientoPad == tagTicket || x.idTicket == tagTicket
    );

    if (ticketEncontrado) {
      // FORCE the visible list to be ONLY this ticket
      // We create a new array to ensure change detection works if needed (though mutation usually is fine in standard angular change detection unless OnPush)
      this.listaTickets = [ticketEncontrado];

      // Expand it and set view details
      // We modify the object in the new list 
      // (which is a reference to the same object in ghost list, which is fine)
      this.listaTickets[0].collapseShow = 'accordion-collapse collapse show';

      this.sendIdTicket(this.listaTickets[0].idTicket);
      // Update pagination to reflect the single item
      // Force page 1
      this.currentPage = 1;

      this.isIsolated = true;

      // Manually trigger pagination update to ensure paginatedTickets has exactly 1 item
      this.updatePagination();
      console.warn('Ticket filtrado y paginación actualizada. Total items:', this.totalItems, 'Paginated items:', this.paginatedTickets.length);
    } else {
      console.warn('Ticket no encontrado localmente para filtrado:', tagTicket);
    }

  }

  restoreList() {
    this.isIsolated = false;
    this.listaTickets = [...this.listaTicketsGhost];
    this.listaTickets.forEach((t: any) => t.collapseShow = 'accordion-collapse collapse');
    this.currentPage = 1;
    this.updatePagination();
  }

  obtenerTicketsRequerimientos(codcli: string): void {

    let codcliente = codcli;
    if (codcli == null || codcli == undefined || codcli == '') {
      const xcli: any = sessionStorage.getItem('codcli');
      codcliente = xcli;
    }

    this.listaTecnicosRecibidos = [];
    setTimeout(() => {
      this._show_spinner = true;
    });
    this.form.obtenerTicketsRequerimientos(codcliente, this.xccia, 1).subscribe({
      next: (tickets: any) => {
        // Ordenar por fecha (fecrea) de más reciente a más antigua
        const ticketsOrdenados = [...tickets].sort((a, b) => {
          return new Date(b.fecrea).getTime() - new Date(a.fecrea).getTime();
        });

        // Agrupar por estado
        const ticketsAgrupadosPorEstado: { [ key: string ]: any[] } = {};
        ticketsOrdenados.forEach((ticket) => {
          if (!ticketsAgrupadosPorEstado[ticket.estado]) {
            ticketsAgrupadosPorEstado[ticket.estado] = [];
          }
          ticketsAgrupadosPorEstado[ticket.estado].push(ticket);
        });

        // Aplanar la lista manteniendo el orden de estados
        const estadosOrdenados = ['1', '2', '3', '5', '4'];
        this.listaTickets = estadosOrdenados.reduce((acc, estado) => {
          if (ticketsAgrupadosPorEstado[estado]) {
            acc.push(...ticketsAgrupadosPorEstado[estado]);
          }
          return acc;
        }, [] as any[]);

        // console.warn('TICKET REQUERIMIENTO ORDENADO Y AGRUPADO');
        // console.warn(this.listaTickets);
        this.listaTicketsGhost = [...this.listaTickets];

        this.listaTickets.forEach((ticket: any) => {
          
          if (this.role == 'R002') {
            this.show_files_cotiza = true;
            if (ticket.fileCotiza > 1) ticket.fileCotiza = ticket.fileCotiza - 1;
          }
          
          if (this.role == 'R003') {
            this.show_files_cotiza = true;
          }

          if (this.role == 'R004') {
            this.show_files_cotiza = false;
          }

          ticket.collapseShow = 'accordion-collapse collapse';
          const requerimientoMap: any = {
            '001': 'MP',
            '002': 'MC',
            '003': 'ME'
          };

          ticket.tRequerTag = requerimientoMap[ticket.tipoRequerimiento] || '';
          ticket.idRequerimientoPad = `#${ticket.tRequerTag}-${ticket.idTicket.toString().padStart(9, '0')}`;

          const espacioSirveMap: any = {
            'BOB': 'BÓBEDA',
            'BOD': 'BÓBEDA',
            'CAJ': 'CAJA'
          };

          ticket.espacioSirveNombre = espacioSirveMap[ticket.espacioSirve] || 'DESCONOCIDO';
          const estadoMap: any = {
            '1': { color: '#B8DEF6', significado: 'Enviado pero no leído aún.' },
            '2': { color: '#FFECA1', significado: 'Requerimiento asignado.' },
            '3': { color: '#65ecc3', significado: 'En proceso.' },
            '4': { color: '#bbbbbb', significado: 'Ticket cerrado.' },
            '5': { color: '#F4E900', significado: 'En solución pero en espera de repuestos.' }
          };

          const estadoInfo: any = estadoMap[ticket.estado];
          ticket.colorEstado = estadoInfo?.color || '#FFFFFF';
          ticket.estadoSignificado = estadoInfo?.significado || 'Estado desconocido.';

        });

        this.cont++;
        if (this.cont > 2) {
          this.nticketEmitido = this.listenTagTicket;
        }

      }, error: (error) => {
        this._show_spinner = false;
        if (error.status === 404) {
          this.listaTickets       = [];
          this.listaTicketsGhost  = [];
          return;
        }

        // Para otros errores, mostrar en consola pero no lanzar excepción
        console.error('Error al obtener tickets:', error);
        this.listaTickets = [];
        this.listaTicketsGhost = [];
      }, complete: () => {
        if (this.isIsolated && this.idTicketEmit) {
          const stillExists = this.listaTicketsGhost.find((x: any) => x.idTicket == this.idTicketEmit);
          if (stillExists) {
             this.expandirTicketLocally(this.idTicketEmit);
          } else {
             this.isIsolated = false;
             this.updatePagination();
          }
        } else if (this.listenTagTicket && !this.isIsolated) {
          this.listaTickets.forEach((x: any) => {
            x.collapseShow = 'accordion-collapse collapse';
            if ('#' + this.listenTagTicket == x.idRequerimientoPad) x.collapseShow = 'accordion-collapse collapse show';
          });
          this.updatePagination();
        } else {
          this.updatePagination();
        }

        this.codCliToPanelCliente.emit(this.listenCodCli);
        this._show_spinner = false;
      }

    });

  }

  updateTimeMantenimientoTecnico(model: any) {
    // alert( 'Tiempo del tecnico recibido para actualizar' )
    console.warn(model);
    this.listaAlertaMantenimientosHoras.push(model);
    this.playAudio();
  }

  eliminarAlertaMantenimiento(index: number) {
    this.listaAlertaMantenimientosHoras.splice(index, 1);
  }

  connectSignalR() {

    this._tiempoMantenimiento.start().then().catch( e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DEL TIEMPO DE MANTENIMIENTO DEL TECNICO:', e);
    });

    this.estadoTickets.start().then().catch( e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DEL ESTADO DEL TICKET:', e);
    });

    this.ticketsSendAlertData.start().then().catch( e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DE LA ALERTA DEL TICKET:', e)
    });

    this.mensajesHub.start().then().catch( e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DEL MENSAJE DEL TICKET:', e);
    });

    this.tecnicoEnviado.start().then().catch(e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DEL TECNICO ASIGNADO:', e);
    });

    this.cantFileHub.start().then().catch( e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DE LA CANTIFILEHUB ASIGNADO:', e);
    });

    this.eliminaTecinoSignal.start().then(() => {
    }).catch(e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DE ELIMINAR TECNICO:', e);
    })

    this.eliminarFileSignal.start().then(() => {
    }).catch(e => console.error('ALGO HA PASADO CON LA TRANSMISION DE ELIMINAR ARCHIVO:', e));

  }

  constructor(
    public dialog: MatDialog,
    private helpdeskserv: TablaHelpDeskService,
    private mensajeria: MensajeriaTicketService,
    private ncrypt: EncryptService,
    private env: Environments,
    private fileControlServ: ImagecontrolService,
    private form: FormularioRegistroProblemasService,
    private estadoTick: FechasRealesService ) {
    
    this.urlHub = this.env.apiHelpDeskSytemh;
    this.urlHubK = this.env.apiUrlHub();

    this._tiempoMantenimiento = new HubConnectionBuilder().withUrl(this.urlHub + 'hubs/TiempoMantenimiento').build();
    this._tiempoMantenimiento.on("SendHoraMantenimientoHub", (model: any) => {
      this.updateTimeMantenimientoTecnico(model);
    })

    this.estadoTickets = new HubConnectionBuilder().withUrl(this.urlHub + 'hubs/estadoTickets').build();
    this.estadoTickets.on("SendTicketRequerimiento", (message: any) => {
      this.ticketRequer(message);
    });

    this.tecnicoEnviado = new HubConnectionBuilder().withUrl(this.urlHub + 'hubs/SendTecnicoAsignado').build();
    this.tecnicoEnviado.on("SendTecnicosHubAsign", (message: any) => {
      this.tecnicoRecibidoTunelHub(message);
    });

    this.mensajesHub = new HubConnectionBuilder().withUrl(this.urlHubK + 'msjHub').build();
    this.mensajesHub.on("SendMessageHub", (message: any, respuesta: any[]) => {
      this.msjTicketSend(message, respuesta);
    });

    this.ticketsSendAlertData = new HubConnectionBuilder().withUrl(this.urlHub + 'hubs/SendTicketRequerimientoHub').build();
    this.ticketsSendAlertData.on("SendTicketRequerimientoAlertHub", (message: any) => {
      this.ticketsAlertSend(message);
    })

    this.cantFileHub = new HubConnectionBuilder().withUrl(this.urlHub + 'hubs/SendfileAlertHubTunel').build();
    this.cantFileHub.on("ReceiveFileAlert", (message: any) => {
      this.fileSendHub(message);
    })

    this.eliminaTecinoSignal = new HubConnectionBuilder()
      // La URL del hub debe coincidir con la definida en Program.cs
      .withUrl(this.urlHub + 'hubs/EliminarTecnicoSignalRequer')
      .build();

    this.eliminaTecinoSignal
      // El nombre del método debe coincidir con el método de SignalR en el backend
      .on("EliminacionTecnicoSignal", (tecnico) => {
        this.eliminarTecinoSignal(tecnico);
      });

    this.eliminarFileSignal = new HubConnectionBuilder()
      // La URL del hub debe coincidir con la definida en Program.cs
      .withUrl(this.urlHub + 'hubs/EliminarArchivoRequer')
      .build();

    this.eliminarFileSignal
      // El nombre del método debe coincidir con el método de SignalR en el backend
      .on("FileDeleteSignalHub", (tecnico) => {
        this.eliminarFileSignalHub(tecnico);
      });

  }

  eliminarFileSignalHub(data: any) {
    this.listaTickets.forEach((ticket: any) => {
      if (ticket.idTicket === data.idTicket) {
        if (data.tipo == 'REPTEC') {
          ticket.fileRepTec = ticket.fileRepTec - 1;
          if (ticket.fileRepTec < 0) ticket.fileRepTec = 0;
        }
        if (data.tipo == 'COTIZA') {
          ticket.fileCotiza = ticket.fileCotiza - 1;
          if (ticket.fileCotiza < 0) ticket.fileCotiza = 0;
        }
        if (data.tipo == 'NOTENT') {
          ticket.fileNotEnt = ticket.fileNotEnt - 1;
          if (ticket.fileNotEnt < 0) ticket.fileNotEnt = 0;
        }
      }
    });
  }

  eliminarTecinoSignal(data: any) {
    this.listaTickets.forEach((ticket: any) => {
      if (ticket.idTicket === data.idTIcket) {
        ticket.tecnicos = ticket.tecnicos.filter((tec: any) => tec.coduser !== data.idTecnico);
      }
    });
  }

  fileSendHub(data: any) {
    this.listaTickets.forEach((x: any) => {
      if (x.idTicket == data.idTicket) {
        x.fileRepTec = x.fileRepTec + data.ffileRepTec;
        x.fileCotiza = x.fileCotiza + data.fileCotiza;
        x.fileNotEnt = x.fileNotEnt + data.fileNotEnt;
      }
    })
  }

  tecnicoRecibidoTunelHub(data: any) {
    this.listaTickets.filter((x: any) => {
      if (x.idTicket == data.idTicket) {
        x.tecnicos.unshift(data);
      }
    });
  }

  //#region ELIMINAR TICKET
  deleteRequer(idRequer: number) {
    Swal.fire({
      title: "Estás seguro?",
      text: "Esta acción es irreversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, elimar requerimiento!"
    }).then((result) => {
      if (result.isConfirmed) {
        this.helpdeskserv.eliminarTicketsProceso(idRequer).subscribe({
          next: (x) => {
            Swal.fire({
              title: "Eliminado!",
              text: "requerimiento ha sido eliminado.",
              icon: "success"
            });
          }, error: (e) => {
            console.error(e);
            Toast.fire({
              text: "No hemos podido eliminar este requerimiento.",
              icon: "error"
            });
          }, complete: () => {
             const indexLista = this.listaTickets.findIndex((t: any) => t.idTicket === idRequer);
             if(indexLista !== -1) {
               this.listaTickets.splice(indexLista, 1);
             }
             const indexGhost = this.listaTicketsGhost.findIndex((t: any) => t.idTicket === idRequer);
             if(indexGhost !== -1) {
               this.listaTicketsGhost.splice(indexGhost, 1);
             }
             this.updatePagination();
          }
        })
      }
    });
  }
  //#endregion

  //#region  PAGINACION
  // Método para actualizar la paginación
  updatePagination() {
    this.totalItems = this.listaTickets.length;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedTickets = this.listaTickets.slice(startIndex, endIndex);
    console.log('this.paginatedTickets');
    console.log(this.paginatedTickets);
  }

  // Cambiar página
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  // Obtener números de páginas para mostrar
  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 1) return [1];

    const delta = 2; // Cuántas páginas mostrar a cada lado de la actual
    const range = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      range.unshift(-1); // -1 representa los puntos suspensivos
    }
    if (current + delta < total - 1) {
      range.push(-1);
    }

    range.unshift(1);
    if (total > 1) range.push(total);

    return range;
  }

  // Obtener total de páginas
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }
  //#endregion

  openDataEstadosTicketsInformation(data: any) {
    const dialogRef = this.dialog.open(ModalEstadoColorComponent, {
      height: '500px',
      width: '280px',
      data: data
    });
    dialogRef.afterClosed().subscribe((result: any) => { });
  }

  openDataEquiposDialog(data: any) {
    const dialogRef = this.dialog.open(ModalPreviewComponent, {
      height: '100%',
      width: 'auto',
      data: data
    });
    dialogRef.afterClosed().subscribe((result: any) => { });
  }

  openDataRepuestosDialog(idTicket: number, type: string) {
    const dialogRef = this.dialog.open(ModalCotizacionComponent, {
      height: '95%',
      width: '70%',
      data: { idRequerimiento: idTicket, type: type }
    });
    dialogRef.afterClosed().subscribe((result: any) => { });
  }

  getDataCotizaFileMedia = (event: any) => this.getFileMediaListen = event;

  getDataCotizaRepuRequer = (event: any) => this.getDataCotizaRepuRequer = event;

  _expand_messenger() {
    if (this.toggle_maxim) {
      this.toggle_maxim = false;
      this.widthMessenger = '40%'
    } else {
      this.toggle_maxim = true;
      this.widthMessenger = '100%'
    }
  }

  getAppSearch(codec: string, data: any) {
    if (codec == '001') {
      this._show_order_work = false;
      this._show_fecha_real = false;
      this._show_resumen_mantenimiento = true;
      this.modelSendRequer = data;
      this._show_file_media_ticket = false;
      this.showImg = false;
    } else if (codec == '002') {
      this._show_order_work = false;
      this._show_fecha_real = false;
      this._show_resumen_mantenimiento = false;
      this.modelSendRequer = data;
      this._show_file_media_ticket = false;
      this.showImg = false;
    } else if (codec == '003') {
      this._show_order_work = false;
      this._show_fecha_real = false;
      this.modelSendRequer = data;
      this._show_resumen_mantenimiento = false;
      this._show_file_media_ticket = true;
      this.showImg = false;
    } else if (codec == '004') {
      this._show_order_work = false;
      this._show_fecha_real = true;
      this.modelSendRequer = data;
      this._show_resumen_mantenimiento = false;
      this._show_file_media_ticket = false;
      this.showImg = false;
    } else if (codec == '000') {
      this._show_fecha_real = false;
      this._show_resumen_mantenimiento = false;
      this._show_order_work = true;
      this.showImg = true;
      this.modelSendRequer = data;
      this._show_file_media_ticket = false;
    }
  }

  getStatusFReal(event: any) {
    if (event) this.getAppSearch('000', null);
  }

  subscribeToPushNotifications() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.env.VAPID_PUBLIC_KEY)
        }
        ).then().catch((error) => {
          console.error('Failed to subscribe to push notifications:', error);
        });
      });
    }
  }

  // Método para convertir la clave VAPID a Uint8Array
  urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Solicitar permisos de notificación al usuario
  requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          // // console.log('Permiso para notificaciones concedido.');
        }
      });
    }
  }

  ticketsAlertSend(message: any) {
    this.listaTicketPendientes.unshift(message);
    this.listaTicketPendientes = this.listaTicketPendientes.filter((m: any) => {
      m.codRequerimiento = m.idRequerimiento.toString().padStart(9, '0')
    })
    if ('Notification' in window && Notification.permission === 'granted') {
      this.showNotification(message);
    }
  }

  irTransmitirTicket = (data: any) => this.ticketAlertEmit.emit(data);

  // Método para mostrar notificaciones
  showNotification(data: any) {

    const options = {
      body: `Tipo: ${data.tipo}\nEstado: ${data.estado}\nMáquina: ${data.codMaquina}\nProblema: ${data.mensaje}`,
      icon: 'assets/icono-notificacion.png',  // Ruta a un ícono para la notificación
      data: { id: data.idRequerimiento } // Opcional, puedes pasar datos adicionales
    };

    // Enviar la notificación
    const notification = new Notification('Nuevo Ticket', options);
    notification.onclick = (event) => {
      event.preventDefault();
      window.open(`/tickets/${data.idRequerimiento}`, '_blank');
    };

  }

  msjTicketSend(message: any, respuesta: any) {
    this.listaTickets.filter((x: any) => {
      if (x.idRequerimiento == respuesta.idRequerimiento) {
        x.cantidadMensajes = x.cantidadMensajes + 1;
      }
    })
    this.listaTicketsNoLeidos.filter((x: any) => {
      if (x.idRequerimiento == respuesta.idRequerimiento) {
        x.cantidadTotalMensajes = x.cantidadTotalMensajes + 1;
        x.cantidad = x.cantidad + 1;
      }
    })
  }

  formatearTiempo(tiempoString: string): string {
    if (!tiempoString) return '0s';

    const partes = tiempoString.split(' ');
    let minutos = 0;
    let segundos = 0;

    partes.forEach(parte => {
      if (parte.includes('m')) {
        minutos = parseInt(parte.replace('m', ''), 10);
      } else if (parte.includes('s')) {
        segundos = parseInt(parte.replace('s', ''), 10);
      }
    });

    const totalSegundos = minutos * 60 + segundos;
    const dias = Math.floor(totalSegundos / (3600 * 24));
    const horas = Math.floor((totalSegundos % (3600 * 24)) / 3600);
    const mins = Math.floor((totalSegundos % 3600) / 60);
    const segs = totalSegundos % 60;

    const resultado = [];
    if (dias > 0) resultado.push(`${dias}d`);
    if (horas > 0) resultado.push(`${horas}h`);
    if (mins > 0) resultado.push(`${mins}m`);
    if (segs > 0 || resultado.length === 0) resultado.push(`${segs}s`);

    return resultado.join(' ');
  }


  getNewMantenimiento(event: any) {
    if (event) this.mantenimientosAgregados = event;
  }


  getTecnicosMantenimiento(event: any) {
    if (event) {
      this.listaTecnicosRecibidos = event;
      // console.log('lista', event, this.listaTecnicosRecibidos);
    }
  }


  getRepuestosMantenimiento(event: any) {
    if (event) {
      this.listaRepuestosRecibidos = event;
      console.warn("Lista original con posibles duplicados:", this.listaRepuestosRecibidos);

      if (this.listaRepuestosRecibidos.length > 0) {

        // --- VALIDACIÓN PARA ELIMINAR DUPLICADOS ---
        // Se utiliza 'codrep' como identificador único para cada repuesto.
        const repuestosUnicos = this.listaRepuestosRecibidos.filter((repuesto: any, index: any, self: any) =>
          index === self.findIndex((r: any) => (
            r.codrep === repuesto.codrep
          ))
        );

        // Se actualiza la lista original con los repuestos sin duplicados.
        this.listaRepuestosRecibidos = repuestosUnicos;
        console.warn("Lista final sin duplicados:", this.listaRepuestosRecibidos);
        // --- FIN DE LA VALIDACIÓN ---

        Swal.fire({
          title: "¡Cotización generada!",
          text: "Ahora puedes descargarla en la interfaz de la cotización.",
          footer: "Este menú lo puedes encontrar en la vista general de la orden de trabajo.",
          icon: "warning"
        });
      }
    }
  }

  guardarIntervaloTicketsRespuestas(type: any, time: any) {

    setTimeout(() => {
      this._show_spinner = true;
    });
    const xcli: any = sessionStorage.getItem('codcli');
    const xreq: any = localStorage.getItem('idRequerimientoShow');
    this.intervaloModel = {
      mintime: time,
      fecrea: new Date(),
      usercrea: xcli,
      tipo: type,
      idRequerimiento: xreq
    }

    this.mensajeria.guardarIntervalo(this.intervaloModel).subscribe({
      next: (x) => { },
      error: (e) => {
        this._show_spinner = false;
        console.error(e);
      }, complete: () => {
        this._show_spinner = false;
      }
    })
  }

  showPermissionsEmit() {
    this.showFormPermission.emit(true);
  }

  tecnicoListen(data: any) {
    console.table("TECNICO ENVIADO ");
    console.table(data);
  }



  ticketRequer(data: any) {

    this.playAudio();
    this.listaTickets.filter((j: any) => {
      if (j.idTicket == data.idTicket) {
        j.estado = data.estado;
        if (j.estado == 2) {
          j.colorEstado = '#FFECA1';
          j.estadoSignificado = 'Requerimiento, asignado..';
        }
        if (j.estado == 3) {
          j.colorEstado = '#65ecc3';
          j.estadoSignificado = 'En proceso.';
        }
        if (j.estado == 4) {
          j.colorEstado = '#bbbbbb';
          j.estadoSignificado = 'Ticket cerrado.';
        }
        j.tiempoTotalExactoMinutos = data.tiempoTotalExactoMinutos;
      };
    })
  }

  inicializadorHubs() {
    this.estadoTickets.start().then().catch(e => {
      console.error('ALGO HA PASADO CON LA TRANSMISION DEL ESTADO DEL TICKET:', e);
    })
  }



  datosEnviarResumenMantenimientoController: any;
  obtenerDatos(event: any) {
    if (event) {
      this.datosEnviarResumenMantenimientoController = event;
      console.warn('DATOS RECIBIDOS DESDE EL RESUMEN DE MANTENIMIENTO AL PADRE');
      console.warn(this.datosEnviarResumenMantenimientoController);
    }
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

      if (this.role == 'R004' || this.role == 'R002') {
        this.obtenerTicketsRequerimientos(this.xcodcli);
      }

      this.actionMenuTicket.filter((x: any) => {
        if (this.role == 'R004') {
          if (x.codec == "003") {
            x.permison = true;
          }
          else if (x.codec == '000') {
            x.permison = true;
          }
          else {
            x.permison = false;
          }
        }
        else if (this.role == 'R003') {
          x.permison = true;
        } else if (this.role == 'R002') {
          if (x.codec == "003") {
            x.permison = true;
          } else if (x.codec == '000') {
            x.permison = true;
          }
          else {
            x.permison = false;
          }
        } else if (this.role == 'R001') {
          if (x.codec == "000") {
            x.permison = true;
          }
          else if (x.codec == '004') {
            x.permison = true;
          }
          else {
            x.permison = false;
          }
        }
      })


      if (this.role == 'R004') {
        this._cli_view = false;
        this.actionButton = true;
        this.icon_action = 'preview';
      }
      if (this.role == 'R003') {
        this._cli_view = true;
        this.actionButton = false;
        this.icon_action = 'message';
      }
      if (this.role == 'R001') {
        this._cli_view = true;
        this.actionButton = false;
        this.icon_action = 'message';
      }

    }
  }


  sendIdTicket(idTicket: number) {

    if (idTicket > 0) {

      this.idTicketEmit = idTicket;
      localStorage.setItem('idRequerimientoShow', idTicket.toString());
      // Reset default view
      this._show_order_work             = true;
      this._show_fecha_real             = false;
      this._show_resumen_mantenimiento  = false;
      this._show_file_media_ticket      = false;
      this.showImg                      = true;

      // Isolate the ticket to only show this one
      const ticketEncontrado = this.listaTicketsGhost.find((x: any) => x.idTicket == idTicket);
      if (ticketEncontrado) {
        this.listaTickets = [ticketEncontrado];
        this.listaTickets[0].collapseShow = 'accordion-collapse collapse show';
        this.isIsolated = true;
        this.currentPage = 1;
        this.updatePagination();
      }

    }

  }

  obetenerModeloCliente(event: any) {
    if (this.autoTriggeredClientLoad) {
      this.autoTriggeredClientLoad = false;
    } else {
      this.isIsolated = false;
    }
    setTimeout(() => {
      this.modelCliente = event;
    });
    this.obtenerTicketsRequerimientos(event.codcliente);
  }

  obtenerCantMensajes(event: any) {

    this.listaTickets.filter((x: any) => {
      if (x.idRequerimiento == event.idRequerimiento) x.cantidadMensajes = x.cantidadMensajes - 1;
    })

    this.listaTicketsNoLeidos.filter((x: any) => {
      if (x.idRequerimiento == event.idRequerimiento) x.cantidad = x.cantidad - 1;
    })

  }

  catchData(data: any) {

    this.modelDataSend = {
      idRequerimiento:    data.idRequerimiento,
      idAgencia:          data.idagencia,
      urlA:               data.urlA,
      urlB:               data.urlB,
      estado:             data.estado,
      mensajeDelProblema: data.mensajeDelProblema,
      obervacion:         data.obervacion,
      codMaquina:         data.codMaquina,
      fechacrea:          data.fechacrea,
      tipo:               data.tipo
    }

    this.dataUpdateTicketEmit.emit(this.modelDataSend);

  }

  obtenerDataFilter(event: any) {
    
    this.listaTickets = this.listaTicketsGhost.filter( (item: any) =>
      item.idRequerimientoPad.toString().toLowerCase().includes(event.toLowerCase()) ||
      item.idTicket.toString().toLowerCase().includes(event.toLowerCase()) ||
      item.nombreAgencia.toString().toLowerCase().includes(event.toLowerCase()) ||
      item.descripcionProblema.toString().toLowerCase().includes(event.toLowerCase())
    );

    // Resetear a primera página y actualizar paginación
    this.currentPage = 1;
    this.updatePagination();

  }

  obtenerCantMensajesUpdate(event: any) {

    this.listaTicketsNoLeidos.filter((x: any) => {
      if (x.idRequerimiento == event) x.cantidad = 0;
    });
    
  }

  actualizarSoloEstadoTicket(id: number, estado: number, ticket: any) {
    this.estadoTick.actualizarFechaReal(id, estado, ticket).subscribe({
      next: (x) => {
        this._show_spinner = false;
      },
      error: (e) => {
        this._show_spinner = false;
      }, complete: () => { }
    });
  }

  actualizarEstado(id: number, estado: number, idTicket: string, ticket: any) {

    localStorage.setItem('idRequerimientoShow', id.toString());
    this.activeTicketId = id;
    this.ticketSend = ticket;
    this.numberTicket = idTicket;
    if (ticket.estado == 1) {
      if (this.role == 'R003') {
        this.helpdeskserv.updateTicketsEstado(id, estado).subscribe({
          next: (x) => { },
          error: (e) => {
            Toast.fire({
              icon: "error",
              title: "Algo ha ocurrido, al cambiar el estado del ticket"
            });
          }
        })
      }
    }

  }

  obtenerTicketAlert(event: any) { }

  truncarTexto = (requerimiento: any, limite: number): string => {
    let texto = requerimiento.nombreAgencia + ' (' + requerimiento.nombreProvincia + ')';
    return texto.length > limite ? texto.substring(0, limite) + '...' : texto;
  }

  getFileMedia = async (idTicket: any, type: any) => {
    let typeFile: any = '';
    let listaDocumentos: any = [];
    this.fileControlServ.obtenerFileMediaTicket(idTicket, type).subscribe({
      next: (x) => listaDocumentos = x,
      error: (e) => console.error(e),
      complete: async () => {
        // console.log(listaDocumentos);
        if (listaDocumentos.length > 0) {
          if (type === 'REPTEC') typeFile = 'ReporteTecnico';
          if (type === 'COTIZA') typeFile = 'Cotizaciones';
          if (type === 'NOTENT') typeFile = 'Nota de Entrega';

          // Filtramos los archivos a descargar según rol y cantidad de elementos
          const filesToDownload =
            (this.role === 'R002' && type === 'COTIZA' && listaDocumentos.length > 1)
              ? listaDocumentos.slice(1)  // Ignora el primer elemento si hay más de 1
              : listaDocumentos;          // Descarga todos en otros casos

          for (let file of filesToDownload) {
            await this.descargarArchivoMediaRTecnico(file.fileUrl, typeFile);
          }
        }
      }
    });
  };

  descargarArchivoMediaRTecnico = async (nombreArchivo: any, type: any) => {
    let idReq = nombreArchivo.split('-')[0] + '-' + nombreArchivo.split('-')[1];
    this.fileControlServ.descargarArchivoMediaRTecnico(idReq, nombreArchivo, type).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        Toast.fire({
          title: 'Archivos descargados',
          icon: "success"
        });
      },
      error: (e) => {
        Toast.fire({
          title: nombreArchivo + ', problemas con la descarga.',
          icon: "error"
        });
      }
    });
  }
}
