import { Component, OnInit } from '@angular/core';
import { CrearBodegasService } from './services/crear-bodegas.service';
import { FormControl, FormGroup } from '@angular/forms';

import { ModalClientesComponent } from './modal-clientes/modal-clientes.component';
import { MatDialog } from '@angular/material/dialog';

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
  selector: 'app-crear-bodegas',
  templateUrl: './crear-bodegas.component.html',
  styleUrls: ['./crear-bodegas.component.scss']
})
export class CrearBodegasComponent implements OnInit {
  pMod: number = 4;

  ccia: any;
  _show_spinner: boolean = false;
  _cancel_button: boolean = false;
  _icon_button:       string = 'add';
  _action_butto:      string = 'Crear';
  listBodegas: any = [];
  modelBodegas: any = []
  
  
  constructor(private bodega: CrearBodegasService, public dialog: MatDialog) { }

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    this.ccia = sessionStorage.getItem('codcia');
    this.obtenerBodegas();
  }

  public bodegaForm = new FormGroup({
    nombrebodega:        new FormControl(''),
    descripcion:         new FormControl(''),
  })

  searchTerm: string = '';
  filteredBodegas: any = [];

  // Función para filtrar las bodegas
  filterBodegas() {
    if (this.searchTerm) {
      this.filteredBodegas = this.listBodegas.filter((bodega:any) =>
        bodega.nombrebodega.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        bodega.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredBodegas = this.listBodegas;
    }
  }

  guardarBOdega() {

    let xuser: any = sessionStorage.getItem('UserCod');

    if( this.bodegaForm.controls['nombrebodega'].value == undefined || this.bodegaForm.controls['nombrebodega'].value == null || this.bodegaForm.controls['nombrebodega'].value == '' ) Toast.fire({ icon: 'warning', title: 'El campo nombre de bodega no puede estar vacío' })
    else {
    this._show_spinner = true;
    this.modelBodegas = {
      nombrebodega: this.bodegaForm.controls['nombrebodega'].value,
      descripcion:  this.bodegaForm.controls['descripcion'].value,
      fecrea: new Date(),
      codusercrea: xuser,
      ccia: this.ccia
    }

    this.bodega.guardarBodegas(this.modelBodegas).subscribe({
      next: (x) => {
        this._show_spinner = false;
        Swal.fire(
          'Bodega: '+this.bodegaForm.controls['nombrebodega'].value+' agregada',
          'La bodega se ha guardado con éxito',
          'success'
        )
      }, error: (e) => {
        this._show_spinner = false;
        console.error(e);
        Swal.fire(
          'Oops!',
          'La bodega no se ha podido guardar ',
          'error'
        )
      }, complete: () => {
        this.obtenerBodegas();
        this.limpiar();
      }
    })
    }
  }

  
  idBodegas: number = 0;
  ccli:any;
  catchData(data:any) {

    console.log(data);

    this.bodegaForm.controls['nombrebodega'].setValue(data.nombrebodega);
    this.bodegaForm.controls['descripcion'].setValue(data.descripcion);
    this.idBodegas     = data.id;
    this._icon_button   = 'sync_alt';
    this._action_butto  = 'Actualizar';
    this._cancel_button = true;
    this.ccli = data.codcliente;

  }

  editarBodegas() {
    let xuser: any = sessionStorage.getItem('UserCod');
    if( this.bodegaForm.controls['nombrebodega'].value == undefined || this.bodegaForm.controls['nombrebodega'].value == null || this.bodegaForm.controls['nombrebodega'].value == '' ) Toast.fire({ icon: 'warning', title: 'El campo nombre de bodega no puede estar vacío' })
    else {
    this._show_spinner = true;
    this.modelBodegas = {
      id: this.idBodegas,
      nombrebodega: this.bodegaForm.controls['nombrebodega'].value,
      descripcion:  this.bodegaForm.controls['descripcion'].value,
      fecrea: new Date(),
      codusercrea: xuser,
      ccia: this.ccia,
      ccli: this.ccli
    }
    console.warn(this.modelBodegas);
    this.bodega.editarBodegas( this.idBodegas, this.modelBodegas).subscribe({
      next: (x) => {
        this._show_spinner = false;
        Swal.fire(
          'Bodega: '+this.bodegaForm.controls['nombrebodega'].value+' actualizada',
          'La bodega se ha actualizado con éxito',
          'success'
        )
      }, error: (e) => {
        this._show_spinner = false;
        console.error(e);
        Swal.fire(
          'Oops!',
          'La bodega no se ha podido actualizar ',
          'error'
        )
      }, complete: () => {
        this.obtenerBodegas();
        this.limpiar();
      }
    })
    }
  }

  onSubmit() {

    switch(this._action_butto) {
      case 'Crear':
        this.guardarBOdega();
        break;
      case 'Actualizar':
        this.editarBodegas();
        break;
    }

  }

  obtenerBodegas() {
    this.bodega.obtenerBodegas(this.ccia).subscribe({
      next:(bodegas) => {
        this.listBodegas = bodegas;
        this.filteredBodegas = bodegas;
      }
    })
  }

  limpiar() {
    this.bodegaForm.controls['nombrebodega'].setValue('');
    this.bodegaForm.controls['descripcion'].setValue('');
    this.idBodegas     = 0;
    this._icon_button   = 'add';
    this._action_butto  = 'Crear';
    this._cancel_button = false;
  }

  eliminarBodegas(id:number) {
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
        this.bodega.eliminarBodegas( id ).subscribe({
          next: (x) => {
            this._show_spinner = false;
            Swal.fire(
              'Deleted!',
              'Bodega: '+ this.bodegaForm.controls['nombrebodega'].value +' eliminada',
              'success'
            )
          }, error: (e) => {
            console.error(e);
            this._show_spinner = false;
            Swal.fire(
              'Upps!',
              'No hemos podido eliminar esta bodega',
              'error'
            )
          }, complete: () => {
            this.obtenerBodegas();
          } 
        })
      }
    })
  }

  openDialog(data:any): void {

    const reasignData = {
      "cantidadItems": data.cantidadItems,
      "id": data.id,
      "nombrebodega": data.nombrebodega,
      "descripcion": data.descripcion,
      "fecrea": data.fecrea,
      "ccia": data.ccia,
      "nombre": data.nombre,
      "ruc": data.ruc,
      "estado": 1
    }

    const dialogRef = this.dialog.open( ModalClientesComponent, {
      height: '600px',
      width: '50%',
      data: reasignData, 
    });


    dialogRef.afterClosed().subscribe( result => {      
      
      console.warn( result );

      this.obtenerBodegas();

    });


  }

}
