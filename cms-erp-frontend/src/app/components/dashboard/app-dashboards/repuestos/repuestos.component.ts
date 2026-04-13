import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SharedService } from 'src/app/components/shared/services/shared.service';
import { RepuestosService } from './services/repuestos.service';
import { MatTableDataSource } from '@angular/material/table';

import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { CreadorMarcaRepuestoComponent } from './creador-marca-repuesto/creador-marca-repuesto.component';
import Swal from 'sweetalert2'
import { MarcarepService } from './creador-marca-repuesto/services/marcarep.service';
import { CrearBodegasService } from '../bodegas/crear-bodegas/services/crear-bodegas.service';
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
  selector: 'app-repuestos',
  templateUrl: './repuestos.component.html',
  styleUrls: ['./repuestos.component.scss']
})

export class RepuestosComponent implements OnInit, OnChanges {
  pMod: number = 4;

  
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  _show_spinner: boolean = false;
  _show_form: boolean = false;
  @Input() modulo: any = [];
  bodegasLista: any = [];

  // columnHead:         any = [ 'edit', 'nombreRep', 'marcaRepuesto', 'modelo', 'ninventario', 'nserie', 'codigobp', 'continicial', 'contfinal', 'observacion', 'icon' ];
  columnHead: any = [ 
    'edit',
    'nombreRep', 
    'codigo', 
    'fecrea', 
    'nombreUsuario',
    'descripcion',
    'marcaRepuesto', 
    'nombreMarcaEquipo', 
    'nombreModeloEquipo', 
    'nombreTipoDeEquipo',
    'cantRep',
    'activo',
    'nombrebodega',
    'valorCompra',
    'porcentajeVenta',
    'desccuentoAplicable',
    'pvp'
];

  public dataSource!: MatTableDataSource<any>;

  xuser:               any;
  ccia:                any;
  _delete_show:        boolean  = true;
  tipoMaquinaLista:    any      = [];
  grupolista:          any      = [];
  sgrupolista:         any      = [];
  modeloActivo:        any      = null;
  codtipomaquinaValue: any;
  _cancel_button:      boolean  = false;
  _icon_button:        string   = 'add';
  _action_butto:       string   = 'Crear';
  listRepuestos:       any      = [];
  listRepuestosGhost:  any      = [];
  marcaRepList:        any      = [];
  codrep:              string   = '';

  modelRepuestos:      any = [];

  public repuestosForm =   new FormGroup({
      nombreRep:           new FormControl(''),
      codigo:              new FormControl(''),
      descripcion:         new FormControl(''),
      marca:               new FormControl(''),
      codmarca:            new FormControl(''),
      marcaRep:            new FormControl(0),
      modelo:              new FormControl(''),
      codmodelo:           new FormControl(''),
      activo:              new FormControl(true),
      codtipomaquina:      new FormControl(''),
      cantRep:             new FormControl(0),
      codBode:             new FormControl(),
      valorCompra:         new FormControl(0),
      porcentajeVenta:     new FormControl(0),
      desccuentoAplicable: new FormControl(0),
      vidautil:            new FormControl(0),
      pvp:                 new FormControl(0)
    }
  )

  constructor( private bod: CrearBodegasService, 
               private marcarepService: MarcarepService,
               private DataMaster: SharedService, 
               private rep: RepuestosService, 
               public dialog: MatDialog) { }

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    this.repuestosForm.controls['pvp'].disable();
    this.xuser = sessionStorage.getItem('UserCod');
    this.ccia = sessionStorage.getItem('codcia');
    this.obtenerRepuestos();
    this.getDataMaster('MQT');
    this.obtenerMarcaRep();
    this.obtenerBodegas();
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

  obtenerBodegas() {
    this.bod.obtenerBodegas( this.ccia ).subscribe({
      next: (x) => {
        console.warn(x)
        this.bodegasLista = x;
      }, error: (e) => {
        console.error(e);
      }
     })
  }

