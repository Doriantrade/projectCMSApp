import { Component, Inject, OnInit } from '@angular/core';
import { CronoGridComponent } from '../crono-grid.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedService } from 'src/app/components/shared/services/shared.service';
import { UserService } from '../../usuario/services/user.service';
import { MantenimientoCronogramaService } from '../services/mantenimiento-cronograma.service';
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
  selector: 'app-modal-asign-maqtecnico',
  templateUrl: './modal-asign-maqtecnico.component.html',
  styleUrls: ['./modal-asign-maqtecnico.component.scss']
})

export class ModalAsignMaqtecnicoComponent implements OnInit {
  pMod: number = 4;

  _show_spinner:boolean = false;
  listaAgenciaMaquina: any = [];
  listaMaquinariaAsignada:any = [];
  searchTerm:any;
  searchTermAs:any;

  nombreTecnico:string = '';
  codtecnico:string = '';
  codcrono:any;
  constructor( public dialogRef: MatDialogRef<CronoGridComponent>,
               private us: UserService,
               private DataMaster: SharedService,
               @Inject(MAT_DIALOG_DATA) public data: any,
               private mantenimineto: MantenimientoCronogramaService ) { }

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;


    console.warn(this.data)
    const tecnico = this.data.tecnico;
    
    this.data.maquinas.filter((element:any) => {
      this.listaAgenciaMaquina.push(element);
    })

    this.nombreTecnico = tecnico.tecnico;
    this.codtecnico = tecnico.codusertecnic;
    this.codcrono = this.data.codcrono;
    this.obtenerMantenimiemnto();

  }

  guardarMantenimiento(data:any) {

    const xuser: any = sessionStorage.getItem('UserCod');
    let array: any = [];
    array = {
      codcrono: this.data.codcrono,
      codtecnico: this.codtecnico,
      feciniciomante: null,
      feccrea: new Date(),
      fecfinmant: null,
      horainit: 0,
      horafin: 0,
      usercrea: xuser,
      codprod: data.codmaquina,
      estado: 1
    }

    // console.warn( array );

    this.mantenimineto.guardarMantenimiento(array).subscribe({
      next:(x) => {
        Toast.fire({ icon: 'success', title: 'Asignación ha sido completada' })
        console.log(x);
      }, error: (e) => {
        Toast.fire({ icon: 'error', title: 'No se ha podido completar la asignación' })
        console.log(e);
      }, complete: () => {
        this.obtenerMantenimiemnto();
      }
    })

  }

  listaMaquinaMantenimiento:any = [];
  listaAgenciaMaquinaGhost: any = [];
  obtenerMantenimiemnto() {
    // this.mantenimineto.obtenerMantenimientos( this.codcrono).subscribe({
    //   next: (mantenimiento) => {
    //     this.listaMaquinaMantenimiento = mantenimiento;
    //     this.listaMaquinariaAsignada = mantenimiento;
    //     this.listaAgenciaMaquinaGhost = mantenimiento;
    //     // console.warn('listaMaquinaMantenimiento');
    //     // console.warn(this.listaMaquinaMantenimiento);
    //   }
    // })
  }

  eliminarMantenimiento( id:number ) {
    Swal.fire({
      title: 'Estás seguro?',
      text: "Esta acción es irreversible y podría provocar perdida de datos en otros procesos!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this._show_spinner = true;  
        this.mantenimineto.eliminarMantenimiento( id ).subscribe({
          next: (x) => {
            this._show_spinner = false;
            Swal.fire(
              'Deleted!',
              'Mantenimiento eliminado',
              'success'
            )
          }, error: (e) => {
            console.error(e);
            this._show_spinner = false;
            Swal.fire(
              'Upps!',
              'No hemos podido eliminar este mantenimiento',
              'error'
            )
          }, complete: () => {
            this.obtenerMantenimiemnto();
          } 
        })
      }
    })
  }

  closeDialog(data:any) {
    this.dialogRef.close(data);
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

    console.warn(this.searchTermAs);

    this.listaAgenciaMaquinaGhost = this.listaMaquinaMantenimiento.filter((elemento:any) =>
      elemento.nserie.includes(this.searchTermAs)       ||
      elemento.tipomaquina.includes(this.searchTermAs)  ||
      elemento.nombremarca.includes(this.searchTermAs)  ||
      elemento.nombremodelo.includes(this.searchTermAs)
    );
  }

}
