import { Component, ElementRef, OnInit, QueryList, ViewChild } from '@angular/core';


import Swal from 'sweetalert2'
import { MaquinariaService } from '../../maquinaria/services/maquinaria.service';
import { CrearBodegasService } from '../crear-bodegas/services/crear-bodegas.service';
import { FormControl, FormGroup } from '@angular/forms';
import { ProductosBodegaService } from './services/productos-bodega.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { stat } from 'fs';
import { elementAt } from 'rxjs';

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
  selector: 'app-productos-bodega',
  templateUrl: './productos-bodega.component.html',
  styleUrls: ['./productos-bodega.component.scss']
})


export class ProductosBodegaComponent implements OnInit {
  pMod: number = 4;

  
  _border_cajas:        string = 'none';
  _dis_button_transfer: boolean = true;
selectedOption: any;
  ccia:               any;
  _show_spinner:      boolean = false;
  _cancel_button:     boolean = false;
  _icon_button:       string  = 'add';
  _action_butto:      string  = 'Crear';
  maquinariaLista:    any = [];
  filteredBodegas:    any = [];
  searchTerm: string = '';
  searchMaqTerm: string = '';
  searchMTerm: string = '';
  searchMPretrans: string = '';
  listBodegas: any = [];
  _IMGE:any;
  _boxa: boolean = true;
  _view_details_palets: boolean = false;
  modelItemBodega: any = [];
  codBodega: number = 0;
  detalle: string = '';
  _show_img: boolean = false;
  _show_table: boolean = false;
  maquinariaListaGhost: any = [];
  _btn_add: boolean = true;
  nombodega: string = '';
  listaMaquinaBodegasGhost: any = [];
  listaMaquinaBodegas: any = [];
  _width_boxb: string = '50%';
  _img_bodegas: boolean = true;
  _view_palets: boolean = false;
  listMaquinaUnit: any = [];

  @ViewChild(MatMenuTrigger)
  contextMenu!: MatMenuTrigger;

  @ViewChild('myMenu')
  myMenu!: ElementRef;

  @ViewChild('myTriggers')
  myTriggers!: QueryList<MatMenuTrigger>;


  maquinabodegaForm = new FormGroup({
    nombre: new FormControl(''),    
  })
  maquinabodegaAsignForm = new FormGroup({
    nombreMaq: new FormControl(''),    
  })

  bodegasFormTransfer = new FormGroup({
    bodegaentrada: new FormControl(),
    bodegasalida: new FormControl(),
    pretransferencia: new FormControl()
  })

