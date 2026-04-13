import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ClienteService } from '../clientes/services/cliente.service';
import { SharedService } from 'src/app/components/shared/services/shared.service';

import { MatDialog } from '@angular/material/dialog';
import { ModalAsignacionProductosComponent } from './modal-asignacion-productos/modal-asignacion-productos.component';

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
  selector: 'app-agencias',
  templateUrl: './agencias.component.html',
  styleUrls: ['./agencias.component.scss']
})
export class AgenciasComponent implements OnInit {
  ccia:               any;
  _show_spinner:      boolean = false;
  _show_form:         boolean = false; 
  obsoleto:boolean = false;
  _show_form_agency: boolean = false;
  pMod: number = 4;

  columnHead:         any = [ 'edit', 'maqu', 'nombreCliente',  'nombre', 'centrocostos', 'mantenimiento', 'horarioatenciond', 'horarioatenciondm', 'C.Maq.', 'tipoAgencia'];
  public dataSource!: MatTableDataSource<any>;
  _cancel_button:     boolean = false;
  _icon_button:       string = 'add';
  _action_butto:      string = 'Crear';
  frecuenciaList:     any = [];
  _delete_show:       boolean = true;
  public cantonLista:           any = [];
  public provinciaLista:        any = [];
  tipoAgenciaLista: any = [];
  @Input() modulo: any = [];

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  public agenciaForm = new FormGroup({
    // codagencia:        new FormControl(''),
    nombre:               new FormControl(''),
    descripcion:          new FormControl(''),
    observacion:          new FormControl(''),
    longitud:             new FormControl(''),
    latitud:              new FormControl(''),
    tipo:                 new FormControl(''),
    campoA:               new FormControl(),
    campoB:               new FormControl(''),
    codcliente:           new FormControl(''),
    horarioatencion1:     new FormControl(),
    horarioatencion2:     new FormControl(),
    horarioatencion3:     new FormControl(),
    horarioatencion4:     new FormControl(),
    horarioatencionM1:    new FormControl(),
    horarioatencionM2:    new FormControl(),
    horarioatencionM3:    new FormControl(),
    horarioatencionM4:    new FormControl(),
    codfrecuencia:        new FormControl(''),
    // codcia:            new FormControl(''),
    estado:               new FormControl(''),
    codmachine:           new FormControl(''),
    codProv:              new FormControl(''),
    codCanton:            new FormControl(''),
    centrocostos:            new FormControl('')

  })


