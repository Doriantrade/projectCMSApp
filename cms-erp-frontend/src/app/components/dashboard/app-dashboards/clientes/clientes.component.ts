import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ClienteService } from './services/cliente.service';
import { SharedService } from 'src/app/components/shared/services/shared.service';
import Swal from 'sweetalert2'
import { ImagecontrolService } from 'src/app/components/shared/image-control/services/imagecontrol.service';
import { CrearBodegasService } from '../bodegas/crear-bodegas/services/crear-bodegas.service';
import { environment } from 'src/environments/environment.prod';

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
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})

export class ClientesComponent implements OnInit {
  pMod: number = 4;


  env = environment.image_url;

  nonuser:any = '../../../../../assets/non-user.webp';

  codCliCatch:        string = '';
  _delete_show:       boolean = true;
  ccia:               any;
  _cancel_button:     boolean = false;
  _icon_button:       string = 'add';
  _action_butto:      string = 'Crear';
  tipoEmpresaLista:   any = [];
  _show_spinner:      boolean = false;
  _show_form:         boolean = false;
  columnHead:         any = [ 'edit', 'N.Agen.', 'imagen', 'nombre', 'R.U.C.', 'replegal', 'descripcion', 'fechas' ];
  public dataSource!: MatTableDataSource<any>;

  @Input() modulo: any = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  public clienteForm = new FormGroup({

    ruc:                  new FormControl('', [Validators.pattern('[0-9]+')]),
    replegal:             new FormControl(''),
    fechacontinicio:      new FormControl(),
    fechacontfinal:       new FormControl(),
    descripcion:          new FormControl(''),
    observacion:          new FormControl(''),
    telfclimanteni:       new FormControl(''),
    correomantenimiento:  new FormControl(''),
    telfpago:             new FormControl(''),
    correopago:           new FormControl(''),
    nombre:               new FormControl(''),
    tipo:                 new FormControl(''),
    nombreMantenimiento:  new FormControl(''),
    nombrePago:           new FormControl(''),
    extension1:           new FormControl(''),
    extension2:           new FormControl('')

  })

  constructor( private client: ClienteService,private DataMaster: SharedService, private fileserv: ImagecontrolService, private bodega: CrearBodegasService ) { }

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    this._IMGE = this.nonuser;
    // Provincia  
    this.getDataMaster('TP');
    this.ccia = sessionStorage.getItem('codcia');
    this.obtenerCliente();
  }

  validarCadena(event:any, controlname:any, tipo: string) {

    switch(tipo) {
      case 'L':
        this.DataMaster.validarLetras(event, controlname, this.clienteForm);
        break;
      case 'N':
        this.DataMaster.validarNumeros(event, controlname, this.clienteForm);
        break;
    }

  }
  

  limpiar() {
    this.clienteForm.controls['ruc'].setValue('');
    this.clienteForm.controls['replegal'].setValue('');
    this.clienteForm.controls['fechacontinicio'].setValue('');
    this.clienteForm.controls['fechacontfinal'].setValue('');
    this.clienteForm.controls['descripcion'].setValue('');
    this.clienteForm.controls['observacion'].setValue('');
    this.clienteForm.controls['telfclimanteni'].setValue('');
    this.clienteForm.controls['correomantenimiento'].setValue('');
    this.clienteForm.controls['telfpago'].setValue('');
    this.clienteForm.controls['correopago'].setValue('');    
    this.clienteForm.controls['nombre'].setValue('');
    this.clienteForm.controls['tipo'].setValue('');
    this.clienteForm.controls['nombreMantenimiento'].setValue('');
    this.clienteForm.controls['nombrePago'].setValue('');
    this.clienteForm.controls['extension1'].setValue('');
    this.clienteForm.controls['extension2'].setValue('');
    this._show_form = false;
    this._action_butto      = 'Crear';
    this._icon_button       = 'add';
    this._cancel_button     = false;
    this._IMGE = '';
  }

  validatePersonal() {

    let xtipo: any = sessionStorage.getItem('tipo');
    if(xtipo.trim() == '001') {
      this._delete_show = true;
    } else {
      this._delete_show = false;
    }

  }

  onSubmit() {
    switch(this._action_butto) {
      case 'Crear':
        this.guardarClientes();
        break;
      case 'Actualizar':
        this.editaClientes();
        break;
    }
  }

  getDataMaster(cod:string) {
    this.DataMaster.getDataMaster(cod).subscribe({
      next: (data) => {
        switch(cod) {
          case 'TP':
            this.tipoEmpresaLista = data;
            console.log(this.tipoEmpresaLista);
            break;
        }
      }
    }) 
  }
  public file!: File;
  onFileSelected(event: any): void {
    this.file = event.target.files[0];
  }

  _IMGE:any;
  nameFile: string = '';
  public fileId: any;
  encodeImageFileAsURL() {    
    this._show_spinner = true;
    const filesSelected: any = document.getElementById('fileUp2') as HTMLInputElement;
    this.fileId = filesSelected.files;
    let s = this.fileId[0].name.split('.');
    this.nameFile = s[0];
    let base;
    if (this.fileId.length > 0) {
      
      const fileToLoad: any = filesSelected[0];
      const fileReader: any = new FileReader();
      
      fileReader.onload = () => {
        base = fileReader.result;
      };
      
      fileReader.onloadend = () => {
        this._IMGE = fileReader.result;
        console.log(this._IMGE)
        this.validarImagen()
      };

      fileReader.readAsDataURL(this.fileId[0]);
      this._show_spinner = false;
      
    }

  }

  _validate_img: boolean = true;
  validarImagen() {
    
    if( this._IMGE == '' || this._IMGE == undefined || this._IMGE == null ) this._validate_img = true;
    else this._validate_img = false;

  }

  imagenModel: any = [];
  guardarImagen(token:any) {

    this.imagenModel = {
      codentidad: token,
      imagen:    this._IMGE,
      tipo:      'Cliente'
    }

    this.DataMaster.guardarImagenEntidadGeneral( this.imagenModel ).subscribe({
    next: (x) => {
      this._show_spinner = false;
      // Swal.fire(
      //   'Imagen agregada',
      //   'Imagen de cliente se ha guardado con éxito',
      //   'success'
      // ) 
    }, error: (e) => {
      console.error(e);
      this._show_spinner = false;
      Swal.fire(
        'Oops!',
        'Algo ha salido mal.',
        'success'
      ) 
    }, complete: () => {}
  })
}

