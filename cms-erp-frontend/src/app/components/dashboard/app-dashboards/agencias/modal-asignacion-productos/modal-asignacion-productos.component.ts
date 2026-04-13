import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AgenciasComponent } from '../agencias.component';
import { ClienteService } from '../../clientes/services/cliente.service';
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
  selector: 'app-modal-asignacion-productos',
  templateUrl: './modal-asignacion-productos.component.html',
  styleUrls: ['./modal-asignacion-productos.component.scss']
})
export class ModalAsignacionProductosComponent implements OnInit {
  pMod: number = 4;

  ccia:any;
  _show_spinner: boolean = false;
  nombreagencia:string = '';
  nombrecliente:string = '';

  searchTerm:any;
  searchTermAs:any;

  constructor(public dialogRef: MatDialogRef<AgenciasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private cli: ClienteService ) { }

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    this.nombreagencia = this.data.nombre;
    this.nombrecliente = this.data.nombreCliente;
    this.obtenerMaquinariaCliente();
    this.ccia = sessionStorage.getItem('codcia');
    this.obtenerMaquinaAsignada()
  }

  filterMaqSinAsignar() {
    if (this.searchTerm) {
      this.listaAgenciaMaquina = this.listaAgenciaMaquinaGhost.filter((maqsinas:any) =>
            maqsinas.nserie.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            maqsinas.nombremarca.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.listaAgenciaMaquina = this.listaAgenciaMaquinaGhost;
    }
  }

  filterMaqAsignar() {
    if (this.searchTermAs) {
      this.listaMaquinariaAsignada = this.listaMaquinariaAsignadaGhost.filter((maqsinas:any) =>
            maqsinas.nserie.toLowerCase().includes(this.searchTermAs.toLowerCase()) ||
            maqsinas.nombremarca.toLowerCase().includes(this.searchTermAs.toLowerCase())
      );
    } else {
      this.listaMaquinariaAsignada = this.listaMaquinariaAsignadaGhost;
    }
  }

  listaAgenciaMaquina:any = [];
  listaAgenciaMaquinaGhost:any = [];
  obtenerMaquinariaCliente() {
    this._show_spinner = true;
    this.cli.obtenerAgenciasMaquinarias(this.data.codcliente, this.data.codcia).subscribe({
      next: (agenciamaquina) => {
        this._show_spinner = false;
        this.listaAgenciaMaquina = agenciamaquina;
        this.listaAgenciaMaquinaGhost = agenciamaquina;
        console.warn('ASIGNADOS');
        console.warn(this.listaAgenciaMaquina);
      },error: (e) => {
        this._show_spinner = false;
      }, complete: () => {

      }
    })
  }

  modeloMaquinaAgencia: any = [];
  observacion: string ='';
  guardarMaquinaAgencia(codprod:string) {

    let xuser: any = sessionStorage.getItem('UserCod');

    this.modeloMaquinaAgencia = {
      "codprod": codprod,
      "codagencia": this.data.codagencia,
      "fecasign": new Date(),
      "codusercrea": xuser,
      "estado": 1,
      "observacion": this.observacion,
      "ccia": this.ccia,
    }

    // console.warn('modeloMaquinaAgencia');
    // console.warn(this.modeloMaquinaAgencia);

    this.cli.guardarMagencia(this.modeloMaquinaAgencia).subscribe({
      next:() => {
        Toast.fire({
          icon: 'success',
          title: 'Asignado'
        })
      },
      complete: () => {
        this.obtenerMaquinariaCliente();
        this.obtenerMaquinaAsignada();
      },
      error: (e) => {
        Toast.fire({
          icon: 'error',
          title: 'No se ha podido asignar'
        })
      }
    })
  }

  listaMaquinariaAsignada:any = [];
  listaMaquinariaAsignadaGhost:any = [];
  obtenerMaquinaAsignada() {
    this.cli.obtenerMaquinaAgenciaAsignada(this.data.codagencia, this.ccia ).subscribe({
      next: (maquinaAsignada) => {
        this.listaMaquinariaAsignada = maquinaAsignada;
        this.listaMaquinariaAsignadaGhost = maquinaAsignada;
        console.warn('NO ASIGNADOS');
        console.log(this.listaMaquinariaAsignada)
      }
    })
  }

  eliminarMaqAsign(codProd:string) {

    console.log(codProd)
    console.log(this.ccia)

    this.cli.eliminarMaquinaAgenciaAsignada( codProd, this.ccia ).subscribe({
      next:() => {
        this.obtenerMaquinariaCliente();
        this.obtenerMaquinaAsignada();
      },error:(e) => {
        console.error(e);
      }
    })
  }

}