  validatePersonal() {
    let xtipo: any = sessionStorage.getItem('tipo');
    if(xtipo.trim() == '001') {
      this._delete_show = true;
    } else {
      this._delete_show = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
      if(changes)  {}
  }

  /** OBTENER TIPO DE MAQUINAS */
  getDataMaster(cod:string) {
    this.DataMaster.getDataMaster(cod).subscribe({
      next: ( data ) => {
        switch ( cod ) {
          case 'MQT':
            this.tipoMaquinaLista = data;
            break;
        }
      }
    }) 
  }

  calculoPVP() {

    let xvaluecompra: number = this.repuestosForm.controls['valorCompra'].value;
    let xvaluePorcentajeVenta: number = this.repuestosForm.controls['porcentajeVenta'].value;
    let xdescuentoAplicable: number = this.repuestosForm.controls['desccuentoAplicable'].value;

    if ( this.repuestosForm.controls['valorCompra'].value == '' ) this.repuestosForm.controls['valorCompra'].setValue(0);
    if ( this.repuestosForm.controls['valorCompra'].value > 0 ) this.repuestosForm.controls['valorCompra'].setValue( xvaluecompra * 1 );
    if ( this.repuestosForm.controls['porcentajeVenta'].value == '' ) this.repuestosForm.controls['porcentajeVenta'].setValue(0);
    if ( this.repuestosForm.controls['porcentajeVenta'].value > 0 ) this.repuestosForm.controls['porcentajeVenta'].setValue( xvaluePorcentajeVenta * 1 );
    if ( this.repuestosForm.controls['desccuentoAplicable'].value == '' ) this.repuestosForm.controls['desccuentoAplicable'].setValue(0);
    if ( this.repuestosForm.controls['desccuentoAplicable'].value > 0 ) this.repuestosForm.controls['desccuentoAplicable'].setValue( xdescuentoAplicable * 1 );

    let calculoPorcentajeVenta: number = xvaluecompra * ( xvaluePorcentajeVenta / 100 );
    let calculoDescuento: number = xvaluecompra * ( xdescuentoAplicable / 100 );
    let calculoPVP: number = (xvaluecompra + calculoPorcentajeVenta) - calculoDescuento;

    this.repuestosForm.controls['pvp'].setValue(calculoPVP);

  }

  modelRepBod: any = [];
  guardarRespuestoBodega(codrep: string, codbodega: number) {

    this._show_spinner = true;
    this.modelRepBod = {
      "codrep":    codrep,
      "codbodega": codbodega,
      "coduser":   this.xuser,
      "estado":    1
    }

    this.rep.guardarRepuestoBodegas( this.modelRepBod ).subscribe({

      next: (x) => {
        console.warn(x);
        Swal.fire(
          'Enviado a bodega',
          'Repuesto agregado a la bodega seleccionada',
          'success'
        )
      }, error: (e) => {
        console.error(e);
        Swal.fire(
          'Envio a bodega fallido',
          'Conexión a servidor con problemas.',
          'error'
        )
        this._show_spinner = false;
      }, complete: () => {
        this._show_spinner = false;
      }
    })

  }

  openDialog(data:any): void {

    const dialogRef = this.dialog.open( CreadorMarcaRepuestoComponent, {
      height: '400px',
      width: '80%',
      data: data, 
      
    });

    dialogRef.afterClosed().subscribe( result => {
      this.marcaRepList = result;
      if( result == null || result == undefined ) this.obtenerMarcaRep();
    });

  }

  getFechasEdit(): string {
    let date = new Date();
    let fecha:        any    = date.getDay()+''+(date.getMonth()+1)+''+date.getFullYear();
    let tiempo:       any    = date.getHours()+''+date.getMinutes()+''+date.getSeconds();
    let tiempoActual: string = fecha.toString()+''+tiempo.toString();
    return tiempoActual;
  }

  submit() {
    
    switch( this._action_butto ) {
      case 'Crear':
        this.guardarRepuestos();
        break;
      case 'Actualizar':
        this.actualizarRepuestos();
        break;
    }

  }

  guardarRepuestos() {
    if (!this.repuestosForm.controls['codBode'].value && this.bodegasLista.length > 0) {
      this.repuestosForm.controls['codBode'].setValue(this.bodegasLista[0].id);
    }

    
    if ( this.repuestosForm.controls['nombreRep'].value == undefined ||
      this.repuestosForm.controls['nombreRep'].value == null ||
      this.repuestosForm.controls['nombreRep'].value == ''  )  Toast.fire({ icon: 'warning', title: 'El nombre de repuesto no debe estar vacío' })
    else if ( this.repuestosForm.controls['codigo'].value == undefined ||
        this.repuestosForm.controls['codigo'].value == null ||
        this.repuestosForm.controls['codigo'].value == ''  )  Toast.fire({ icon: 'warning', title: 'El codigo de repuesto no debe estar vacío' })
    else if ( this.repuestosForm.controls['codtipomaquina'].value == undefined ||
        this.repuestosForm.controls['codtipomaquina'].value == null ||
        this.repuestosForm.controls['codtipomaquina'].value == ''  )  Toast.fire({ icon: 'warning', title: 'El tipo de equipo no debe estar vacío' })
    else if ( this.repuestosForm.controls['codmarca'].value == undefined ||
      this.repuestosForm.controls['codmarca'].value == null ||
      this.repuestosForm.controls['codmarca'].value == ''  )  Toast.fire({ icon: 'warning', title: 'La marca del equipo no debe estar vacía' })
    else if ( this.repuestosForm.controls['codmodelo'].value == undefined ||
      this.repuestosForm.controls['codmodelo'].value == null ||
      this.repuestosForm.controls['codmodelo'].value == ''  )  Toast.fire({ icon: 'warning', title: 'El modelo del equipo no debe estar vacío' })
    else if ( this.repuestosForm.controls['marcaRep'].value == undefined ||
      this.repuestosForm.controls['marcaRep'].value == null ||
      this.repuestosForm.controls['marcaRep'].value == 0  )  Toast.fire({ icon: 'warning', title: 'La marca del repuesto no debe estar vacía' })
    else if ( this.repuestosForm.controls['codBode'].value == undefined ||
      this.repuestosForm.controls['codBode'].value == null ||
      this.repuestosForm.controls['codBode'].value == 0  )  Toast.fire({ icon: 'warning', title: 'La asignación a la bodega no puede estar vacía' })
    else if ( this.repuestosForm.controls['cantRep'].value == undefined ||
      this.repuestosForm.controls['cantRep'].value == null ||
      this.repuestosForm.controls['cantRep'].value < 0  )  Toast.fire({ icon: 'warning', title: 'La cantidad de repuestos no debe estar vacía, o ser menor a 0' })
    else {    
    this._show_spinner = true;
    let codeRep: any = 'REP-'+this.repuestosForm.controls['codtipomaquina'].value.toString().trim()+'-'+this.repuestosForm.controls['codmarca'].value.toString().trim()+'-'+this.repuestosForm.controls['codmodelo'].value.toString().trim()+'-'+this.getFechasEdit();
    this.modelRepuestos = {
      codrep:              codeRep,
      urlimagenA:          '',
      fecrea:              new Date(),
      usercrea:            this.xuser,
      nombreRep:           this.repuestosForm.controls['nombreRep']  .value,
      codigo:              this.repuestosForm.controls['codigo']     .value,
      descripcion:         this.repuestosForm.controls['descripcion'].value,
      codTipoMaquina:      this.repuestosForm.controls['codtipomaquina'].value.toString().trim(),
      marca:               this.repuestosForm.controls['codmarca'].value.toString().trim(),
      modelo:              this.repuestosForm.controls['codmodelo'].value.toString().trim(),
      activo:              this.repuestosForm.controls['activo'].value,
      marcaRep:            this.repuestosForm.controls['marcaRep'].value.toString().trim(),
      estado:              1,
      codcia:              this.ccia,
      cantRep:             this.repuestosForm.controls['cantRep'].value || 0,
      valorCompra:         this.repuestosForm.controls['valorCompra'].value || 0,
      porcentajeVenta:     this.repuestosForm.controls['porcentajeVenta'].value || 0,
      desccuentoAplicable: this.repuestosForm.controls['desccuentoAplicable'].value || 0,
      vidautil:            this.repuestosForm.controls['vidautil'].value || 0
    }

    this.rep.guardarRepuestos(this.modelRepuestos).subscribe({
      next: (x:any) => {
        Swal.fire(
          'Repuesto agregada',
          'La repuesto con código '+this.repuestosForm.controls['codigo'].value+', se ha guardado con éxito',
          'success'
        )

        this.guardarRespuestoBodega(x.codrep, this.repuestosForm.controls['codBode'].value);

      }, error: (e) => {
        console.error(e);
        Swal.fire(
          'Oops!',
          'Algo ha pasado',
          'error'
        )
        this._show_spinner = false;
      }, complete: () => {
        this.obtenerRepuestos();
        this.limpiar();
        this._show_spinner = false;
      }
    })
  }
  }

  actualizarRepuestos() {

    if (!this.repuestosForm.controls['codBode'].value && this.bodegasLista.length > 0) {
      this.repuestosForm.controls['codBode'].setValue(this.bodegasLista[0].id);
    }

    if ( this.repuestosForm.controls['nombreRep'].value == undefined ||
      this.repuestosForm.controls['nombreRep'].value == null ||
      this.repuestosForm.controls['nombreRep'].value == ''  )  Toast.fire({ icon: 'warning', title: 'El nombre de repuesto no debe estar vacío' })
    else if ( this.repuestosForm.controls['codigo'].value == undefined ||
        this.repuestosForm.controls['codigo'].value == null ||
        this.repuestosForm.controls['codigo'].value == ''  )  Toast.fire({ icon: 'warning', title: 'El codigo de repuesto no debe estar vacío' })
  
    else if ( this.repuestosForm.controls['codtipomaquina'].value == undefined ||
        this.repuestosForm.controls['codtipomaquina'].value == null ||
        this.repuestosForm.controls['codtipomaquina'].value == ''  )  Toast.fire({ icon: 'warning', title: 'El tipo de equipo no debe estar vacío' })
    
    else if ( this.repuestosForm.controls['codmarca'].value == undefined ||
      this.repuestosForm.controls['codmarca'].value == null ||
      this.repuestosForm.controls['codmarca'].value == ''  )  Toast.fire({ icon: 'warning', title: 'La marca del equipo no debe estar vacía' })
    else if ( this.repuestosForm.controls['codmodelo'].value == undefined ||
      this.repuestosForm.controls['codmodelo'].value == null ||
      this.repuestosForm.controls['codmodelo'].value == ''  )  Toast.fire({ icon: 'warning', title: 'El modelo del equipo no debe estar vacío' })
    else if ( this.repuestosForm.controls['marcaRep'].value == undefined ||
      this.repuestosForm.controls['marcaRep'].value == null ||
      this.repuestosForm.controls['marcaRep'].value == ''  )  Toast.fire({ icon: 'warning', title: 'La marca del repuesto no debe estar vacía' })
    else if ( this.repuestosForm.controls['cantRep'].value == undefined ||
      this.repuestosForm.controls['cantRep'].value == null ||
      this.repuestosForm.controls['cantRep'].value < 0  )  Toast.fire({ icon: 'warning', title: 'La cantidad de repuestos no debe estar vacía, o ser menor a 0' })
    else {

    this._show_spinner = true;
    this.modelRepuestos = {
      codrep:              this.codrep,
      urlimagenA:          '',
      fecrea:              new Date(),
      usercrea:            this.xuser,
      nombreRep:           this.repuestosForm.controls['nombreRep'].value,
      codigo:              this.repuestosForm.controls['codigo'].value,
      descripcion:         this.repuestosForm.controls['descripcion'].value,
      codTipoMaquina:      this.repuestosForm.controls['codtipomaquina'].value.toString().trim(),
      marca:               this.repuestosForm.controls['codmarca'].value.toString().trim(),
      modelo:              this.repuestosForm.controls['codmodelo'].value.toString().trim(),
      activo:              this.repuestosForm.controls['activo'].value,
      marcaRep:            this.repuestosForm.controls['marcaRep'].value.toString().trim(),
      estado:              1,
      codcia:              this.ccia,
      cantRep:             this.repuestosForm.controls['cantRep'].value || 0,
      valorCompra:         this.repuestosForm.controls['valorCompra'].value || 0,
      porcentajeVenta:     this.repuestosForm.controls['porcentajeVenta'].value || 0,
      desccuentoAplicable: this.repuestosForm.controls['desccuentoAplicable'].value || 0,
      vidautil:            this.repuestosForm.controls['vidautil'].value || 0
    }

    this.rep.actualizarRepuestos(this.codrep, this.modelRepuestos).subscribe({
      next: (x) => {
        Swal.fire(
          'Máquina agregada',
          'La repuesto con código '+this.repuestosForm.controls['codigo'].value+', se ha actualizado exitósamente',
          'success'
        )
      }, error: (e) => {
        console.error(e);
        Swal.fire(
          'Oops!',
          'Algo ha pasado',
          'error'
        )
        this._show_spinner = false;
      }, complete: () => {
        this.obtenerRepuestos();
        this.limpiar();
        this._show_spinner = false;
      }
    })
  }
  }

  
  eliminarRepuestos(data:any) {
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
        this.rep.eliminarRepuestos( data.codrep, this.xuser ).subscribe({
          next: (x) => {
            this._show_spinner = false;
            Swal.fire(
              'Deleted!',
              'Repuesto: '+ data.nombreRep +' eliminado',
              'success'
            )
          }, error: (e) => {
            console.error(e);
            this._show_spinner = false;
            Swal.fire(
              'Upps!',
              'No hemos podido eliminar esta máquina',
              'error'
            )
          }, complete: () => {
            this.obtenerRepuestos();
          }
        })
      }
    })
  }

  obtenerRepuestos() {
    this._show_spinner = true;
    this.listRepuestos = [];
    this.listRepuestosGhost = [];
    this.rep.obtenerRepuestos( this.xuser, this.ccia ).subscribe({
      next: (x) => {
        this.listRepuestosGhost = x;
        console.warn(this.listRepuestosGhost);
      }, error: (e) => {
        this._show_spinner = false;
        console.error(e);
      }, complete: () => {
        this.listRepuestosGhost.filter( (lg:any) => {          
            if( !lg.activo  ) {
              lg.colorRow = 'orange';
              lg.iconRep = 'cancel';
            } else {
              lg.colorRow = 'yellowgreen';
              lg.iconRep = 'done';
            }            
            this.listRepuestos.push( lg );
        })

        this._show_spinner = false;
        this.dataSource = new MatTableDataSource(this.listRepuestos);
        this.dataSource.paginator = this.paginator;

      }
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  catchData(data: any) {

    this.repuestosForm.controls['marcaRep'].setValue(data.idMarcaRepuesto);
    this.repuestosForm.controls['codBode'].setValue(data.idBodega);
    this.repuestosForm.controls['codBode'].disable();
    this.codrep = data.codrep;
    this.repuestosForm.controls['nombreRep'].setValue(data.nombreRep);
    this.repuestosForm.controls['codigo'].setValue(data.codigo);
    this.repuestosForm.controls['descripcion'].setValue(data.descripcion);
    this.repuestosForm.controls['codtipomaquina'].setValue(data.codTipoMaquina.toString().trim());
    this.getGrupos();
    this.repuestosForm.controls['marca'].setValue(data.marca.toString().trim());
    this.repuestosForm.controls['codmarca'].setValue(data.marca.toString().trim());
    this.repuestosForm.controls['codmodelo'].setValue(data.modelo.toString().trim());
    this.getSubgrupos();
    this.repuestosForm.controls['activo'].setValue(data.activo);
    this.repuestosForm.controls['cantRep'].setValue(data.cantRep);
    
    this._action_butto = 'Actualizar';
    this._cancel_button = true;

    this.calculoPVP();
    this.repuestosForm.controls['valorCompra'].setValue(data.valorCompra);
    this.repuestosForm.controls['porcentajeVenta'].setValue(data.porcentajeVenta);
    this.repuestosForm.controls['desccuentoAplicable'].setValue(data.desccuentoAplicable);
}


  limpiar() {
    this.repuestosForm.controls['nombreRep'].setValue('');
    this.repuestosForm.controls['codigo'].setValue('');
    this.repuestosForm.controls['descripcion'].setValue('');
    this.repuestosForm.controls['marca'].setValue('');
    this.repuestosForm.controls['codmarca'].setValue(null);
    this.repuestosForm.controls['codmodelo'].setValue(null);
    this.repuestosForm.controls['codtipomaquina'].setValue(null);
    this.repuestosForm.controls['activo'].setValue(true);
    this.repuestosForm.controls['marcaRep'].setValue('');
    this.repuestosForm.controls['cantRep'].setValue(0);
    this._action_butto = 'Crear';
    this.repuestosForm.controls['codBode'].enable();
    this.repuestosForm.controls['codBode'].setValue('');
    this.sgrupolista = [];
    this._cancel_button = false;
    this.calculoPVP();
    this.repuestosForm.controls['valorCompra'].setValue(0);
    this.repuestosForm.controls['porcentajeVenta'].setValue(0);
    this.repuestosForm.controls['desccuentoAplicable'].setValue(0);
    this.repuestosForm.controls['pvp'].setValue(0);
    this._show_form = false;
  }

 /** OBTENER MARCA */
 getGrupos() {
  this.grupolista = [];
  this.sgrupolista = [];
  this.repuestosForm.controls['marca'].setValue('');
  this.repuestosForm.controls['codmarca'].setValue('');
  this.repuestosForm.controls['modelo'].setValue('');
  this.repuestosForm.controls['codmodelo'].setValue('');

  this.codtipomaquinaValue = this.repuestosForm.controls['codtipomaquina'].value?.trim();

  this.DataMaster.getDataMasterGrupo(this.codtipomaquinaValue).subscribe({
      next: (grupo) => {
          this.grupolista = grupo;

          // 🔹 Si hay elementos en grupolista, selecciona el primero automáticamente
          if (this.grupolista.length > 0) {
              this.repuestosForm.controls['marca'].setValue(this.grupolista[0].codmarca);
          }
      },
      error: (err) => console.error("❌ Error en getDataMasterGrupo:", err),
      complete: () => {}
  });
}


onBodegaChange(event: Event) {
  const selectElement = event.target as HTMLSelectElement;
  const selectedValue = selectElement?.value;

  if (!selectedValue) return; // Si es null, no hace nada

  console.log("Bodega seleccionada:", selectedValue);
  this.repuestosForm.controls['codBode'].setValue(selectedValue);
}



 /** OBTENER MODELOS */
 getSubgrupos() {
  this.repuestosForm.controls['codmarca'].setValue(this.repuestosForm.controls['marca'].value);
  let grupo: any = this.codtipomaquinaValue;
  let subgrupo: any = this.repuestosForm.controls['marca'].value;

  this.DataMaster.getDataMasterSubGrupo(grupo.trim(), subgrupo.trim()).subscribe({
      next: (sgrupo) => {
          this.sgrupolista = sgrupo;

          // 🔹 Si hay modelos en la lista, seleccionar el primero automáticamente
          if (this.sgrupolista.length > 0) {
              this.repuestosForm.controls['codmodelo'].setValue(this.sgrupolista[0].codmodelo);
          }
      },
      error: (err) => console.error("❌ Error en getDataMasterSubGrupo:", err),
      complete: () => {}
  });
}



obtenerCodigoModelo(event: Event) {
  const selectElement = event.target as HTMLSelectElement;
  const selectedValue = selectElement?.value;

  if (!selectedValue) return; // Evita errores si es null

  console.log("Modelo seleccionado:", selectedValue);
  this.repuestosForm.controls['codmodelo'].setValue(selectedValue);
}


onTipoMaquinariaChange(event: any) {
  this.getGrupos();
  setTimeout(() => {
    this.getSubgrupos();
    this.obtenerBodegas(); // 🔹 Ahora también actualiza bodegas
  }, 100);
}

validacionNumeroPositivo(controlName: string) {
  const valor = this.repuestosForm.controls[controlName].value * 1; // Convierte en número
  if (valor < 0 || isNaN(valor)) {
    this.repuestosForm.controls[controlName].setValue(0); // Evita negativos
  }
}

// Función para bloquear la entrada de caracteres no permitidos
validarEntradaNumerica(event: KeyboardEvent) {
  const charCode = event.which ? event.which : event.keyCode;
  
  // Bloquear "-" y otros caracteres no numéricos
  if (charCode === 45 || (charCode < 48 || charCode > 57)) {
    event.preventDefault();
  }
}



ngAfterViewInit() {
  this.setDefaultSelection("marcaRep");
  this.setDefaultSelection("codtipomaquina");
  this.setDefaultSelection("marca");

  // Mapeo de IDs y su siguiente campo al presionar "Tab"
  const tabOrder: Record<string, string> = { // 🔥 Agregamos 'Record<string, string>' para que TypeScript lo acepte
      "marcaRep": "codtipomaquina",
      "codtipomaquina": "marca"
  };

  // Agregar eventos de teclado a los selectores
  Object.keys(tabOrder).forEach(id => {
      const selectElement = document.getElementById(id) as HTMLSelectElement;
      if (selectElement) {
          selectElement.addEventListener("keydown", (event) => {
              if (event.key === "Tab") {
                  event.preventDefault();
                  setTimeout(() => {
                      const nextField = tabOrder[id]; // ✅ TypeScript ya no mostrará errores aquí
                      this.setDefaultSelection(nextField);
                      const nextSelect = document.getElementById(nextField) as HTMLSelectElement;
                      if (nextSelect) {
                          nextSelect.focus();
                      }
                  }, 300);
              }
          });
      }
  });
}

// Método para seleccionar automáticamente el índice 0 y actualizar FormControl
setDefaultSelection(selectId: string) {
  setTimeout(() => {
      const selectElement = document.getElementById(selectId) as HTMLSelectElement;
      if (selectElement && selectElement.options.length > 0) {
          selectElement.selectedIndex = 0; // Selecciona el primer valor automáticamente

          // Si el select está vinculado a un FormControl, actualizamos su valor
          const selectedValue = selectElement.options[0].value;
          this.repuestosForm.controls[selectId]?.setValue(selectedValue);
      } else {
          // Si aún no tiene opciones, intenta nuevamente después de un breve retraso
          setTimeout(() => this.setDefaultSelection(selectId), 100);
      }
  }, 100);
}




}