crearCuentaHelpDesk(codCliente: string, codCia:string, R:string, Nombre:string, Apellido: string) {
  this.client.crearCuentaHelpDesk(codCliente, codCia, R, Nombre, Apellido).subscribe({
    next: (x) => {
      console.log(x);
      Swal.fire(
        'Cuenta Help Desk generada',
        'info'
      )
    }, error: (e) => {
      console.error(e);
    }
  })
}

  modelCliente: any = [];
  automatic_bod:boolean = true;
  guardarClientes() {

    if( this.clienteForm.controls['nombre'].value == '' || this.clienteForm.controls['nombre'].value == undefined || this.clienteForm.controls['nombre'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo nombre no puede ir vacío' })
    else if( this.clienteForm.controls['ruc'].value == '' || this.clienteForm.controls['ruc'].value == undefined || this.clienteForm.controls['ruc'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo R.U.C. no puede ir vacío' })
    else if( this.clienteForm.controls['replegal'].value == '' || this.clienteForm.controls['replegal'].value == undefined || this.clienteForm.controls['replegal'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo Representante legal no puede ir vacío' })
    else if( this.clienteForm.controls['telfclimanteni'].value == '' || this.clienteForm.controls['telfclimanteni'].value == undefined || this.clienteForm.controls['telfclimanteni'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo Teléfono de mantenimiento cliente no puede ir vacío' })
    else if( this.clienteForm.controls['correomantenimiento'].value == '' || this.clienteForm.controls['correomantenimiento'].value == undefined || this.clienteForm.controls['correomantenimiento'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo Correo de mantenimiento cliente no puede ir vacío', timer: 3000 })
    else if( this.clienteForm.controls['telfpago'].value == '' || this.clienteForm.controls['telfpago'].value == undefined || this.clienteForm.controls['telfpago'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo Teléfono de pago del cliente no puede ir vacío', timer: 3000 })
    else if( this.clienteForm.controls['correopago'].value == '' || this.clienteForm.controls['correopago'].value == undefined || this.clienteForm.controls['correopago'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo Correo de pago del cliente no puede ir vacío', timer: 3000 })
    else {

    const cliente = this.clienteForm.controls['ruc'].value;
    const token: string = 'CLI-'+cliente+'-'+this.DataMaster.generateRandomString(10);
    const userSession: any = sessionStorage.getItem('UserCod');
    
    
    this.modelCliente = {
      Codcliente : token,
      Ruc :                 this.clienteForm.controls['ruc'].value,
      Replegal :            this.clienteForm.controls['replegal'].value,
      Fechacontinicio :     this.clienteForm.controls['fechacontinicio'].value,
      Fechacontfinal :      this.clienteForm.controls['fechacontfinal'].value,
      Descripcion :         this.clienteForm.controls['descripcion'].value,
      Observacion :         this.clienteForm.controls['observacion'].value,
      Telfclimanteni :      this.clienteForm.controls['telfclimanteni'].value,
      Correomantenimiento : this.clienteForm.controls['correomantenimiento'].value,
      Telfpago :            this.clienteForm.controls['telfpago'].value,
      Correopago :          this.clienteForm.controls['correopago'].value,
      Coduser :             userSession,
      Codcia :              this.ccia,
      NombreMantenimiento : this.clienteForm.controls['nombreMantenimiento'].value,
      nombrePago :         this.clienteForm.controls['nombrePago'].value,
      Nombre :              this.clienteForm.controls['nombre'].value,
      Tipo :                this.clienteForm.controls['tipo'].value,
      extension1 :                this.clienteForm.controls['extension1'].value,
      extension2 :                this.clienteForm.controls['extension2'].value
    }

    console.warn( this.modelCliente );
    this._show_spinner = true;

    this.client.guardarClientes(this.modelCliente).subscribe(
      {
        next: (x) => {
          this.crearCuentaHelpDesk(token, this.ccia, 'C', this.clienteForm.controls['replegal'].value,this.clienteForm.controls['replegal'].value)
          this._show_spinner = false;
            Swal.fire(
              'Cliente: ' +this.clienteForm.controls['nombre'].value + ' generado',
              'El cliente se ha guardado con éxito',
              'success'
            )
        },
        error: (e) => {
          this._show_spinner = false;
          Swal.fire(
            'Oops!',
            'No hemos podido guardar el cliente: RUC REPETIDO',
            'error'
          )
        },
        complete: () => {
          this.guardarImagen(token);
          this.obtenerCliente();
          if( this.automatic_bod ) {
            let bodegacliente:any = '(BODEGA VIRTUAL) '+ this.clienteForm.controls['nombre'].value.toString();
            this.guardarBodega( token, bodegacliente );
          }          
          
          
          this.limpiar();
        }
      }
    )
    }

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  listaClientes: any = [];
  obtenerCliente() {
    this._show_spinner = true;
    this.client.obtenerClientes(this.ccia, 2).subscribe({
      next: (clientes) => {
        this.listaClientes = clientes;
        console.log(this.listaClientes)

        this.listaClientes.filter( (cli:any) => {
          console.warn(this.env + cli.imagen)
          cli.imagen = this.env + cli.imagen;
        })

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

  obtenerImagen(codec:string) {
    this._show_spinner = true;
    this.fileserv.obtenerImagenCodBinding(codec, 'Cliente').subscribe({
      next: (imagen:any) => {
        this._show_spinner = false;
        this._IMGE = imagen[0].imagen;
      }, error: (e) => {
        this._show_spinner = false;
      }
    })
  
  }

  eliminarClientes(data: any) {

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

        this.client.eliminarClientes( data.codcliente, this.ccia ).subscribe({
          next: (x) => {
            this._show_spinner = false;
            Swal.fire(
              'Deleted!',
              'Cliente: '+this.clienteForm.controls['nombre'].value+' eliminado',
              'success'
            )
          }, error: (e) => {
            console.error(e);
            this._show_spinner = false;
            Swal.fire(
              'Upps!',
              'No hemos podido eliminar este cliente',
              'error'
            )
          }, complete: () => {
            this.obtenerCliente();
          } 
        })
      }
    })

  }

  modelBodegas: any = []; 
  guardarBodega(ccli:string, nombrebdega:string) {

    let xuser: any = sessionStorage.getItem('UserCod');
    this._show_spinner = true;
    this.modelBodegas = {
      nombrebodega: nombrebdega,
      descripcion:  'Creado automáticamente desde el cliente',
      fecrea: new Date(),
      codusercrea: xuser,
      ccia: this.ccia,
      ccli: ccli
    }

    this.bodega.guardarBodegas(this.modelBodegas).subscribe({
      next: (x) => {        
        this._show_spinner = false;
        Toast.fire({
          icon: 'success',
          title: 'Bodega: '+nombrebdega+' creada automáticamente.'
        })
      }, error: (e) => {
        this._show_spinner = false;
        console.error(e);
        Toast.fire({
          icon: 'error',
          title: 'No se ha podido generar automáticamente.'
        })
      }, complete: () => {}
    })
    
  }

  codcli: string = '';
  catchData(data: any) {

    let inicio = data.fechacontinicio.toString().split('T');
    let fin    = data.fechacontfinal.toString().split('T');

    this.clienteForm.controls['ruc']                .setValue(data.ruc);
    this.clienteForm.controls['replegal']           .setValue(data.replegal);
    this.clienteForm.controls['fechacontinicio']    .setValue(inicio[0]);
    this.clienteForm.controls['fechacontfinal']     .setValue(fin[0]);
    this.clienteForm.controls['descripcion']        .setValue(data.descripcion);
    this.clienteForm.controls['observacion']        .setValue(data.observacion);
    this.clienteForm.controls['telfclimanteni']     .setValue(data.telfclimanteni);
    this.clienteForm.controls['correomantenimiento'].setValue(data.correomantenimiento);
    this.clienteForm.controls['telfpago']           .setValue(data.telfpago);
    this.clienteForm.controls['correopago']         .setValue(data.correopago);
    this.clienteForm.controls['nombre']             .setValue(data.nombre);
    this.clienteForm.controls['tipo']               .setValue(data.tipo);
    this.clienteForm.controls['nombreMantenimiento'].setValue(data.nombreMantenimiento),
    this.clienteForm.controls['nombrePago']        .setValue(data.nombrePago),
    this.clienteForm.controls['extension1']        .setValue(data.extension1),
    this.clienteForm.controls['extension2']        .setValue(data.extension2),
    this.codcli         = data.codcliente;
    this._icon_button   = 'sync_alt';
    this._action_butto  = 'Actualizar';
    this._cancel_button = true;
    this.obtenerImagen(this.codcli);

  }

  editaClientes() {
    if( this.clienteForm.controls['nombre'].value == '' || this.clienteForm.controls['nombre'].value == undefined || this.clienteForm.controls['nombre'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo nombre no puede ir vacío' })
    else if( this.clienteForm.controls['ruc'].value == '' || this.clienteForm.controls['ruc'].value == undefined || this.clienteForm.controls['ruc'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo R.U.C. no puede ir vacío' })
    else if( this.clienteForm.controls['replegal'].value == '' || this.clienteForm.controls['replegal'].value == undefined || this.clienteForm.controls['replegal'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo Representante legal no puede ir vacío' })
    else if( this.clienteForm.controls['telfclimanteni'].value == '' || this.clienteForm.controls['telfclimanteni'].value == undefined || this.clienteForm.controls['telfclimanteni'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo Teléfono de mantenimiento cliente no puede ir vacío' })
    else if( this.clienteForm.controls['correomantenimiento'].value == '' || this.clienteForm.controls['correomantenimiento'].value == undefined || this.clienteForm.controls['correomantenimiento'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo Correo de mantenimiento cliente no puede ir vacío', timer: 3000 })
    else if( this.clienteForm.controls['telfpago'].value == '' || this.clienteForm.controls['telfpago'].value == undefined || this.clienteForm.controls['telfpago'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo Teléfono de pago del cliente no puede ir vacío', timer: 3000 })
    else if( this.clienteForm.controls['correopago'].value == '' || this.clienteForm.controls['correopago'].value == undefined || this.clienteForm.controls['correopago'].value == null ) Toast.fire({ icon: 'warning', title: 'El campo Correo de pago del cliente no puede ir vacío', timer: 3000 })
    else {
      const userSession: any = sessionStorage.getItem('UserCod');
      this.modelCliente = {
        Codcliente :          this.codcli,
        Ruc :                 this.clienteForm.controls['ruc'].value,
        Replegal :            this.clienteForm.controls['replegal'].value,
        Fechacontinicio :     this.clienteForm.controls['fechacontinicio'].value,
        Fechacontfinal :      this.clienteForm.controls['fechacontfinal'].value,
        Descripcion :         this.clienteForm.controls['descripcion'].value,
        Observacion :         this.clienteForm.controls['observacion'].value,
        Telfclimanteni :      this.clienteForm.controls['telfclimanteni'].value,
        Correomantenimiento : this.clienteForm.controls['correomantenimiento'].value,
        Telfpago :            this.clienteForm.controls['telfpago'].value,
        Correopago :          this.clienteForm.controls['correopago'].value,
        NombreMantenimiento : this.clienteForm.controls['nombreMantenimiento'].value,
        nombrePago :         this.clienteForm.controls['nombrePago'].value,
        Coduser :             userSession,
        Codcia :              this.ccia,
        Nombre :              this.clienteForm.controls['nombre'].value,
        Tipo :                this.clienteForm.controls['tipo'].value,
        extension2 :                this.clienteForm.controls['extension2'].value,
        extension1 :                this.clienteForm.controls['extension1'].value
      }
      this._show_spinner = true;
      this.client.editaCLientes( this.codcli, this.ccia, this.modelCliente ).subscribe({
        next: (x) => {
          this._show_spinner = false;
            Swal.fire(
              'Cliente: '+ this.clienteForm.controls['nombre'].value +' editado',
              'El cliente se ha editado con éxito',
              'success'
            )
        },
        error: (e) => {
          this._show_spinner = false;
          Swal.fire(
            'Oops!',
            'No hemos podido editar este cliente: RUC REPETIDO',
            'error'
          )
        },
        complete: () => {
          this.guardarImagen( this.codcli);
          this.obtenerCliente();
          this.limpiar();
        }
      })

    }
  }

}
