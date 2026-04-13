import { Component, ElementRef, EventEmitter, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Environments } from 'src/app/environments/environments';
import { FormularioRegistroProblemasService } from '../formulario-registro-problemas/services/formulario-registro-problemas.service';

@Component({
  selector: 'app-tickets-listen',
  templateUrl: './tickets-listen.component.html',
  styleUrls: ['./tickets-listen.component.scss']
})
export class TicketsListenComponent implements OnInit, OnChanges {

  @ViewChild('audioPlayer') audioPlayer!: ElementRef;
  @Output() cantTicketEmit: EventEmitter<any> = new EventEmitter();
  @Output() codcli: EventEmitter<any> = new EventEmitter();
  @Output() codTicketEmit: EventEmitter<any> = new EventEmitter();
  _show_spinner: boolean = false;
  private urlHub: any = this.env.apiHelpDeskSytemh;
  private estadoTickets: HubConnection;
  listTicketsCreados: any = [];
  listTicketsCreadosGhost: any = [];
  cantidadTickets: number = 0;


  states: any = [
    { id: 1, color: '#B8DEF6', title: 'Enviado pero no leído aún.' },
    { id: 2, color: '#FFECA1', title: 'Requerimiento asignado.' },
    { id: 3, color: '#65ecc3', title: 'En proceso.' },
    { id: 4, color: '#bbbbbb', title: 'Ticket cerrado.' },
  ];

  constructor(private form: FormularioRegistroProblemasService, private env: Environments) {

    this.estadoTickets = new HubConnectionBuilder()
      .withUrl(this.urlHub + 'hubs/estadoTickets')
      .build();
    this.estadoTickets.on("SendTicketRequerimiento", (message: any) => {
      this.ticketRequer(message);
    });

  }

