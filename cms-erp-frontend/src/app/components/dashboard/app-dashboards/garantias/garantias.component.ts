import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SharedService } from 'src/app/components/shared/services/shared.service';
import { GarantiasService } from './services/garantias.service';
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
  selector: 'app-garantias',
  templateUrl: './garantias.component.html',
  styleUrls: ['./garantias.component.scss']
})
export class GarantiasComponent implements OnInit {
  pMod: number = 4;

  ccia:               any;
  _show_spinner:      boolean = false; 
  @Input() modulo: any = [];
  _icon_button: string = 'add';
  _action_butto: string = 'Crear';
  _cancel_button: boolean = false;
  _delete_show:boolean = true;
  codgarantia:string = '';
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  
  garantiasmodel: any = [];
  garantiaslista:any = [];

  public dataSource!: MatTableDataSource<any>;
  columnHead:         any = [ 'edit', 'Nombre', 'BreveDescripcion', 'Frecuencia', 'TipoMant' ];
  
  public garantiaForm =   new FormGroup({
    descripcionbreve:     new FormControl(''),
    nombre:               new FormControl(''),
    codfrecuencia:        new FormControl(''),
    codtipomant:          new FormControl('')
  })

  constructor( private DataMaster: SharedService, private garantias: GarantiasService ) { }

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    this.ccia = sessionStorage.getItem('codcia');
    this.getDataMaster('TF');
    this.getDataMaster('TM');
    this.obtenerGarantias();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  frecuenciaList:any = [];
  tipomatenimientoList:any = [];
  getDataMaster(cod:string) {
    this.DataMaster.getDataMaster(cod).subscribe({
      next: (data) => {
        switch(cod) {         
          case 'TF':
            this.frecuenciaList = data;
            console.log(this.frecuenciaList);
            break;
          case 'TM':
            this.tipomatenimientoList = data;
            console.log(this.tipomatenimientoList);
            break;
          }
        }
    })
  }

  onSubmit() {
    switch(this._action_butto) {
      case 'Crear':
        this.guardargarantias();
        break;
      case 'Actualizar':
        this.editargarantias();
        break;
    }
  }