  constructor( private client: ClienteService, 
               private DataMaster: SharedService,
               public dialog: MatDialog ) { }

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;
    this.ccia = sessionStorage.getItem('codcia');
    this.getDataMaster('TP1');
    this.getDataMaster('PRV00');
    this.getDataMaster('TF');
    this.obtenerCliente();
    this.obtenerAgencias();
  }

  validarCadena(event:any, controlname:any, tipo: string) {

    switch(tipo) {
      case 'L':
        this.DataMaster.validarLetras(event, controlname, this.agenciaForm);
        break;
      case 'N':
        this.DataMaster.validarNumeros(event, controlname, this.agenciaForm);
        break;
    }

  }


  limpiar() {

    this.agenciaForm.controls['nombre'].setValue('');
    this.agenciaForm.controls['descripcion'].setValue('');
    this.agenciaForm.controls['observacion'].setValue('');
    this.agenciaForm.controls['longitud'].setValue('');
    this.agenciaForm.controls['latitud'].setValue('');
    this.agenciaForm.controls['tipo'].setValue('');
    this.agenciaForm.controls['campoA'].setValue('');
    this.agenciaForm.controls['campoB'].setValue('');
    this.agenciaForm.controls['codcliente'].setValue('');
    this.agenciaForm.controls['horarioatencion1'].setValue(''); 
    this.agenciaForm.controls['horarioatencion2'].setValue('');
    this.agenciaForm.controls['codfrecuencia'].setValue('');
    this.agenciaForm.controls['codProv'].setValue('');
    this.agenciaForm.controls['codCanton'].setValue('');
    this.agenciaForm.controls['horarioatencion3'].setValue('');
    this.agenciaForm.controls['horarioatencion4'].setValue('');
    this.agenciaForm.controls['horarioatencionM1'].setValue('');
    this.agenciaForm.controls['horarioatencionM2'].setValue('');
    this.agenciaForm.controls['horarioatencionM3'].setValue('');
    this.agenciaForm.controls['horarioatencionM4'].setValue('');
    this.agenciaForm.controls['centrocostos'].setValue(0);
    this._action_butto      = 'Crear';
    this._icon_button       = 'add';
    this._cancel_button     = false;
    this._show_form = false;
    this.validationCliente();

  }

  validatePersonal() {

    let xtipo: any = sessionStorage.getItem('tipo');
    if(xtipo.trim() == '001') {
      this._delete_show = true;
    } else {
      this._delete_show = false;
    }

  }

  validationCliente() {
    
    if( this.agenciaForm.controls['codcliente'].value == undefined || this.agenciaForm.controls['codcliente'].value == null || this.agenciaForm.controls['codcliente'].value == '' ) {
      this._show_form_agency = false;
      // console.log(this._show_form_agency)
    }
    else {
      this._show_form_agency = true
      // console.log(this._show_form_agency)
    }

  }


  getDataMaster(cod:string) {
    this.DataMaster.getDataMaster(cod).subscribe({
      next: (data) => {
        switch(cod) {
          case 'TP1':
            this.tipoAgenciaLista = data;
            // console.log(this.tipoAgenciaLista);
            break;
        case 'PRV00':
          this.provinciaLista = data;
          // console.log(this.provinciaLista);
          break;
        case 'TF':
          this.frecuenciaList = data;
          // console.log(this.frecuenciaList);
          break;
        }
      }
    }) 
  }

  getCantones() {

    // console.log('PROVINCIA CODIGO');
    // console.log(this.agenciaForm.controls['codProv'].value);

    this.DataMaster.getDataMaster(this.agenciaForm.controls['codProv'].value).subscribe({
      next: (cantones) => {
        this.cantonLista = cantones;
        console.warn( this.cantonLista );
      }, 
      error: (e) => {
        console.error(e);
      }
    })
  }

  onSubmit() {
    switch(this._action_butto) {
      case 'Crear':
        this.guardarAgencias();
        break;
      case 'Actualizar':
        this.editarAgencias();
        break;
    }
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  codagencia: string = '';
  catchData(data: any) {
    // console.warn('==============================')
    // console.warn(data)
    // console.warn('==============================')
    this.agenciaForm.controls['codcliente']   .setValue(data.codcliente);
    this.validationCliente();
    setTimeout(() => {
      let h1 = data.horarioatenciond.split(':');
      let h2 = data.horarioatencionh.split(':');
      let h3 = data.horarioatenciondm.split(':');
      let h4 = data.horarioatencionhm.split(':');
      this.agenciaForm.controls['nombre']        .setValue(data.nombre);
      this.agenciaForm.controls['descripcion']   .setValue(data.descripcion);
      this.agenciaForm.controls['observacion']   .setValue(data.observacion);
      this.agenciaForm.controls['longitud']      .setValue(data.longitud);
      this.agenciaForm.controls['latitud']       .setValue(data.latitud);
      this.agenciaForm.controls['tipo']          .setValue(data.tipo.trim());
      this.agenciaForm.controls['campoA']        .setValue(data.campoA);
      this.agenciaForm.controls['campoB']        .setValue(data.campoB);
      this.agenciaForm.controls['codfrecuencia'] .setValue(data.codfrecuencia);
      this.agenciaForm.controls['codProv']       .setValue(data.codProv.trim());
      this.getCantones();
      this.agenciaForm.controls['codCanton']    .setValue(data.codCanton.trim());
      // console.log( 'CODIGO CANTON' )
      // console.log( this.agenciaForm.controls['codCanton'].value )
      // console.log( data.codCanton.trim() )
      this.agenciaForm.controls['horarioatencion1'].setValue(h1[0]);
      this.agenciaForm.controls['horarioatencion2'].setValue(h1[1]);
      this.agenciaForm.controls['horarioatencion3'].setValue(h2[0]);
      this.agenciaForm.controls['horarioatencion4'].setValue(h2[1]);
      this.agenciaForm.controls['horarioatencionM1'].setValue(h3[0]);
      this.agenciaForm.controls['horarioatencionM2'].setValue(h3[1]);
      this.agenciaForm.controls['horarioatencionM3'].setValue(h4[0]);
      this.agenciaForm.controls['horarioatencionM4'].setValue(h4[1]);
      this.agenciaForm.controls['centrocostos'].setValue(data.centrocostos);
      this.codagencia     = data.codagencia;
      this._icon_button   = 'sync_alt';
      this._action_butto  = 'Actualizar';
      this._cancel_button = true;
    }, 1000);
  }

  listaClientes: any = [];
  obtenerCliente() {
    this._show_spinner = true;
    this.client.obtenerClientes(this.ccia, 2).subscribe({
      next: (clientes) => {
        this.listaClientes = clientes;
        // console.log(this.listaClientes)
      },
      error: (e) => {
        console.error(e);
        this._show_spinner = false;
      },
      complete: () => {
        this._show_spinner = false;
      }
    })
  }

  editarAgencias() {
    if( this.agenciaForm.controls['codcliente'].value == undefined || this.agenciaForm.controls['codcliente'].value == null || this.agenciaForm.controls['codcliente'].value == '' ) Toast.fire({ icon: 'warning', title: 'Debes escoger un cliente a quien asigar sus agencias' })
    else if( this.agenciaForm.controls['nombre'].value == undefined || this.agenciaForm.controls['nombre'].value == null || this.agenciaForm.controls['nombre'].value == '' ) Toast.fire({ icon: 'warning', title: 'El campo nombre no puede ir vacío' })
    else if( this.agenciaForm.controls['tipo'].value == undefined || this.agenciaForm.controls['tipo'].value == null || this.agenciaForm.controls['tipo'].value == '' ) Toast.fire({ icon: 'warning', title: 'Necesitas definir si tu agencia es Matríz o Sucursal' })
    else if( this.agenciaForm.controls['codProv'].value == undefined || this.agenciaForm.controls['codProv'].value == null || this.agenciaForm.controls['codProv'].value == '' ) Toast.fire({ icon: 'warning', title: 'El campo Provincia no puede ir vacío' })
    else if( this.agenciaForm.controls['codCanton'].value == undefined || this.agenciaForm.controls['codCanton'].value == null || this.agenciaForm.controls['codCanton'].value == '' ) Toast.fire({ icon: 'warning', title: 'El campo Cantón no puede ir vacío' })
    else if( this.agenciaForm.controls['codfrecuencia'].value == undefined || this.agenciaForm.controls['codfrecuencia'].value == null || this.agenciaForm.controls['codfrecuencia'].value == '' ) Toast.fire({ icon: 'warning', title: 'El campo Frecuencia de Manetnimiento no puede estar vacío' })
    // if( this.agenciaForm.controls['horarioatencion1'].value == undefined && this.agenciaForm.controls['horarioatencion2'].value == undefined
    //  || this.agenciaForm.controls['horarioatencion1'].value == null && this.agenciaForm.controls['horarioatencion2'].value == null 
    //  || this.agenciaForm.controls['horarioatencion1'].value == '' && this.agenciaForm.controls['horarioatencion2'].value == '' ) Toast.fire({ icon: 'warning', title: 'El campo Horario de atención de la agencia ( DESDE ) no puede estar vacío' })
    // if( this.agenciaForm.controls['horarioatencion3'].value == undefined && this.agenciaForm.controls['horarioatencion4'].value == undefined
    // || this.agenciaForm.controls['horarioatencion3'].value == null && this.agenciaForm.controls['horarioatencion4'].value == null 
    // || this.agenciaForm.controls['horarioatencion3'].value == '' && this.agenciaForm.controls['horarioatencion4'].value == '' ) Toast.fire({ icon: 'warning', title: 'El campo Horario de atención de la agencia ( HASTA ) no puede estar vacío' })
    // if( this.agenciaForm.controls['horarioatencionM1'].value == undefined && this.agenciaForm.controls['horarioatencionM2'].value == undefined
    //  || this.agenciaForm.controls['horarioatencionM1'].value == null && this.agenciaForm.controls['horarioatencionM2'].value == null 
    //  || this.agenciaForm.controls['horarioatencionM1'].value == '' && this.agenciaForm.controls['horarioatencionM2'].value == '' ) Toast.fire({ icon: 'warning', title: 'El campo Horario de atención de la agencia ( DESDE ) no puede estar vacío' })
    // if( this.agenciaForm.controls['horarioatencionM3'].value == undefined && this.agenciaForm.controls['horarioatencionM4'].value == undefined
    // || this.agenciaForm.controls['horarioatencionM3'].value == null && this.agenciaForm.controls['horarioatencionM4'].value == null 
    // || this.agenciaForm.controls['horarioatencionM3'].value == '' && this.agenciaForm.controls['horarioatencionM4'].value == '' ) Toast.fire({ icon: 'warning', title: 'El campo Horario de atención de la agencia ( HASTA ) no puede estar vacío' })
    else {
    const cliente = this.agenciaForm.controls['nombre'].value.toString().replace(' ', '_').slice(0,6);
    const token: string = 'AGE-'+cliente+'-'+this.DataMaster.generateRandomString(15);

    this.modelAgencia = {
      codagencia :          this.codagencia,
      nombre :              this.agenciaForm.controls['nombre'].value,
      descripcion:          this.agenciaForm.controls['descripcion'].value,
      observacion:          this.agenciaForm.controls['observacion'].value,
      longitud :            this.agenciaForm.controls['longitud'].value,
      latitud:              this.agenciaForm.controls['latitud'].value,
      tipo :                this.agenciaForm.controls['tipo'].value,
      campoA :              this.agenciaForm.controls['campoA'].value,
      campoB :              this.agenciaForm.controls['campoB'].value,
      codcliente :          this.agenciaForm.controls['codcliente'].value,
      Horarioatenciond:     this.agenciaForm.controls['horarioatencion1'].value + ':' + this.agenciaForm.controls['horarioatencion2'].value,
      codfrecuencia:        this.agenciaForm.controls['codfrecuencia'].value,
      codcia :              this.ccia,
      estado :              1,
      codmachine :          '-sn-',
      codProv:              this.agenciaForm.controls['codProv'].value,
      codCanton:            this.agenciaForm.controls['codCanton'].value,
      Horarioatencionh:     this.agenciaForm.controls['horarioatencion3'] .value+':'+this.agenciaForm.controls['horarioatencion4'] .value,
      Horarioatenciondm:    this.agenciaForm.controls['horarioatencionM1'].value+':'+this.agenciaForm.controls['horarioatencionM2'].value,
      Horarioatencionhm:    this.agenciaForm.controls['horarioatencionM3'].value+':'+this.agenciaForm.controls['horarioatencionM4'].value,
      centrocostos:              this.agenciaForm.controls['centrocostos'].value,
    }

    console.warn(this.modelAgencia);

    this.client.editaAgencias( this.codagencia, this.ccia, this.modelAgencia).subscribe({
      next: () => {
        this._show_spinner = false;
        Swal.fire(
          'Agencia: '+this.agenciaForm.controls['nombre'].value+' agregada',
          'La agencia se ha actualizado con éxito',
          'success'
        )
      }, error: (e) => {
        console.error(e);
        this._show_spinner = false;
        Swal.fire(
          'Opps!',
          'La agencia no se ha podido actualizar',
          'error'
        )
      }, complete: () => {
        this.obtenerAgencias();
        this.limpiar();
      }
    })
    }
  }

  modelAgencia: any = [];
  guardarAgencias() {
    if( this.agenciaForm.controls['codcliente'].value == undefined || this.agenciaForm.controls['codcliente'].value == null || this.agenciaForm.controls['codcliente'].value == '' ) Toast.fire({ icon: 'warning', title: 'Debes escoger un cliente a quien asignar sus agencias' })
    else if( this.agenciaForm.controls['nombre'].value == undefined || this.agenciaForm.controls['nombre'].value == null || this.agenciaForm.controls['nombre'].value == '' ) Toast.fire({ icon: 'warning', title: 'El campo nombre no puede ir vacío' })
    else if( this.agenciaForm.controls['tipo'].value == undefined || this.agenciaForm.controls['tipo'].value == null || this.agenciaForm.controls['tipo'].value == '' ) Toast.fire({ icon: 'warning', title: 'Necesitas definir el tipo de agencia, si es Matríz o Sucursal' })
    else if( this.agenciaForm.controls['codProv'].value == undefined || this.agenciaForm.controls['codProv'].value == null || this.agenciaForm.controls['codProv'].value == '' ) Toast.fire({ icon: 'warning', title: 'El campo Provincia no puede ir vacío' })
    else if( this.agenciaForm.controls['codCanton'].value == undefined || this.agenciaForm.controls['codCanton'].value == null || this.agenciaForm.controls['codCanton'].value == '' ) Toast.fire({ icon: 'warning', title: 'El campo Cantón no puede ir vacío' })
    else if( this.agenciaForm.controls['codfrecuencia'].value == undefined || this.agenciaForm.controls['codfrecuencia'].value == null || this.agenciaForm.controls['codfrecuencia'].value == '' ) Toast.fire({ icon: 'warning', title: 'El campo Frecuencia de Manetnimiento no puede estar vacío' })
    // else if( this.agenciaForm.controls['horarioatencion1'].value == undefined && this.agenciaForm.controls['horarioatencion2'].value == undefined
    //  || this.agenciaForm.controls['horarioatencion1'].value == null && this.agenciaForm.controls['horarioatencion2'].value == null 
    //   ) Toast.fire({ icon: 'warning', title: 'El campo Horario de atención de la agencia ( DESDE ) no puede estar vacío' })
    // if( this.agenciaForm.controls['horarioatencion3'].value == undefined && this.agenciaForm.controls['horarioatencion4'].value == undefined
    // || this.agenciaForm.controls['horarioatencion3'].value == null && this.agenciaForm.controls['horarioatencion4'].value == null 
    //  ) Toast.fire({ icon: 'warning', title: 'El campo Horario de atención de la agencia ( HASTA ) no puede estar vacío' })
    // if( this.agenciaForm.controls['horarioatencionM1'].value == undefined && this.agenciaForm.controls['horarioatencionM2'].value == undefined
    //  || this.agenciaForm.controls['horarioatencionM1'].value == null && this.agenciaForm.controls['horarioatencionM2'].value == null 
    //  ) Toast.fire({ icon: 'warning', title: 'El campo Horario de atención de mantenimiento ( DESDE ) no puede estar vacío' })
    // if( this.agenciaForm.controls['horarioatencionM3'].value == undefined && this.agenciaForm.controls['horarioatencionM4'].value == undefined
    // || this.agenciaForm.controls['horarioatencionM3'].value == null && this.agenciaForm.controls['horarioatencionM4'].value == null 
    //  ) Toast.fire({ icon: 'warning', title: 'El campo Horario de atención de la mantenimiento ( HASTA ) no puede estar vacío' })
    else {
    const cliente = this.agenciaForm.controls['nombre'].value.toString().replace(' ', '_').slice(0,6);
    const token: string = 'AGE-'+cliente+'-'+this.DataMaster.generateRandomString(15);

    this.modelAgencia = {
      codagencia : token,
      nombre :              this.agenciaForm.controls['nombre'].value,
      descripcion:          this.agenciaForm.controls['descripcion'].value,
      observacion:          this.agenciaForm.controls['observacion'].value,
      longitud :            this.agenciaForm.controls['longitud'].value,
      latitud:              this.agenciaForm.controls['latitud'].value,
      tipo :                this.agenciaForm.controls['tipo'].value,
      campoA :              this.agenciaForm.controls['campoA'].value,
      campoB :              this.agenciaForm.controls['campoB'].value,
      codcliente :          this.agenciaForm.controls['codcliente'].value,
      Horarioatenciond:     (this.agenciaForm.controls['horarioatencion1'].value || 0 ) + ':' + (this.agenciaForm.controls['horarioatencion2'].value || 0 ),
      codfrecuencia:        this.agenciaForm.controls['codfrecuencia'].value,
      codcia : this.ccia,
      estado : 1,
      codmachine : '-sn-',
      codProv:              this.agenciaForm.controls['codProv'].value,
      codCanton:            this.agenciaForm.controls['codCanton'].value,
      Horarioatencionh:     (this.agenciaForm.controls['horarioatencion3'].value || 0)+':'+(this.agenciaForm.controls['horarioatencion4'].value || 0),
      Horarioatenciondm:    (this.agenciaForm.controls['horarioatencionM1'].value || 0)+':'+(this.agenciaForm.controls['horarioatencionM2'].value || 0),
      Horarioatencionhm:    (this.agenciaForm.controls['horarioatencionM3'].value || 0)+':'+(this.agenciaForm.controls['horarioatencionM4'].value || 0),
      centrocostos:            this.agenciaForm.controls['centrocostos'].value,
    }

    this.client.guardarAgencia(this.modelAgencia).subscribe({
      next: () => {
        this._show_spinner = false;
        Swal.fire(
          'Agencia: '+ this.agenciaForm.controls['nombre'].value +' agregada',
          'La agencia se ha agregado al cliente con éxito',
          'success'
        )
      }, error: (e) => {
        console.error(e);
        this._show_spinner = false;
        Swal.fire(
          'Opps!',
          'La agencia no se ha podido generar',
          'error'
        )
      }, complete: () => {
        this.obtenerAgencias();
        this.limpiar();
      }
    })
    }
  }


  eliminarAgencias(data: any) {

    
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

        console.log(data.codcliente)
        console.log(this.ccia)

        this.client.eliminarAgencias( data.codagencia, this.ccia ).subscribe({
          next: (x) => {
            this._show_spinner = false;
            Swal.fire(
              'Deleted!',
              'Agencia: '+ this.agenciaForm.controls['nombre'].value +' eliminada',
              'success'
            )
          }, error: (e) => {
            console.error(e);
            this._show_spinner = false;
            Swal.fire(
              'Upps!',
              'No hemos podido eliminar esta agencia',
              'error'
            )
          }, complete: () => {
            this.obtenerAgencias();
          } 
        })
      }
    })
    


  }

  listAgencias:any = [];
  obtenerAgencias() {
    this._show_spinner = true;
    this.client.obtenerAgencias(this.ccia, 'void', 'void').subscribe({
      next: (agencias) => {
        this.listAgencias = agencias;
        console.log(this.listAgencias);      
      },
      
      error: (e) => {
        console.error(e);
      },
      complete: () => {
        this.dataSource = new MatTableDataSource(this.listAgencias);
        this.dataSource.paginator = this.paginator;
        this._show_spinner = false;
      }
    })
  }

  validacionTiempo( tipo: string ) {
    console.warn(1)
    switch( tipo ) {
      case 'H1':
        console.warn(2)
        if( this.agenciaForm.controls['horarioatencion1'].value > 23  ) this.agenciaForm.controls['horarioatencion1'].setValue(23);
        if( this.agenciaForm.controls['horarioatencion2'].value > 59  ) this.agenciaForm.controls['horarioatencion2'].setValue(59);
        break;
      case 'H2':
        console.warn(2)
        if( this.agenciaForm.controls['horarioatencion3'].value > 23  ) this.agenciaForm.controls['horarioatencion3'].setValue(23);
        if( this.agenciaForm.controls['horarioatencion4'].value > 59  ) this.agenciaForm.controls['horarioatencion4'].setValue(59);
        break;
      case 'HM1':
        console.warn(3)
        if( this.agenciaForm.controls['horarioatencionM1'].value > 23  ) this.agenciaForm.controls['horarioatencionM1'].setValue(23);
        if( this.agenciaForm.controls['horarioatencionM2'].value > 59  ) this.agenciaForm.controls['horarioatencionM2'].setValue(59);
        break;
      case 'HM2':
        console.warn(3)
        if( this.agenciaForm.controls['horarioatencionM3'].value > 23  ) this.agenciaForm.controls['horarioatencionM3'].setValue(23);
        if( this.agenciaForm.controls['horarioatencionM4'].value > 59  ) this.agenciaForm.controls['horarioatencionM4'].setValue(59);
        break;
    }
  }

  openDialog(data:any): void {

    const dialogRef = this.dialog.open( ModalAsignacionProductosComponent, {
      height: '600px',
      width: '80%',
      data: data, 
    });


    dialogRef.afterClosed().subscribe( result => {      
      
      // console.warn( result );

      // this.obtenerConvenioMacro();

    });


  }

}
