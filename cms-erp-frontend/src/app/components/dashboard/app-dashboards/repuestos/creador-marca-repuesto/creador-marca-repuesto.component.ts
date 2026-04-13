import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RepuestosComponent } from '../repuestos.component';
import { SharedService } from 'src/app/components/shared/services/shared.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MarcarepService } from './services/marcarep.service';
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
  selector: 'app-creador-marca-repuesto',
  templateUrl: './creador-marca-repuesto.component.html',
  styleUrls: ['./creador-marca-repuesto.component.scss']
})
export class CreadorMarcaRepuestoComponent implements OnInit {
  pMod: number = 4;

  _show_spinner:       boolean = false;
  modelMarcaRep:       any = [];
  xuser:               any;
  marcaRepList:        any = [];
  _cancel_button:      boolean = false;
  _icon_button:        string = 'add';
  _action_butto:       string = 'Crear';

  public repuestosForm = new FormGroup({
    nombreRep:        new FormControl('')
  })


  constructor( private marcarepService: MarcarepService, public dialogRef: MatDialogRef<RepuestosComponent>, @Inject(MAT_DIALOG_DATA) public data: any ) { }

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    this.xuser = sessionStorage.getItem('UserCod');
    this.obtenerMarcaRep();
  }

  obtenerMarcaRep() {
    this._show_spinner = true;
    this.marcarepService.obtenerMarcaRep().subscribe({
      next: (x) => {
        this.marcaRepList = x;
      }, error: (e) => {
        this._show_spinner = false;
        console.error(e);
      }, complete: () => {
        console.warn(this.marcaRepList);
        this._show_spinner = false;
      }
    })
  }

  guardarRepuesto() {

    if ( this.repuestosForm.controls['nombreRep'].value == undefined || this.repuestosForm.controls['nombreRep'].value == null || this.repuestosForm.controls['nombreRep'].value == '' ) {
      Swal.fire(
        'Hey!',
        'La marca de repuesto no puede enviarse vacía',
        'warning'
      )
    }
    else {
      this.modelMarcaRep = {
        nombreMarcaRep: this.repuestosForm.controls['nombreRep'].value,
        usercrea: this.xuser
      }

      this.marcarepService.guardarMarcaRep(this.modelMarcaRep).subscribe({
        next: (x) => {

          Swal.fire(
            'Marca creada',
            'La marca de repuesto '+this.repuestosForm.controls['nombreRep'].value+', se ha guardado con éxito',
            'success'
          )

          this.marcaRepList.unshift(x);
        
        }, error: (e) => {
          this._show_spinner = false;
          Swal.fire(
            'Oops!',
            'Algo ha pasado con la petición',
            'error'
          )
          console.error(e);
        }, complete: () => {
          this._show_spinner = false;
          this.limpiar();
        }
      })
    }
  }

  limpiar() {
    this.repuestosForm.controls['nombreRep'].setValue('');
    this._icon_button='add';
    this._action_butto='Crear';
  }

  idMarcaRep: number = 0;
  indexMR: number = 0;
  catchData(data:any, index: number) {
    this.idMarcaRep = data.id;
    this.indexMR = index;
    this.repuestosForm.controls['nombreRep'].setValue(data.nombreMarcaRep);
    this._icon_button='sync_alt';
    this._action_butto='Actualizar';
  }

  submit() {
    switch (this._icon_button) {
      case 'add':
        this.guardarRepuesto()
        break;
      case 'sync_alt':
        this.actualizarRepuestos()
        break;
    }
  }

  actualizarRepuestos() {
    if ( this.repuestosForm.controls['nombreRep'].value == undefined || this.repuestosForm.controls['nombreRep'].value == null || this.repuestosForm.controls['nombreRep'].value == '' ) {
    Swal.fire(
      'Hey!',
      'La marca de repuesto no puede enviarse vacía',
      'warning'
    )
  }
  else {
    this.modelMarcaRep = {
      id: this.idMarcaRep,
      nombreMarcaRep: this.repuestosForm.controls['nombreRep'].value,
      fecrea: new Date(),
      usercrea: this.xuser
    }

    this.marcarepService.editarMarcaRepuesto(this.idMarcaRep, this.modelMarcaRep).subscribe({
      next: (x) => {

        Swal.fire(
          'Marca actualizada',
          'La marca de repuesto '+this.repuestosForm.controls['nombreRep'].value+', se ha actualizado con éxito',
          'success'
        )
        console.warn(x);
        this.marcaRepList.unshift(x);
      
      }, error: (e) => {
        this._show_spinner = false;
        Swal.fire(
          'Oops!',
          'Algo ha pasado con la petición',
          'error'
        )
        console.error(e);
      }, complete: () => {
        this._show_spinner = false;
        this.marcaRepList.splice( (this.indexMR + 1), 1);
        this.limpiar();
      }
    })
  }}
  
  eliminarRepuestos(data:any, index:number) {
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
        this.marcarepService.eliminarRepuestos( data.id ).subscribe({
          next: (x) => {
            this._show_spinner = false;
            Swal.fire(
              'Eliminada!',
              'Marca: '+ data.nombreMarcaRep +' eliminada',
              'success'
            )
          }, error: (e) => {
            console.error(e);
            this._show_spinner = false;
            Swal.fire(
              'Upps!',
              'No hemos podido eliminar esta marca',
              'error'
            )
          }, complete: () => {
            this.marcaRepList.splice( index, 1 );
          } 
        })
      }
    })
  }

  closeDialog() {
    this.dialogRef.close(this.marcaRepList);
  }

}
