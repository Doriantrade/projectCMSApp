import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SharedService } from 'src/app/components/shared/services/shared.service';

import Swal from 'sweetalert2'
import { MaquinariaService } from './services/maquinaria.service';
import { Console, error, warn } from 'console';
import { ImagecontrolService } from 'src/app/components/shared/image-control/services/imagecontrol.service';
import { ClienteService } from '../clientes/services/cliente.service';
import { ProductosBodegaService } from '../bodegas/productos-bodega/services/productos-bodega.service';

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

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}



@Component({
  selector: 'app-maquinaria',
  templateUrl: './maquinaria.component.html',
  styleUrls: ['./maquinaria.component.scss']
})
export class MaquinariaComponent implements OnInit {
  pMod: number = 4;


  listaClientes: any = [];
  filteredAgencias: any = [];
  filteredcliente: any = [];
  clientes: any[] = [];
  agencia: any[] = [];

  public agenciaForm = new FormGroup({
    codagencia:        new FormControl(''),
    codcliente:        new FormControl(''),
  })

  _maquinaAgencia:any;
  _IMGE:any;

  tipoMaquinaLista: any = []; 
  maquinariaLista: any = [];

  _cancel_button:     boolean = false;
  _icon_button:       string = 'add';
  _action_butto:      string = 'Crear';
  _delete_show:       boolean = true;
  ccia:               any;
  _show_form:         boolean = false;
  
  _show_spinner:      boolean = false;
  @Input() modulo: any = [];

  sgrupolista: any = [];
  grupolista: any = [];
  modeloActivo:   any = null;

  columnHead:         any = [ 'edit', 'nombretipomaquina', 'marca', 'modelo', 'ninventario', 'nserie', 'codigobp', 'continicial', 'contfinal', 'observacion', 'icon' ];
  public dataSource!: MatTableDataSource<any>;

  
  dataEmitter: any = {};
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  modelMaquinaria: any = [];

  public maquinariaForm = new FormGroup({
    observacion:                 new FormControl(''),
    modelo:                      new FormControl(''),
    marca:                       new FormControl(''),
    nserie:                      new FormControl(''),
    ninventario:                 new FormControl(''),
    codtipomaquina:              new FormControl(''),
    codigobp:                    new FormControl(''),
    contadorinicial:             new FormControl(),
    contadorfinal:               new FormControl(), 
    codmarca:                    new FormControl(),
    codmodelo:                   new FormControl(),
    estado:                      new FormControl(),
  })