  ngOnInit(): void {
    this.connectSignalR();
    this.obtenerTicketsAlert();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      /** EJECUTAR CUALQUIER COSA QUE SE NECESITE =/ */
    }
  }

  ticketRequer(data: any) {

    this.playAudio();
    console.warn('Nuevo ticket recibido via SignalR: ');
    console.warn(data);
    // Buscar si el ticket ya existe
    let ticketExistente = this.listTicketsCreados.find((x: any) => x.idTicket == data.id || x.idTicket == data.idTicket);

    console.warn('//////////////////////////////////////////////////')
    console.warn('//////////////////////////////////////////////////')
    console.warn('ticketExistente (1): ')
    console.warn(this.listTicketsCreados)
    console.warn(ticketExistente)
    console.warn('//////////////////////////////////////////////////')
    console.warn('//////////////////////////////////////////////////')

    // if ( ticketExistente == undefined ) ticketExistente = this.listTicketsCreados.find((x: any) => x.idTicket == data.idTicket);

    // console.warn('ticketExistente (2): ')
    // console.warn(ticketExistente)

    if (ticketExistente) {
      // console.warn('Ticket encontrado, actualizando estado...');
      // console.warn(ticketExistente);
      ticketExistente.estado = data.estado; // Actualiza solo el estado

      // Opcional: Actualizar propiedades derivadas (colorEstado, estadoSignificado, etc.)
      const estadoMap: any = {
        '1': { color: '#B8DEF6', significado: 'Enviado pero no leído aún.' },
        '2': { color: '#FFECA1', significado: 'Requerimiento asignado.' },
        '3': { color: '#65ecc3', significado: 'En proceso.' },
        '4': { color: '#bbbbbb', significado: 'Ticket cerrado.' },
        '5': { color: '#F4E900', significado: 'En solución pero en espera de repuestos.' }
      };

      const estadoInfo = estadoMap[data.estado];
      ticketExistente.colorEstado = estadoInfo?.color || '#FFFFFF';
      ticketExistente.estadoSignificado = estadoInfo?.significado || 'Estado desconocido.';
      return;
    }

    // alert('Nuevo ticket recibido');
    // console.warn('Nuevo ticket, agregándolo a la lista...');
    // console.warn(data);
    this.listTicketsCreados.unshift(data); // Agrega el nuevo ticket
    this.cantidadTickets = this.listTicketsCreados.length;
    this.cantTicketEmit.emit(this.cantidadTickets);

    // Procesar propiedades para el nuevo ticket
    this.listTicketsCreados.forEach((x: any) => {
      x.idTicket = x.id;
      x.codcliente = x.codcli;
      x.tRequerTag = x.tipo;
      x.idPadStart = x.tipo + '-' + x.id.toString().padStart(9, '0');

      if (x.estado == 4) x.msjCerrado = 'Cerrado', x.matIcon = 'folder', x.colorFg = 'orangered';
      else x.msjCerrado = 'Atendiendose..', x.matIcon = 'description', x.colorFg = 'green';
      const estadoMap: any = {
        '1': { color: '#B8DEF6', significado: 'Enviado pero no leído aún.' },
        '2': { color: '#FFECA1', significado: 'Requerimiento asignado.' },
        '3': { color: '#65ecc3', significado: 'En proceso.' },
        '4': { color: '#bbbbbb', significado: 'Ticket cerrado.' },
        '5': { color: '#F4E900', significado: 'En solución pero en espera de repuestos.' }
      };

      const estadoInfo = estadoMap[x.estado];
      x.colorEstado = estadoInfo?.color || '#FFFFFF';
      x.estadoSignificado = estadoInfo?.significado || 'Estado desconocido.';

    });

  }

  emitirCodCli(ccli: any) {
    console.warn(ccli)
    let x = localStorage.getItem('idRequerimientoShow');
    if (x != undefined || x != null) {
      localStorage.removeItem('idRequerimientoShow');
      localStorage.removeItem('imagen-cli');
      localStorage.removeItem('id-cliente-escogido');
      localStorage.removeItem('nombre-cliente-escogido');
    }
    setTimeout(() => {
      localStorage.setItem('idRequerimientoShow', ccli.idTicket);
      this.codcli.emit(ccli.codcliente);
      this.codTicketEmit.emit(ccli.idPadStart);
    }, 1000);
  }



  playAudio() {
    this.audioPlayer.nativeElement.play();
  }

  connectSignalR() {
    this.estadoTickets.start()
      .then(() => {// console.log('CONECTAD@ DESDE TICKET LISTEN COMPONENT!'))
      })
      .catch(e => console.error('ALGO HA PASADO CON LA TRANSMISION DEL ESTADO DEL TICKET:' + e))
  }

  // Función para truncar el texto a 15 caracteres
  truncateText(text: string, maxLength: number = 15): string {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...'; // Corta el texto y agrega "..."
    }
    return text; // Devuelve el texto original si no supera la longitud máxima
  }

  filterTicketAlert(event: any) {
    const filterValue = event.target.value.toLowerCase();
    this.listTicketsCreados = this.listTicketsCreadosGhost.filter((y: any) => {
      return y.nombreClienteCompleto.toLowerCase().includes(filterValue) ||
        y.nombreAgenciaCompleto.toLowerCase().includes(filterValue) ||
        y.idPadStart.toLowerCase().includes(filterValue);
    });
  }

  obtenerTicketsAlert() {

    this._show_spinner = true;
    this.form.obtenerTicketsRequerimientos('---', 'CMS-001-2023', 2).subscribe({
      next: (x) => {
        this._show_spinner = false;
        this.listTicketsCreados = x;
        this.listTicketsCreadosGhost = x;
        this.listTicketsCreados.filter((ticket: any) => {

          const requerimientoMap: any = {
            '001': 'MP',
            '002': 'MC',
            '003': 'ME'
          };

          ticket.tRequerTag = requerimientoMap[ticket.tipoRequerimiento] || '';
          // Formatear ID de requerimiento
          ticket.idPadStart = `${ticket.tRequerTag}-${ticket.idTicket.toString().padStart(9, '0')}`;
          const estadoMap: any = {
            '1': {
              color: '#B8DEF6',
              significado: 'Enviado pero no leído aún.'
            },
            '2': {
              color: '#FFECA1',
              significado: 'Requerimiento asignado.'
            },
            '3': {
              color: '#65ecc3',
              significado: 'En proceso.'
            },
            '4': {
              color: '#bbbbbb',
              significado: 'Ticket cerrado.'
            },
            '5': {
              color: '#F4E900',
              significado: 'En solución pero en espera de repuestos.'
            }
          };

          if (ticket.estado == 4) ticket.msjCerrado = 'Cerrado', ticket.matIcon = 'folder', ticket.colorFg = 'orangered'
          else ticket.msjCerrado = 'Atendiendose..', ticket.matIcon = 'description', ticket.colorFg = 'green'

          const estadoInfo: any = estadoMap[ticket.estado];
          ticket.colorEstado = estadoInfo?.color || '#FFFFFF';
          ticket.estadoSignificado = estadoInfo?.significado || 'Estado desconocido.';

          // Truncar nombreCliente y nombreAgencia
          ticket.nombreClienteCompleto = ticket.nombreCliente;
          ticket.nombreAgenciaCompleto = ticket.nombreAgencia;
          ticket.nombreCliente = this.truncateText(ticket.nombreCliente);
          ticket.nombreAgencia = this.truncateText(ticket.nombreAgencia);

        });

        this.cantidadTickets = this.listTicketsCreados.length;
        this.cantTicketEmit.emit(this.cantidadTickets);

      },
      error: (e) => {
        this._show_spinner = false;
        console.error(e);
      }
    });

  }

  filterByColorState(state: number) {
    this.listTicketsCreados = this.listTicketsCreadosGhost.filter((x: any) => x.estado == state);
  }

  resetFilter() {
    this.listTicketsCreados = [...this.listTicketsCreadosGhost];
  }

}