  guardargarantias() {

    if( this.garantiaForm.controls['nombre'].value == '' || this.garantiaForm.controls['nombre'].value == undefined || this.garantiaForm.controls['nombre'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo nombre no puede ir vacío' })
    else if( this.garantiaForm.controls['codfrecuencia'].value == '' || this.garantiaForm.controls['codfrecuencia'].value == undefined || this.garantiaForm.controls['codfrecuencia'].value == null ) Toast.fire({ icon: 'warning', title: 'Debes definir su frecuencia' })
    else if( this.garantiaForm.controls['codtipomant'].value == '' || this.garantiaForm.controls['codtipomant'].value == undefined || this.garantiaForm.controls['codtipomant'].value == null ) Toast.fire({ icon: 'warning', title: 'Debes definir el tipo de mantenimiento' })
    else {
    this._show_spinner = true;
    const token: any = 'GAR-'+  this.DataMaster.generateRandomString(10)
    const userSession: any = sessionStorage.getItem('UserCod');
    this.garantiasmodel = {
      "codcontrato":      token,
      "descripcionbreve": this.garantiaForm.controls['descripcionbreve'].value,
      "codfrec":          this.garantiaForm.controls['codfrecuencia'].value,
      "tipo": 1,
      "fecusercrea":      new Date(),
      "coduser":          userSession,
      "nombre":           this.garantiaForm.controls['nombre'].value,
      "codtipomant":      this.garantiaForm.controls['codtipomant'].value,
      "ccia":             this.ccia
    }

    this.garantias.guardarGarantia(this.garantiasmodel).subscribe({
      next: () => {
        this._show_spinner = false;
        Swal.fire(
          'Garantía: ' +this.garantiaForm.controls['nombre'].value + ' generada',
          'La garantía se ha guardado con éxito',
          'success'
        )
      }, error: (e) => {
        this._show_spinner = false;
        Swal.fire(
          'Opps!',
          'La garantía no se ha podido generar',
          'error'
        )
        console.error(e);
      }, complete: () => {
        this.obtenerGarantias();
        this.limpiar();
      }
    })
    }
  }

  editargarantias() {
    if( this.garantiaForm.controls['nombre'].value == '' || this.garantiaForm.controls['nombre'].value == undefined || this.garantiaForm.controls['nombre'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo nombre no puede ir vacío' })
    else if( this.garantiaForm.controls['codfrecuencia'].value == '' || this.garantiaForm.controls['codfrecuencia'].value == undefined || this.garantiaForm.controls['codfrecuencia'].value == null ) Toast.fire({ icon: 'warning', title: 'Debes definir su frecuencia' })
    else if( this.garantiaForm.controls['codtipomant'].value == '' || this.garantiaForm.controls['codtipomant'].value == undefined || this.garantiaForm.controls['codtipomant'].value == null ) Toast.fire({ icon: 'warning', title: 'Debes definir el tipo de mantenimiento' })
    else {
    this._show_spinner = true;
    const userSession: any = sessionStorage.getItem('UserCod');
    this.garantiasmodel = {
      "codcontrato":      this.codgarantia,
      "descripcionbreve": this.garantiaForm.controls['descripcionbreve'].value,
      "codfrec":          this.garantiaForm.controls['codfrecuencia'].value,
      "tipo":             1,
      "fecusercrea":      new Date(),
      "coduser":          userSession,
      "nombre":           this.garantiaForm.controls['nombre'].value,
      "codtipomant":      this.garantiaForm.controls['codtipomant'].value,
      "ccia":             this.ccia
    }

    this.garantias.editarGarantias( this.codgarantia, this.garantiasmodel).subscribe({
      next: () => {
        this._show_spinner = false;
        Swal.fire(
          'Garantía: ' +this.garantiaForm.controls['nombre'].value + ' actualizada',
          'La garantía se ha actualizado con éxito',
          'success'
        )
      }, error: (e) => {
        this._show_spinner = false;
        Swal.fire(
          'Opps!',
          'La garantía no se ha podido actualizar',
          'error'
        )
        console.error(e);
      }, complete: () => {
        this.obtenerGarantias();
        this.limpiar();
      }
    })
    }
  }


  obtenerGarantias() {
    this.garantiaslista = [];
    this.garantias.obtenerGarantias(this.ccia).subscribe({
      next: (gar:any) => {
        gar.filter((element:any) => {
          const array = {           
              "nombrefrecuencia": element.nombrefrecuencia,
              "nombretipomant": element.nombretipomant,
              "codcontrato": element.codcontrato,
              "descripcionbreve": element.descripcionbreve,
              "codfrec": element.codfrec,
              "tipo": element.tipo,
              "fecusercrea": element.fecusercrea,
              "coduser": element.coduser,
              "nombre": element.nombre,
              "codtipomant": element.codtipomant.trim(),
              "ccia": element.ccia
          }
          this.garantiaslista.push(array);
        })
      },error: (e) => {
        console.error(e);
      }, complete: () => {  
        this.dataSource = new MatTableDataSource(this.garantiaslista);
        this.dataSource.paginator = this.paginator;
      }
    })
  }

  limpiar() {
    this.garantiaForm.controls['descripcionbreve'].setValue('');
    this.garantiaForm.controls['codfrecuencia'].setValue('');
    this.garantiaForm.controls['nombre'].setValue('');
    this.garantiaForm.controls['codtipomant'].setValue('');
    this._icon_button = 'add';
    this._action_butto = 'Crear';
    this._cancel_button = false;
  }

  catchData(data:any) {
    this.garantiaForm.controls['descripcionbreve'].setValue(data.descripcionbreve);
    this.garantiaForm.controls['codfrecuencia'].setValue(data.codfrec.trim()); 
    this.garantiaForm.controls['nombre'].setValue(data.nombre);
    this.garantiaForm.controls['codtipomant'].setValue(data.codtipomant.trim());
    this._icon_button = 'sync_alt';
    this._action_butto = 'Actualizar';
    this._cancel_button = true;
    this.codgarantia = data.codcontrato;
  }

  eliminarClientes(data:any) {

    

  }

}
