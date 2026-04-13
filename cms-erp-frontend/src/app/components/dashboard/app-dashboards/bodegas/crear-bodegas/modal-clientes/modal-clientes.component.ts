import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CrearBodegasComponent } from '../crear-bodegas.component';
import { ClienteService } from '../../../clientes/services/cliente.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { CrearBodegasService } from '../services/crear-bodegas.service';

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
  selector: 'app-modal-clientes',
  templateUrl: './modal-clientes.component.html',
  styleUrls: ['./modal-clientes.component.scss']
})
export class ModalClientesComponent implements OnInit {
  pMod: number = 4;

  ccia: any;
  _show_spinner: boolean = false;

  constructor( private cbodcli: CrearBodegasService, public dialogRef: MatDialogRef<CrearBodegasComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any, private client: ClienteService,) { }

  public dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  nombrebodega:string= '';
  _cliente_a: boolean = true;
  _cliente_b: boolean = false;

  columnHead: any = [ 'nombre', 'R.U.C.', 'match' ];

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    this.ccia = sessionStorage.getItem('codcia');
    this.obtenerCliente();
    this.nombrebodega = this.data.nombrebodega;
    switch( this.data.estado ) {
      case 1:
        this._cliente_a = true;
        this._cliente_b = false;
        break;
      case 2:
        this._cliente_a = false;
        this._cliente_b = true;
        break;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  
  listaClientes: any = [];
  obtenerCliente() {
    this._show_spinner = true;
    this.client.obtenerClientes(this.ccia,2).subscribe({
      next: (clientes) => {
        this.listaClientes = clientes;
      },
      error: (e) => {
        console.error(e);
        this._show_spinner = false;
      },
      complete: () => {
        this.dataSource = new MatTableDataSource(this.listaClientes);
        this.dataSource.paginator = this.paginator;
        this._show_spinner = false;
      }
    })
  }

  updateBodegaCliente(data:any) {
    console.log(data);
    this.cbodcli.updateProdCliBodegas( data.codcliente, this.data.id ).subscribe({
      next: (x) => {
        Swal.fire(
          'Bodega '+this.data.nombrebodega+'se asignó al cliente ' + data.nombre,
          'Ahora cuando asignes productos a cualquier agencia, lo haras de manera más ordenada y solo observarás los productos del cliente asignado',
          'success'
        )
      }
    })
  }


  sendClient(data:any) {
    this.closeDialog(data);
  }

  closeDialog(data:any) {
    this.dialogRef.close(data);
  }

}