  constructor( private maqbodega: ProductosBodegaService, private maquinaria: MaquinariaService, private bodega: CrearBodegasService) { }

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    this.ccia = sessionStorage.getItem('codcia');
    this.obtenerBodegas();
    this.obtenerMaquinaria(1);
  }

  selectViewState: number = 1;
  selectTypeVieew(select:number) {
    this.selectViewState = select;
    this.obtenerMaquinaria(this.selectViewState);
  }

  listaTransferenciaMaquinaria: any = [];
  handleCheckboxChange(event: Event, index: number) {
    const checkbox = event.target as HTMLInputElement;
    const maquinaria = this.listaMaquinaBodegas[index];  
    if (checkbox.checked) {
      this.listaTransferenciaMaquinaria.push(maquinaria);
    } 
    else {    
      const indexToRemove = this.listaTransferenciaMaquinaria.findIndex(
        (item: any) => item.codmaquinaria === maquinaria.codmaquinaria
      );      
      this.listaTransferenciaMaquinaria.splice(indexToRemove, 1);    
    }
    console.warn(this.listaTransferenciaMaquinaria);
  }
  
  addAllPretrenasfer() {
    this.listaMaquinaBodegas.filter((element:any)=>{
      this.ProcesoTransdferenciaBod (element.codmaquinaria,1);
    })
  }
  
  obtenerBodegas() {
    this._show_spinner = true
    let narray:any = [];
    this.filteredBodegas = [];
    this.bodega.obtenerBodegas(this.ccia).subscribe({
      next:(bodegas) => {
        this._show_spinner = false
        this.listBodegas = bodegas;
        // console.log('---BODEGAS OBTENIDAS---')
        // console.log(this.listBodegas)
        this.listBodegas.filter((element:any)=>{ 
          narray = {
              "cantidadItems": element.cantidadItems,
              "id": element.id,
              "nombrebodega": element.nombrebodega,
              "descripcion": element.descripcion,
              "fecrea": element.fecrea,
              "codusercrea": element.codusercrea,
              "ccia": element.ccia,
              "url": '../../../../../../assets/bodega_full.png'
          }

          if( narray.cantidadItems == 0 ) narray.url = '../../../../../../assets/bodega_vacia.png';         

          this.filteredBodegas.push(narray);

        })
      },
      error:(e) => {
        console.error(e);
        this._show_spinner = false;
      }, complete: () => {
      }
    })
  }

  limpiar() {;
    // this.maquinabodegaForm.controls['nombre'].setValue(0);
  }

  actualizarCantidadItems(codbodega:number) {

    this.filteredBodegas.filter( (element:any) => {

        if( element.id == codbodega ) {
          element.cantidadItems += 1;
        }
        else if ( element.id != codbodega ) {
          element.cantidadItems -= 1;
        }

    })

  }

  closeTransfer() {
    this._show_transfer = false;
    this._border_cajas = 'none';
    this._dis_button_transfer = true;
    this.bodegasFormTransfer.controls['bodegaentrada'].setValue('');
  }

  modtransferstate: number = 0;
  validationTransfrBod() {
    if((this.bodegasFormTransfer.controls['bodegaentrada'].value == undefined || this.bodegasFormTransfer.controls['bodegaentrada'].value == null || this.bodegasFormTransfer.controls['bodegaentrada'].value == '')
      && this.itemsBodegaTransferencia.length == 0
    ){

        this._dis_button_transfer = true;
        this.modtransferstate = 0;


    }else {

      if (this.itemsBodegaTransferencia.length == 0) {
        this._dis_button_transfer = true;
      }
      else {
        this._dis_button_transfer = false;
      }   
      this._border_cajas = 'dashed 3px orangered';
      this.modtransferstate = 1;
      // this.obtenerItemsBodTransferencia();
    }
  }

  filterbodegaghost: any = [];
  filterBodegas() {
    
    this.filteredBodegas= [];
    let narray: any = [];
    if (this.searchTerm) {
      this.filterbodegaghost = this.listBodegas.filter( (bodega:any) => 

        bodega.nombrebodega.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        bodega.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase())        
      
        );

      console.log(this.filteredBodegas);

      this.filterbodegaghost.filter((element:any)=>{

        narray = {
          "cantidadItems": element.cantidadItems,
          "id": element.id,
          "nombrebodega": element.nombrebodega,
          "descripcion": element.descripcion,
          "fecrea": element.fecrea,
          "codusercrea": element.codusercrea,
          "ccia": element.ccia,
          "url": '../../../../../../assets/bodega_full.png'
        }
        
        if( narray.cantidadItems == 0 ) narray.url = '../../../../../../assets/bodega_vacia.png';         

        this.filteredBodegas.push(narray); 

      })

    } else {
      this.listBodegas.filter((element:any) => { 
      narray = {
          "cantidadItems": element.cantidadItems,
          "id": element.id,
          "nombrebodega": element.nombrebodega,
          "descripcion": element.descripcion,
          "fecrea": element.fecrea,
          "codusercrea": element.codusercrea,
          "ccia": element.ccia,
          "url": '../../../../../../assets/bodega_full.png'
      }

      if( narray.cantidadItems == 0 ) narray.url = '../../../../../../assets/bodega_vacia.png';         

        this.filteredBodegas.push(narray);

      })

    }
  }

  filterMaquinarias() {    
    if (this.searchMTerm) {      
      this.maquinariaLista = this.maquinariaListaGhost.filter( (maquina:any) =>
        maquina.nombretipomaquina.toLowerCase()
                  .includes(this.searchMTerm.toLowerCase()) 
                  ||
        maquina.nombremarca.toLowerCase()
                  .includes(this.searchMTerm.toLowerCase())
                  ||
        maquina.nserie.toLowerCase()
                  .includes(this.searchMTerm.toLowerCase())
                  ||
        maquina.nombremodelo.toLowerCase()
                  .includes(this.searchMTerm.toLowerCase())
      );  
    } else {
      this.maquinariaLista = this.maquinariaListaGhost;
    }  
  }

  filterMaquinariasPreransfer() {
    
    console.log(this.bodegasFormTransfer.controls['pretransferencia'].value);

    if (this.bodegasFormTransfer.controls['pretransferencia'].value != '') {
      this.itemsBodegaTransferencia = this.itemsBodegaTransferenciaGhost.filter((maquina:any) =>
          maquina.nombremaquina.toLowerCase()
                 .includes(this.bodegasFormTransfer.controls['pretransferencia'].value.toLowerCase()) ||
          maquina.nserie.toLowerCase()
                 .includes(this.bodegasFormTransfer.controls['pretransferencia'].value.toLowerCase())
      );  
    } else {
      this.itemsBodegaTransferencia = this.itemsBodegaTransferenciaGhost;
    }
  
  }

  obtenerMaquinaria(option:number) {
    this._show_spinner = true;

    if( option == 0 ) {
      this._show_table = false;
      this._show_img = true
    }
    else {
      this._show_table = true;
      this._show_img = false
    };

    this.maquinaria.ObtenerMaquinasSinBodega(this.ccia, option).subscribe({
      next: (maquinas) => {
        this.maquinariaLista = maquinas;
        this.maquinariaListaGhost = maquinas;
        console.log('LISTA MAQUINARIA GUARDADO');
        console.log(this.maquinariaLista);
        this._show_spinner = false;
      },
      error: (e) => {
        this._show_spinner = false;
        console.error(e);
      },
      complete: () => {
        if (this.maquinariaLista.length == 0) this.detalle = 'Actualmente todos los items estan asignados a sus respectivas bodegas';
        else this.detalle = 'Items restantes por asignar: ' + (this.maquinariaLista.length).toString()
      }
    })
  }

  validationBodehaExist() {
    let data = this.maquinabodegaForm.controls['nombre'].value;
    this.codBodega = data.id;
    this.nombodega = data.nombrebodega;
    this._btn_add = false;
  }
  
  listaprocesotransferencia: any = [];
  ordenesTransferenciaLista:any = [];
  ProcesoTransdferenciaBod (codprod:string,state:number) {



    if ( this.modtransferstate == 0  ) {
      Swal.fire(
        '¿No haz entrado al modo de transferencia?',
        'Para agregar a la pretransferencia necesitas escojer bodega de entrada. Ingresa dando click derecho al producto guardado y escoje la opción Transferir.',
        'question'
      )
    }
    else if ( this.modtransferstate = 1 ) {

      this._show_spinner = true;
      let xuser: any = sessionStorage.getItem('UserCod');
      this.listaprocesotransferencia = {
        "codprod": codprod,
        "state":   state,
        "cuser":   xuser,
        "boden":   this.bodegasFormTransfer.controls['bodegaentrada'].value | 0,
        "bodsal":  this.codigobodegaselect,
        "ccia":    this.ccia
      }
  
      this.maqbodega.ProcesoTransdferenciaBod(this.listaprocesotransferencia).subscribe({
        next:(x)=>{
          console.warn('Transferencia entre bodegas ha sido exitosa')
          this._show_spinner = false;
          this.ordenesTransferenciaLista = x;
          if( state == 1 ) {
            Swal.fire(
              'Agregado a la pretransferencia ',
              '',
              'success'
            )
          }else if ( state == 2 ) {
            Swal.fire(
              'Transferencia exitosa!',
              this.itemsBodegaTransferencia.length + ' producto(s) transferidos de la bodega ' + this.codigobodegaselect + ' hacia la bodega ' + this.bodegasFormTransfer.controls['bodegaentrada'].value,
              'success'
            )
          }
        }, error: (e) => {
          console.error(e);
          this._show_spinner = false;
          
          if( state == 1) {
            Swal.fire(
              '¿No haz entrado al modo de transferencia?',
              'Para agregar a la pretransferencia necesitas escojer bodega de entrada. Ingresa dando click derecho al producto guardado y escoje la opción Transferir.',
              'question'
            )            
          } else if (state == 2) {
            Swal.fire(
              'Oops!',
              'Algo ha ocurrido con la transferencia',
              'error'
            )
          }
        }, complete: () => {
          this.obtenerItemsBodTransferencia();
          this.obtenerItems();
          this.validationTransfrBod();
          // if     ( state == 0 ) this._dis_button_transfer = false;
          // else if( state == 1 ) this._dis_button_transfer = false;
          // else if( state == 2 ) this._dis_button_transfer = true;
        }
      })
    }    
  }

  _select_lote: boolean = false;
  _show_transfer: boolean = false;
  modoTransferencia() {
    this._select_lote = true;
    this._show_transfer = true;    
    this.bodegasFormTransfer.controls['bodegasalida'].setValue(this.bodegaselect);
    const arrayval: any = [];    
    this.filteredBodegas.filter((element:any)=>{
      if(element.id !== this.codigobodegaselect) {
        arrayval.push(element);
      }
    }) 
    this.filteredBodegas = arrayval;
  }

  guardarAsignacion(data:any) {

    if ( this.codBodega == 0 ) {
      Swal.fire(
        'Bodega sin seleccionar',
        'El item se puede agregar por que no has seleccionado una bodega a donde transferir.',
        'warning'
      )
    }
    else {
      this._show_spinner = true;
      let xuser: any = sessionStorage.getItem('UserCod');
      this.modelItemBodega = {
        codmaquinaria: data.codmaquina,
        codbodega:     this.codBodega,
        fecrea:        new Date(),
        coduser:       xuser,
        estado:        0
      }

      setTimeout(()=>{
        this.obtenerAnimacion('contain'+this.codBodega);
      },500);

      this.maqbodega.guardarItemBodega(this.modelItemBodega).subscribe({
        next: (x) => {

          Toast.fire({
            icon: 'success',
            title: 'Item: '+data.nombretipomaquina+' agregada'
          })

          this._show_spinner = false;

        },error: (e) => {
          console.error(e);
          Swal.fire(
            'Opps!',
            'El item no se ha podido guardar',
            'error'
          )

          this._show_spinner = false;
        },
        complete: () => {           
          this.obtenerMaquinaria(this.selectViewState);
          this.obtenerBodegas();
          this.limpiar();
        }
      })
    }
  }

  // filterMaquinariasBodegas(searchTerm: string) {
  //   console.warn(this.listaMaquinaBodegas);
  //   if (searchTerm) {
  //     this.listaMaquinaBodegas = this.listaMaquinaBodegasGhost.filter((maquina: any) =>
  //       maquina.nserie.toLowerCase()       
  //              .includes(searchTerm.toLowerCase()) ||
  //       maquina.tipoMaquinas.toLowerCase() 
  //              .includes(searchTerm.toLowerCase())
  //     );
  //     // console.log('listaMaquinaBodegas filtrando');
  //     // console.log(this.listaMaquinaBodegas);
  //   } else {      
  //     this.listaMaquinaBodegas = this.listaMaquinaBodegasGhost;
  //     // console.log('listaMaquinaBodegas devuelve todo');
  //     // console.log(this.listaMaquinaBodegas);
  //   }
  // }


  filterMaquinariasBodegas(searchTerm: string) {    

    console.log(searchTerm)
    console.log(this.listaMaquinaBodegasGhost)
    if (searchTerm) {      
      this.listaMaquinaBodegas = this.listaMaquinaBodegasGhost.filter( (maquina:any) =>
        maquina.nombremaquina.toLowerCase()
                  .includes(searchTerm.toLowerCase()) 
                  ||
        maquina.marca.toLowerCase()
                  .includes(searchTerm.toLowerCase())
                  ||
        maquina.nserie.toLowerCase()
                  .includes(searchTerm.toLowerCase())
                  ||
        maquina.modelo.toLowerCase()
                  .includes(searchTerm.toLowerCase())
      );  
    } else {
      this.listaMaquinaBodegas = this.listaMaquinaBodegasGhost;
    }  

    console.warn('this.listaMaquinaBodegas');
    console.warn(this.listaMaquinaBodegas);

  }
  
  
   

  eliminarItemBodega(data:any) {
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
        // this.listaMaquinaBodegasGhost = [];
        // this.listaMaquinaBodegas = [];
        this.maqbodega.eliminarItemBodega( data.codmaquinariabodega ).subscribe({
          next: (x) => {
            this._show_spinner = false;
            Swal.fire(
              'Deleted!',
              'Item: '+ data.nombremaquina +' eliminado',
              'success'
            )
          }, error: (e) => {
            console.error(e);
            this._show_spinner = false;
            Swal.fire(
              'Upps!',
              'No hemos podido eliminar este item',
              'error'
            )
          }, complete: () => {
            this.obtenerItems();
            this.obtenerMaquinaria(this.selectViewState);
            this.obtenerBodegas();
            this.limpiar();
          } 
        })
      }
    })
  }

  obtenerAnimacion(id:any) {
    let a = <HTMLDivElement> document.getElementById(id) ;
    // console.warn(a);

    const c: any = document.createElement('div');
    c.setAttribute('class', 'img-caja');
    c.style.width     = '60px';
    c.style.height    = '60px';
    c.style.animation = 'ease-in 1.5s 1';
    c.style.animationName = 'animatedcaja';
    c.style.position = 'absolute';
    c.style.transform = 'translateX(40px)';
    c.style.transform = 'scale(0)';
    c.style.top = '158px';
    c.style.left = '60px';
    
    a.appendChild(c);
    const i: any = document.createElement('img');
    i.setAttribute('src', '../../../../../../assets/palets.png');
    i.setAttribute('width', '100%');
    c.appendChild(i);
    setTimeout(() => {
      c.transform = 'translateX(40px)';
      c.transform = 'scale(0)';
      c.opacity   = '0';
      c.removeChild(i);
      a.removeChild(c);
    }, 1500);


  }

  itemsBodegaTransferencia: any = [];
  itemsBodegaTransferenciaGhost: any = [];
  obtenerItemsBodTransferencia() {
    this._show_spinner = true;
    console.log(this.codigobodegaselect);

    if( this.itemsBodegaTransferencia.length < 1 ) {

      this._dis_button_transfer = true;

    }

    // let data = this.maquinabodegaForm.controls['nombre'].value;
    this.maqbodega.obtenerItemsBodega( this.codigobodegaselect, 1 ).subscribe({

      next:(itemstransfer) => {
        this.itemsBodegaTransferenciaGhost = itemstransfer;
        this.itemsBodegaTransferencia = itemstransfer;
        this._show_spinner = false;
      },error: (e) => {
        console.error(e);
        this._show_spinner = false;
      },complete: () => {
        this.validationTransfrBod();
      }

    })
  }

  bodegaselect: string = ''
  codigobodegaselect: number = 0;
  obtenerItems() {

    this._boxa                    = false;
    this._width_boxb              = 'w-100';
    this._img_bodegas             = false;
    this._view_palets             = true;
    this.listaMaquinaBodegasGhost = [];
    this.listaMaquinaBodegas      = [];
    let data = this.maquinabodegaForm.controls['nombre'].value
    this.bodegaselect = data.nombrebodega;
    this.codigobodegaselect = data.id;
    this.obtenerItemsBodTransferencia()
    this.maqbodega.obtenerItemsBodega( data.id, 0 ).subscribe({      
      next: (itemsBodega) => {        
        this.listaMaquinaBodegasGhost = itemsBodega;
        this.listaMaquinaBodegasGhost.filter( (element:any) => {

          let array = {            
              "nserie":               element.nserie,
              "modelo":               element.modelo.trim(),
              "marca":                element.marca.trim(),
              "contadorinicial":      element.contadorinicial,
              "contadorfinal":        element.contadorfinal,
              "nombremaquina":        element.nombremaquina,
              "tipoMaquinas":         element.codtipomaquina.trim(),
              "codmaquinaria":        element.codmaquinaria,
              "codbodega":            element.codbodega,
              "fecrea":               element.fecrea,
              "codmaquinariabodega":  element.codmaquinariabodega,
              "coduser":              element.coduser,
              "menuAbierto":          true,
              "estado":               element.estado,
              "nombremodelo":         element.nombremodelo,
              "nombremarca":          element.nombremarca
          }

          this.listaMaquinaBodegas.push(array);

        })
        
        console.warn(this.listaMaquinaBodegas);

      }
    })
  }


  codmaquinaria: string = '';
  openMenu(event: MouseEvent, item: any): void {
    event.preventDefault();
    this.codmaquinaria = item.codmaquinaria
    console.log( this.codmaquinaria );
    // Cerrar los menús desplegables de los demás elementos
    this.listaMaquinaBodegas.forEach((elemento:any) => {

      if (elemento !== item) {
        elemento.menuAbierto = false;
      }

    });
    
    item.menuAbierto = true;
    this.contextMenu.openMenu();

  }

  verDetallePalets( data:any, option:number ) {
    switch(option) {
      case 1:
        this._view_details_palets = true;

        console.warn(data);

        this.maquinaria.ObtenerMaquinaUnit( data.tipoMaquinas.trim(), data.marca.trim(), data.modelo.trim(), 2, this.codmaquinaria ).subscribe({
          next:(maquina) => {
            this.listMaquinaUnit = maquina;
            console.warn(this.listMaquinaUnit);
          }
        })
        break;
      case 2:
        this._view_details_palets = false;
        break;
    }
  }

  onSubmit() {}

}