  constructor(  private maqbodega: ProductosBodegaService, private client: ClienteService, private DataMaster: SharedService, private fileserv: ImagecontrolService, private maquinaria: MaquinariaService ) { }
  xuser: any = '';
  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    this.xuser = sessionStorage.getItem('UserCod');
    this.ccia = sessionStorage.getItem('codcia');
    this.getDataMaster('MQT');
    this.obtenerMaquinaria();
  }

  _showcliente:boolean = false;
  validateEstadoasignMaquina() {
    // console.warn(this._maquinaAgencia);
    if(this._maquinaAgencia) {
      this._showcliente = true;
      setTimeout(() => {
        this.obtenerCliente();
      }, 500);
    }
    else if( !this._maquinaAgencia ) {
      this._showcliente = false;
      this._show_form_agency = false;
      this._show_data_asign = false;
      this.maquinariaAsignada = [];
      return;
    }
  }

  obtenerCliente() {
    this._show_spinner = true;
    this.client.obtenerClientes(this.ccia,1).subscribe({
      next: (x) => {
        this._show_spinner = false;
        if (Array.isArray(x)) {
          this.listaClientes = x;
          console.log(this.listaClientes);

          this.listaClientes.filter((element:any)=>{            
              let arr = {
                name: element.nombre, code: element.codcliente, idbod: element.idbodega
              }
              this.clientes.push(arr);            
          })
          console.warn(this.clientes);
        }

      }, complete: () => {
        // console.log(this.agenciaForm.controls['codagencia'].value);
        this.filteredAgencias = [];
        // this.filtered = [];
        this.agencia = [];

        this.obtenerAgencias();

      }, error: (e)  => {
        console.error(e);
        this._show_spinner = false;
      }
    })
  }

  filterCliente(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query.toLowerCase();
  
    for (let i = 0; i < this.clientes.length; i++) {
      let cliente = this.clientes[i];
      if (cliente.name.toLowerCase().includes(query)) {
        filtered.push(cliente);
      }
    }

    this.filteredcliente = filtered;
    console.warn(this.filteredcliente)
    // console.log(this.filteredcliente);
  
  }


  filterAgencia(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let agencies: any = [];
    let query = event.query;

    for (let i = 0; i < (this.agencia as any[]).length; i++) {
        agencies = (this.agencia as any[])[i];
        if (agencies.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
            filtered.push(agencies);
        }
    }

    this.filteredAgencias = filtered;

  }

  listAgencias: any = [];
  obtenerAgencias() {

      this.client.obtenerAgencias( this.ccia, this.agenciaForm.controls['codcliente'].value.code.trim(), '777').subscribe((x) => {
        if (Array.isArray(x)) {
          this.agencia = [];
          this.listAgencias = x;
          this.listAgencias.filter((element:any) => {
              let arr = {
                name: element.nombre, code: element.codagencia, nmaquinas: element.cantidadMaquinaAgencia
              }
              this.agencia.push(arr);
          });
          console.warn(this.agencia);
        }
      });
  }

  _show_form_agency :boolean = false;
  validationCliente() {
    console.warn(this.agenciaForm.controls['codcliente'].value)
    if( this.agenciaForm.controls['codcliente'].value.code == undefined || this.agenciaForm.controls['codcliente'].value.code == null || this.agenciaForm.controls['codcliente'].value.code == '' ) {
      this._show_form_agency = false;
      // this.obtenerAgencias();
    }
    else {
      this._show_form_agency = true
      this.obtenerAgencias();
    }

  }
  _show_btn_asign:boolean = true;
  validacionBtnAsign() {

    console.warn(this.agenciaForm.controls['codagencia'].value)
    console.warn(this.agenciaForm.controls['codagencia'].value.length)

    if( this.agenciaForm.controls['codagencia'].value.lenght != 0 ) {
      this._show_btn_asign = true;
    }

  }

  maquinariaAsignada:any = [];
  clientesAsignado: string = '';
  agenciaAsignada:  string = '';
  _show_data_asign:boolean = false;
  automatizacionAsignacionMaquinaria() {
    this.maquinariaAsignada = [];
    this.maquinariaAsignada = {
      cliente: this.agenciaForm.controls['codcliente'].value,
      agencia: this.agenciaForm.controls['codagencia'].value
    }

    this.clientesAsignado = this.maquinariaAsignada.cliente.name;
    this.agenciaAsignada = this.maquinariaAsignada.agencia.name;
    console.warn(this.clientesAsignado);
    console.warn(this.agenciaAsignada);
    
    this._show_form_agency = false;
    this._showcliente = false;
    this._show_data_asign = true;

  } 

  onSubmit() {
    
    switch(this._action_butto) {
      case 'Crear':
        this.guardarMaquinaria();
        break;
      case 'Actualizar':
        this.editarMaquinaria();
        break;
    }

  }

  validatePersonal() {
    let xtipo: any = sessionStorage.getItem('tipo');
    if(xtipo.trim() == '001') {
      this._delete_show = true;
    } else {
      this._delete_show = false;
    }
  }

  /** OBTENER TIPO DE MAQUINAS */
  getDataMaster(cod:string) {
    this.DataMaster.getDataMaster(cod).subscribe({
      next: (data) => {
        switch(cod) {
          case 'MQT':
            this.tipoMaquinaLista = data;
            break;
        }
      }
    }) 
  }



  /** OBTENER MARCA */
  codtipomaquinaValue:any;
  getGrupos() {
    console.log("📌 Se ejecutó getGrupos()");
  
    this.grupolista = [];
    this.sgrupolista = [];
    this.maquinariaForm.controls['marca'].setValue('');
    this.maquinariaForm.controls['codmarca'].setValue('');
    this.maquinariaForm.controls['modelo'].setValue('');
    this.maquinariaForm.controls['codmodelo'].setValue('');
  
    this.codtipomaquinaValue = this.maquinariaForm.controls['codtipomaquina'].value?.trim();
  
    console.log("📌 Código de maquinaria seleccionado:", this.codtipomaquinaValue);
  
    this.DataMaster.getDataMasterGrupo(this.codtipomaquinaValue).subscribe({
        next: (grupo) => {
            console.log("📌 Respuesta del servidor:", grupo);
            this.grupolista = grupo;
  
            // 🔹 Si hay elementos en grupolista, selecciona el primero automáticamente
            if (this.grupolista.length > 0) {
                this.maquinariaForm.controls['marca'].setValue(this.grupolista[0].codmarca);
            }
  
            console.log("📌 Marcas en grupolista:", this.grupolista);
        },
        error: (err) => console.error("❌ Error en getDataMasterGrupo:", err),
        complete: () => { console.log("✅ getGrupos() completado"); }
    });
  }


  /** OBTENER MODELOS */
  getSubgrupos() {
    this.maquinariaForm.controls['codmarca'].setValue(this.maquinariaForm.controls['marca'].value);
    let grupo: any = this.codtipomaquinaValue;
    let subgrupo: any = this.maquinariaForm.controls['marca'].value;
  
    console.log("📌 getSubgrupos() ejecutado");
    console.log("📌 Grupo:", grupo, "Subgrupo:", subgrupo);
  
    this.DataMaster.getDataMasterSubGrupo(grupo.trim(), subgrupo.trim()).subscribe({
        next: (sgrupo) => {
            console.log("📌 Modelos recibidos:", sgrupo);
            this.sgrupolista = sgrupo;
  
            // 🔹 Si hay modelos en la lista, seleccionar el primero automáticamente
            if (this.sgrupolista.length > 0) {
                this.maquinariaForm.controls['codmodelo'].setValue(this.sgrupolista[0].codmodelo);
            }
        },
        error: (err) => console.error("❌ Error en getDataMasterSubGrupo:", err),
        complete: () => {
          console.log("✅ getSubgrupos() completado")
          // this.obtenerCodigoModelo(  )
          this.obtenerImagen()
        }
    });
  }

  obtenerCodigoModelo(event: any) {
// alert('Obteniendo modelo: ' + event)


    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value; // Obtiene el valor del modelo seleccionado
  
    console.log("Modelo seleccionado:", selectedValue);
  
    if (!selectedValue) {
      console.warn("⚠ Modelo vacío, no se puede asignar.");
      return;
    }
  
    this.maquinariaForm.controls['codmodelo'].setValue(selectedValue); // Asigna el valor al FormControl
    this.obtenerImagen(); // Llama obtenerImagen() después de actualizar el modelo
  }
  
  

  codec:any;
  obtenerImagen() {
    // Obtener los valores del formulario de manera segura
    const tipoMaquina = this.maquinariaForm.controls['codtipomaquina'].value || '';
    const marca = this.maquinariaForm.controls['codmarca'].value || '';
    const modelo = this.maquinariaForm.controls['codmodelo'].value || '';
  
    // Concatenar el código
    this.codec = `${tipoMaquina.toString().trim()}-${marca.toString().trim()}-${modelo.toString().trim()}`;
  
    console.log("Código generado para la imagen:", this.codec);
  
    // Verifica que el modelo no sea vacío antes de llamar a la API
    if (!modelo) {
      console.warn("⚠ No se puede obtener imagen: Modelo vacío");
      return;
    }
  
    this.fileserv.obtenerImagenCodBinding(this.codec, 'Maquinaria').subscribe({
      next: (imagen: any) => {
        if (imagen && imagen.length > 0 && imagen[0].imagen) {
          this._IMGE = imagen[0].imagen;
        } else {
          console.warn("⚠ No se encontró imagen para:", this.codec);
          this._IMGE = ''; // ❌ No asignamos ninguna imagen si no se encuentra
        }
      },
      error: (err) => {
        console.error("❌ Error al obtener la imagen:", err);
        this._IMGE = ''; // ❌ No mostramos nada si hay un error
      }
    });
  }
  
  

  /**GUARDAR MAQUINARIA */
  modelItemBodega:any = [];
  modeloMaquinaAgencia:any = [];
  guardarMaquinaria() {



    if ( this.maquinariaForm.controls['codtipomaquina'].value == undefined ||
         this.maquinariaForm.controls['codtipomaquina'].value == null ||
         this.maquinariaForm.controls['codtipomaquina'].value == ''  )  Toast.fire({ icon: 'warning', title: 'El tipo de maquina no debe estar vacío' })
    else if ( this.maquinariaForm.controls['codmarca'] .value == undefined || this.maquinariaForm.controls['codmarca'].value == null || this.maquinariaForm.controls['codmarca'].value == ''  )  Toast.fire({ icon: 'warning', title: 'La marca de la maquina no debe estar vacío' })
    else if ( this.maquinariaForm.controls['codmodelo'].value == undefined || this.maquinariaForm.controls['codmodelo'].value == null || this.maquinariaForm.controls['codmodelo'].value == ''  )  Toast.fire({ icon: 'warning', title: 'El modelo de la maquina no debe estar vacío' })
    else {
     
      this._show_spinner = true;
      const cliente = this.maquinariaForm.controls['codtipomaquina'].value;
      const token: string = 'MAQ-'+cliente+'-'+this.DataMaster.generateRandomString(15);

      // console.warn('ESTADO MAQUINA');
      // console.warn(this.maquinariaForm.controls['estado'].value);

      let estado:any;

      this.modelMaquinaria = {
        "codmaquina":       token,
        "codtipomaquina":   this.maquinariaForm.controls['codtipomaquina'].value.trim(),
        "observacion":      this.maquinariaForm.controls['observacion'].value,
        "modelo":           this.maquinariaForm.controls['codmodelo'].value,
        "marca":            this.maquinariaForm.controls['codmarca'].value,
        "nserie":           this.maquinariaForm.controls['nserie'].value,
        "ninventario":      this.maquinariaForm.controls['ninventario'].value,
        "codigobp":         this.maquinariaForm.controls['codigobp'].value,
        "codusercrea":      this.xuser,
        "feccrea":          new Date(),
        "codcia":           this.ccia,
        "contadorinicial":  this.maquinariaForm.controls['contadorinicial'].value || 0,
        "contadorfinal":    this.maquinariaForm.controls[ 'contadorfinal' ].value || 0,
        "estado":           estado,
        "valorCompra":      0.0,
        "porcentajeVenta":  0.0,
        "desccuentoAplicable": 0.0,
        "vidautil":         0.0
      }

      this.maquinaria.guardarMaquinaria( this.modelMaquinaria ).subscribe(
        {
          next: (x) => {
            this._show_spinner = false;
            Swal.fire(
              'Máquina agregada',
              'La máquina con número de serie '+this.maquinariaForm.controls['nserie'].value+' se ha guardado con éxito',
              'success'
            )
          }, error: (e) => {
            console.error(e);
            this._show_spinner = false;
            Swal.fire(
              'Oops!',
              'Esta máquina no se ha podido guardar',
              'error'
            )
          }, complete: () => {
            this.obtenerMaquinaria();
            this.limpiar();
          }
        }
      )

        console.warn('**************************************')
        console.warn(this.maquinariaAsignada)
        console.warn(this.maquinariaAsignada.cliente)
        console.warn(this.maquinariaAsignada.cliente.idbod)
        console.warn('**************************************')

      if(this._maquinaAgencia) { 

        /**Guardamos en la bodega del cliente directamente */
        //#region 
        let xuser:any = sessionStorage.getItem('UserCod');
        let xusernombre:any = sessionStorage.getItem('UserName');
        this.modelItemBodega = {
          codmaquinaria: token,
          codbodega:     this.maquinariaAsignada.cliente.idbod,
          fecrea:        new Date(),
          coduser:       xuser,
          estado:        0
        }
  
        this.maqbodega.guardarItemBodega(this.modelItemBodega).subscribe({
          next: (x) => {
  
            Toast.fire({
              icon: 'success',
              title: 'Maquinaria agregada a bodega'
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
            // this.obtenerMaquinaria(this.selectViewState);
            // this.obtenerBodegas();
            // this.limpiar();
          }
        })
        //#endregion
        
        /**Asignamos la maquina a la agencia elegida */
        this.modeloMaquinaAgencia = {
          "codprod": token,
          "codagencia": this.maquinariaAsignada.agencia.code,
          "fecasign": new Date(),
          "codusercrea": xuser,
          "estado": 1,
          "observacion": 'Guardado automatizado desde el modulo de maquiaria el ' + new Date() + ' por ' + xusernombre,
          "ccia": this.ccia,
        }
    
        console.warn('modeloMaquinaAgencia');
        console.warn(this.modeloMaquinaAgencia);
    
        this.client.guardarMagencia(this.modeloMaquinaAgencia).subscribe({
          next:() => {
            Toast.fire({
              icon: 'success',
              title: 'Maquina asignada'
            })
          },
          complete: () => {
          },
          error: (e) => {
            Toast.fire({
              icon: 'error',
              title: 'No se ha podido asignar'
            })
          }
        })

      }

     }

     
    
  }

  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  
  maquinariaListaGhost:any = [];
  obtenerMaquinaria() {

    let controlFecha = new Date();
    let dia = controlFecha.getDay();
    let mes = controlFecha.getMonth() + 1;
    let anio = controlFecha.getFullYear();
    let diaActual = anio+'-'+mes.toString().padStart(2, '0')+'-'+dia.toString().padStart(2,'0');

    this._show_spinner = true;
    this.maquinariaLista = [];
    this.maquinaria.obtenerMaquinaria( this.ccia ).subscribe({
      next: (maquinas) => {
        this._show_spinner = false;
        // this.maquinariaLista = maquinas;
        this.maquinariaListaGhost =  maquinas
        this.maquinariaListaGhost.filter((element:any)=>{
          let arrmaq = {
            "numeroContrato": element.numeroContrato,
            "fecInicialContrato": element.fecInicialContrato,
            "fecfinalContrato": element.fecfinalContrato,
            "descripcion": element.descripcion,
            "observacion": element.observacion,
            "codmaquina": element.codmaquina,
            "codtipomaquina": element.codtipomaquina,
            "nombretipomaquina": element.nombretipomaquina,
            "codigobp": element.codigobp,
            "nserie": element.nserie,
            "codmarca": element.codmarca,
            "marca": element.marca,
            "ninventario": element.ninventario,
            "codcia": element.codcia,
            "contadorinicial": element.contadorinicial,
            "contadorfinal": element.contadorfinal,
            "feccrea": element.feccrea,
            "codmodelo": element.codmodelo,
            "modelo": element.modelo,
            "textestado": '',
            "colorestado": '',
            "colorText": '',
            "icon": 'done',
            "nombreCliente": element.nombreCliente,
            "estado": element.estado,
            "colorEstadoObsoleto": ""
        }

        let fechafinal = element.fecfinalContrato.toString().split('T')

          if( diaActual > fechafinal[0] ) {
            arrmaq.textestado  = 'Activo';
            arrmaq.colorestado = 'yellowgreen';
            arrmaq.colorText   = 'whitesmoke';
            arrmaq.icon        = 'task';
          }
          else {
            arrmaq.textestado  = 'No Activo';
            arrmaq.colorestado = 'orangered';
            arrmaq.colorText   = 'gray';
            arrmaq.icon        = 'event_busy';
          }

          this.maquinariaLista.push(arrmaq);

      })

        console.log('LISTA MAQUINARIA GUARDADO');
        console.log(this.maquinariaLista);

      },
      error: (e) => {
        this._show_spinner = false;
        console.error(e);
      },
      complete: () => {

        this.maquinariaLista.filter ((element:any)=>{
          if ( element.estado == 0 ) {
            element.colorEstadoObsoleto = 'transparent';
            // console.log(element.estado);
            // console.log(element.colorEstadoObsoleto);
          }
          else if (element.estado == 1) {
            element.colorEstadoObsoleto = 'orange';
            // console.log(element.estado);
            // console.log(element.colorEstadoObsoleto);
          }
        })

        this.dataSource = new MatTableDataSource(this.maquinariaLista);
        this.dataSource.paginator = this.paginator;
      }
    })
  }

  
  capturainfo(data:any) {

    for ( let i = 0; i<=1; i++ ) {
      this.catchData(data);
    }

  }

  limpiar() {
    this.maquinariaForm.controls['codtipomaquina'].setValue('');
    this.maquinariaForm.controls['observacion'].setValue('');
    this.maquinariaForm.controls['modelo'].setValue('');
    this.maquinariaForm.controls['codmodelo'].setValue('');
    this.maquinariaForm.controls['marca'].setValue('');
    this.maquinariaForm.controls['codmarca'].setValue('');
    this.maquinariaForm.controls['nserie'].setValue('');
    this.maquinariaForm.controls['ninventario'].setValue('');
    this.maquinariaForm.controls['codigobp'].setValue('');
    this.maquinariaForm.controls['contadorinicial'].setValue(0);
    this.maquinariaForm.controls['contadorfinal'].setValue(0);
    this._action_butto      = 'Crear';
    this._icon_button       = 'add';
    this._cancel_button     = false;  
    this._IMGE = '';
    this.sgrupolista = [];
    this.grupolista = [];
    this.maquinariaForm.controls['estado'].setValue(false);
    this._show_form= false;
  }

  validacionMenorContador() {
    
    setTimeout(() => {
      if(this.maquinariaForm.controls['contadorfinal'].value < this.maquinariaForm.controls['contadorinicial'].value) {
        this.maquinariaForm.controls['contadorfinal'].setValue(0);
      }
    }, 2000);

  }


  editarMaquinaria() {
    
    if ( this.maquinariaForm.controls['codtipomaquina'].value == undefined || this.maquinariaForm.controls['codtipomaquina'].value == null || this.maquinariaForm.controls['codtipomaquina'].value == ''  )  Toast.fire({ icon: 'warning', title: 'El tipo de maquina no debe estar vacío' })
    
    else if ( this.maquinariaForm.controls['codmarca'].value == undefined  || this.maquinariaForm.controls['codmarca'].value == null || this.maquinariaForm.controls['codmarca'].value == ''  )  Toast.fire({ icon: 'warning', title: 'La marca de la maquina no debe estar vacío' })
    else if ( this.maquinariaForm.controls['codmodelo'].value == undefined || this.maquinariaForm.controls['codmodelo'].value == null || this.maquinariaForm.controls['codmodelo'].value == ''  )  Toast.fire({ icon: 'warning', title: 'El modelo de la maquina no debe estar vacío' })
    
    else {

      if (this.maquinariaForm.controls['estado'].value) this.estadoMaquina = 1
      else if (!this.maquinariaForm.controls['estado'].value) this.estadoMaquina = 0

      this._show_spinner = true;
      this._show_form= true;
      this.modelMaquinaria = {
        "codmaquina":       this.codmaquinaria,
        "codtipomaquina":   this.maquinariaForm.controls['codtipomaquina'].value.trim(),
        "observacion":      this.maquinariaForm.controls['observacion'].value,
        "modelo":           this.maquinariaForm.controls['codmodelo']  .value,
        "marca":            this.maquinariaForm.controls['codmarca']   .value,
        "nserie":           this.maquinariaForm.controls['nserie']     .value,
        "ninventario":      this.maquinariaForm.controls['ninventario'].value,
        "codigobp":         this.maquinariaForm.controls['codigobp']   .value,
        "codusercrea":      this.xuser, 
        "feccrea" :         new Date(),
        "codcia":           this.ccia,
        "contadorinicial":  this.maquinariaForm.controls['contadorinicial'].value || 0,
        "contadorfinal":    this.maquinariaForm.controls['contadorfinal']  .value || 0,
        "estado":           this.estadoMaquina,
        "valorCompra":      0.0,
        "porcentajeVenta":  0.0,
        "desccuentoAplicable": 0.0,
        "vidautil":         0.0
      }

      console.warn('MAQUINARIA');
      console.warn(this.modelMaquinaria);

      this.maquinaria.putMaquinaria( this.codmaquinaria, this.modelMaquinaria ).subscribe({

        next: (x) => {
          this._show_spinner = false;
          Swal.fire(
            'Máquina : ' + this.nombreMaquinaria + ' actualizada. ',
            'La máquina con número de serie '+this.maquinariaForm.controls['nserie'].value+' se ha actualizado con éxito',
            'success'
          )
        }, error: (e) => {
          console.error(e);
          Swal.fire(
            'Oops!',
            'Esta máquina no se ha podido guardar',
            'error'
          )
        }, complete: () => {
          this.obtenerMaquinaria();
          this.limpiar();
        }

      })
    }
  }

  codmaquinaria: string = '';
  maquinariaModel: any = [];
  nombreMaquinaria: string = '';
  estadoMaquina:any;
  catchData(data: any) {    

    console.log(data)

    this.maquinariaForm.controls['codtipomaquina'].setValue(data.codtipomaquina.trim());

    this.getGrupos();
    this.maquinariaForm.controls['marca'].setValue(data.codmarca.trim());
    this.maquinariaForm.controls['codmarca'].setValue(data.codmarca.trim());
    this.getSubgrupos();
    this.maquinariaForm.controls['modelo'].setValue(data.codmodelo.trim());
    this.maquinariaForm.controls['codmodelo'].setValue(data.codmodelo.trim());


    this.maquinariaForm.controls['observacion'].setValue(data.observacion);
    this.maquinariaForm.controls['nserie'].setValue(data.nserie);
    this.maquinariaForm.controls['ninventario'].setValue(data.ninventario);
    this.maquinariaForm.controls['codigobp'].setValue(data.codigobp);
    this.maquinariaForm.controls['contadorinicial'].setValue(data.contadorinicial);
    this.maquinariaForm.controls['contadorfinal'].setValue(data.contadorfinal);
    this.codmaquinaria    = data.codmaquina;
    this._icon_button     = 'sync_alt';
    this._action_butto    = 'Actualizar';
    this._cancel_button   = true;
    this.nombreMaquinaria = data.nombretipomaquina;
    
    this.maquinariaForm.controls['estado'].setValue( data.estado );

    // if(this.maquinariaForm.controls['estado'].value) {
    //   this.maquinariaForm.controls['estado'].setValue(false);
    // }else {
    //   this.maquinariaForm.controls['estado'].setValue(true);
    // }
    console.warn('******************************************')
    console.log(this.maquinariaForm.controls['estado'].value)
    console.warn('******************************************')

    this.obtenerImagen();

  }

  eliminarMaquinaria(data:any) {
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
        
        this.maquinaria.eliminarMaquinaria( data.codmaquina ).subscribe({
          next: (x) => {
            this._show_spinner = false;
            Swal.fire(
              'Deleted!',
              'Máquina: '+ data.nombretipomaquina +' eliminado',
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
            this.obtenerMaquinaria();
          } 
        })
      }
    })
  }
  onMaquinariaChange(event: any) {
    this.getGrupos();
    setTimeout(() => {
      this.getSubgrupos(); // 🔹 Ahora también actualiza bodegas
    }, 100);
  }
  
  // 🔹 Nueva función para asignar el primer modelo
  asignarPrimerModelo() {
    if (this.sgrupolista && this.sgrupolista.length > 0) {
      console.log("Asignando modelo:", this.sgrupolista[0].codmodelo); // ✅ Para depuración
      this.maquinariaForm.controls['codmodelo'].setValue(this.sgrupolista[0].codmodelo);
    } else {
      console.warn("⚠ No hay modelos disponibles para asignar.");
    }
  }
  
  validarEntradaNumerica(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight']; // Permitir teclas básicas
    const key = event.key;
  
    // Permitir solo números y teclas de control
    if (!/^\d$/.test(key) && !allowedKeys.includes(key)) {
      event.preventDefault(); // Bloquear cualquier otro carácter
    }
  }
  
  // Evita caracteres especiales en número de serie, inventario y código BP
  validarTextoSinCaracteresEspeciales(event: KeyboardEvent) {
    const regex = /^[a-zA-Z0-9-]+$/; // Permite letras, números y el signo menos (-)
    const key = event.key;
  
    // ✅ Permitir letras, números, el signo menos (-) y teclas de control (Backspace, Tab, Flechas)
    if (!regex.test(key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      event.preventDefault();
    }
  }
  
  validarContador(event: any) {
    let input = event.target;
    let valor = input.value;

    // 🔹 Permitir solo números (elimina signos negativos y caracteres especiales)
    valor = valor.replace(/[^0-9]/g, '');

    // 🔹 Si el valor es vacío, lo deja en 0
    input.value = valor !== '' ? Math.max(0, parseInt(valor, 10)).toString() : '0';
}

  
  
}
