import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ClientesHelpDeskService } from './services/clientes-help-desk.service';
import { Environments } from 'src/app/environments/environments';
import { FormControl, FormGroup } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { ModalCrearTicketComponent } from './modal-crear-ticket/modal-crear-ticket.component';
import { jwtDecode } from "jwt-decode";
import { EncryptService } from '../../shared/services/encrypt.service';

import Swal from 'sweetalert2';
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
})

@Component({
  selector: 'app-clientes-help-desk',
  templateUrl: './clientes-help-desk.component.html',
  styleUrls: ['./clientes-help-desk.component.scss']
})
export class ClientesHelpDeskComponent implements OnInit, OnChanges {

  listaClientes: any = [];
  listaClientesGhost: any = [];
  selectedCliente: any = null;

  @Input() codCliTikenAlert: any;
  @Output() codcli: EventEmitter<any[]> = new EventEmitter<any[]>();

  @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger!: MatMenuTrigger;
  menuTopLeftPosition = { x: '0', y: '0' }

  constructor(private clihelp: ClientesHelpDeskService,
    private env: Environments,
    public dialog: MatDialog,
    private ncrypt: EncryptService) { }

  ngOnInit(): void {
    this.obtenerClientes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['codCliTikenAlert'] && this.codCliTikenAlert) {
      // Buscar el cliente en la lista
      const cliente = this.listaClientes.find((x: any) =>
        this.codCliTikenAlert == x.codcliente
      );

      if (cliente) {
        this.emitCliStyle(cliente);
        this.emitCli(cliente);
      } else {
        // Si no se encuentra, intentar después de obtener clientes
        setTimeout(() => {
          const clienteEncontrado = this.listaClientes.find((x: any) =>
            this.codCliTikenAlert == x.codcliente
          );
          if (clienteEncontrado) {
            this.emitCliStyle(clienteEncontrado);
            this.emitCli(clienteEncontrado);
          }
        }, 500);
      }
    }
  }

  public filterForm = new FormGroup({
    filterCli: new FormControl('')
  })

  emitCliStyle(clientes: any) {
    this.selectedCliente = clientes;
  }

  obtenerClientes() {
    this.clihelp.obtenerClientes(this.env.codcia, 1).subscribe({
      next: (x) => {
        this.listaClientes = x;
        this.listaClientesGhost = x;
      }, error: (e) => {
        console.error('Error al obtener clientes:', e);
      }
    })
  }

  emitCli(model: any) {
    if (model.cantidadRequerimientos == 0) {

      Swal.fire({
        title: "Sin datos!",
        text: "Este cliente no tiene tickets.",
        icon: "info"
      });

      return;
    }
    this.codcli.emit(model);
    localStorage.setItem('id-cliente-escogido', model.codcliente);
    localStorage.setItem('nombre-cliente-escogido', model.nombre);
    localStorage.setItem('imagen-cli', model.imagen);
  }

  filterCliente() {
    let filter: any = this.filterForm.controls['filterCli'].value;
    this.listaClientes = this.listaClientesGhost.filter((item: any) =>
      item.nombre.toLowerCase().includes(filter.toLowerCase())
    );
  }

  onRightClick(event: MouseEvent, item: any) {
    // preventDefault avoids the browser's default context menu 
    event.preventDefault();
    this.menuTopLeftPosition.x = event.clientX + 'px';
    this.menuTopLeftPosition.y = event.clientY + 'px';
    this.matMenuTrigger.menuData = { item: item }
    this.matMenuTrigger.openMenu();
  }

  role: any;
  getToken() {
    let xtoken: any = sessionStorage.getItem('token');
    const xtokenDecript: any = this.ncrypt.decryptWithAsciiSeed(xtoken, this.env.es, this.env.hash);
    if (xtokenDecript != null || xtokenDecript != undefined) {
      var decoded: any = jwtDecode(xtokenDecript);
      this.role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    }
  }

  openModalCreateTicket(cliente: any) {
    this.getToken();

    // Validar ROL: Solo Administrador puede crear tickets desde aquí
    if (this.role !== 'R003') {
      Swal.fire({
        title: "Acceso denegado",
        text: "Solo el administrador puede crear tickets desde esta opción.",
        icon: "warning"
      });
      return;
    }

    const dialogRef = this.dialog.open(ModalCrearTicketComponent, {
      width: '90%',
      height: '90%',
      data: {
        codCliente: cliente.codcliente,
        nombreCliente: cliente.nombre
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result) {
        // Ticket creado exitosamente, tal vez refrescar algo si es necesario
        // Pero como el output GetTickets ya maneja la lógica en el componente hijo,
        // aquí solo cerramos.
      }

    });
  }
}