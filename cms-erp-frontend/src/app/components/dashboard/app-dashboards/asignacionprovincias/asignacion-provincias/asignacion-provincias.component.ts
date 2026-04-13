import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../usuario/services/user.service';
import { SharedService } from 'src/app/components/shared/services/shared.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ModalProvicComponent } from '../modal/modal-provic/modal-provic.component';
import { CrononewdisService } from '../../crononewdis/services/crononewdis.service';
import { ClienteService } from '../../clientes/services/cliente.service';
import { FormControl, FormGroup } from '@angular/forms';

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
  selector: 'app-asignacion-provincias',
  templateUrl: './asignacion-provincias.component.html',
  styleUrls: ['./asignacion-provincias.component.scss']
})

export class AsignacionProvinciasComponent implements OnInit {
  pMod: number = 4;

  clientesel: string = 'Escoge un cliente a visualizar'
  listaAgenciasRes: any = [];
  resultadosFiltrados: any = [];
  _IMGE: any;
  resultadosFiltradosNorte:any = [];
  resultadosFiltradosCentro:any = [];
  resultadosFiltradosSur:any = [];
  resultadosFiltradosGeneral:any = [];

  zlist1:any = [];
  zlist2:any = [];
  zlist3:any = [];
  zlist4:any = [];
  zlist5:any = [];
  zlist6:any = [];
  zlist7:any = [];

  N:string='';
  S:string='';
  C:string='';
  G:string='';

  codeZone:string = '';
  codAgencia: string = '';
  nombrelocalizacion: string = '';
  idlocalidad: number = 0;
  _delete_show: boolean = true;
  _edit_show: boolean = true;
  _create_show: boolean = true;
  _form_create: boolean = true;

  _show_spinner: boolean = false;
  @Input() modulo: any = [];
  public ccia:any;
  lisTecnicos: any = [];

  public clienteForm = new FormGroup({
    codcliente:           new FormControl('')
  })

  columnHead: any = [ 'nombre', 'nombreDepartamento', 'nombreProvincia', 'nombreEstado', 'nombreMovilidad', 'nombreLicencia', 'provincia' ];
  public dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    this.ccia = sessionStorage.getItem('codcia');
    this.obtenerUsuario();
    this.permisos();
    // this.getDataMaster('ZNF');
    this.obtenerCliente();
    this.asignarColores();
  }

  constructor( private client: ClienteService, 
               private crone: CrononewdisService,
               private DataMaster: SharedService,
               private us: UserService,
               public dialog: MatDialog ) {  }

  listUsuarios:any = [];
  obtenerUsuario() {  
    this.us.obtenerUsuarios(this.ccia).subscribe({
      next: (usuarios) => {
        this.listUsuarios = usuarios;
      }, error: (e) => {
        // console.error(e);
      },complete: () => {
        this.listUsuarios.find( (element:any) => {
          if( element.tipo == '003' ) {
            this.lisTecnicos.push(element);
            this.dataSource = new MatTableDataSource(this.lisTecnicos);
            this.dataSource.paginator = this.paginator;
          }

          // console.warn(this.lisTecnicos);

        })
      }
    })  
  }

  listaZonificacion: any = [];
  getDataMaster() {
    this.DataMaster.getDataMaster('ZNF').subscribe({
      next: (data) => {
        this.listaZonificacion = data;
      }, complete: () => {
        this.listaZonificacion.filter((element:any)=>{
          this.obtenerZonaAgencia(element.codigo);
        })

      }
    }) 
  }


  obtenerZonaAgencia(codec:string) {
    this.resultadosFiltradosNorte   = []
    this.resultadosFiltradosCentro  = []
    this.resultadosFiltradosSur     = []
    this.resultadosFiltradosGeneral = []
    this.obtenerClienteUnit();

    if ( codec != null || codec != undefined || this.clienteForm.controls['codcliente'].value != null || this.clienteForm.controls['codcliente'].value != undefined ) {
      this.crone.obtenerZonificacion(codec, this.clienteForm.controls['codcliente'].value).subscribe({
        next:(x:any) => {        
          if( codec == '001' ) {
            this.zlist1 = x;
            this.resultadosFiltradosNorte = x;
            console.warn('Norte');
            console.warn(this.resultadosFiltradosNorte);
          }
          else if (codec == '002') {
            this.zlist2 = x;
            this.resultadosFiltradosSur = x;
            // console.warn('SUR');
            // console.warn(this.resultadosFiltradosSur);
          }
          else if (codec == '003') {
            this.zlist3 = x;
            this.resultadosFiltradosCentro = x;
            // console.warn('CENTRO');
            // console.warn(this.resultadosFiltradosCentro);
          }
          else if (codec == '004') {
            this.zlist4 = x;
            this.resultadosFiltradosGeneral = x;
          }
          else if (codec == '005') {
            this.zlist5 = x;
          }
          else if (codec == '006') {
            this.zlist6 = x;
          }
          else if (codec == '007') {
            this.zlist7 = x;
          }
        }
      })
    }

  }

  getColorForInitial(initial: string): string {
    
    const colors: { [key: string]: string } = {
      N: 'red',
      C: 'green',
      S: 'blue',
      G: 'orange'
    };
    
    return colors[initial] || 'gray';

  }

  asignarColores() {
    this.N = this.getColorForInitial('N');
    this.S = this.getColorForInitial('S');
    this.C = this.getColorForInitial('C');
    this.G = this.getColorForInitial('G');
  }

  eliminarDatCrono(id:any) {
    console.warn(id)
    this._show_spinner = true;
    this.crone.eliminarZonificacion(id).subscribe (
      {
        next:(x) => {
          this._show_spinner = false;
          Toast.fire({ icon: 'success', title: 'Asignación eliminada' });
        },
        error: (e) => {
          this._show_spinner = false;
          Toast.fire({ icon: 'error', title: 'No hemos podido elimar la asignación' });
        }, complete: () => {
            this.obtenerAgenciaRes();
            this.listaZonificacion.filter( (element:any) => {
              this.obtenerZonaAgencia(element.codigo);
            }
          )
        }
      }
    )
  }

  filtroTexto: string = '';
  filtrarElementos() {
    this.resultadosFiltrados = this.listaAgenciasRes.filter((item:any) =>
      item.nombre.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      item.nombreProvincia.toLowerCase().includes(this.filtroTexto.toLowerCase())
    );
  }

  filtroTextoNorte: string = '';
  filtrarElementosNorte() {
    this.resultadosFiltradosNorte = this.zlist1.filter((item:any) =>
      item.nombreAgencia.toLowerCase().includes(this.filtroTextoNorte.toLowerCase()) ||
      item.nombreProvincia.toLowerCase().includes(this.filtroTextoNorte.toLowerCase())
    );
  }

  filtroTextoCentro: string = '';
  filtrarElementosCentro() {

    // console.log(this.filtroTextoCentro)

    this.resultadosFiltradosCentro = this.zlist3.filter((item:any) =>
      item.nombreAgencia.toLowerCase().includes(this.filtroTextoCentro.toLowerCase()) ||
      item.nombreProvincia.toLowerCase().includes(this.filtroTextoCentro.toLowerCase())
    );
  }

  filtroTextoSur: string = '';
  filtrarElementosSur() {
    this.resultadosFiltradosSur = this.zlist2.filter((item:any) =>
      item.nombreAgencia.toLowerCase().includes(this.filtroTextoSur.toLowerCase()) ||
      item.nombreProvincia.toLowerCase().includes(this.filtroTextoSur.toLowerCase())
    );
  }
  
  filtroTextoGeneral: string = '';
  filtrarElementosGeneral() {
    this.resultadosFiltradosGeneral = this.zlist4.filter((item:any) =>
      item.nombreAgencia.toLowerCase().includes(this.filtroTextoGeneral.toLowerCase()) ||
      item.nombreProvincia.toLowerCase().includes(this.filtroTextoGeneral.toLowerCase())
    );
  }

  validationCliente() {
    this.getDataMaster();
    this.obtenerAgenciaRes();
  }

  obtenerAgenciaRes() {
    this.resultadosFiltrados = [];

    if( this.clienteForm.controls['codcliente'].value != null || this.clienteForm.controls['codcliente'].value != undefined ) {

      this.crone.obtenerAgenciasGeneraCli( this.ccia, this.clienteForm.controls['codcliente'].value ).subscribe(
        {
          next:(x) => {
            this.listaAgenciasRes = x;
            this.resultadosFiltrados = x;
            // console.log(this.listaAgenciasRes);
          }, complete: () => {

            if ( this.listaZonificacion != null || this.listaZonificacion != undefined || this.listaZonificacion != '' ){
              this.listaZonificacion.filter((element:any) => {
                this.obtenerZonaAgencia(element.codigo);
              })
            }

          }
        }
      )

    }

  }

  listaClientes: any = [];
  obtenerCliente() {
    this._show_spinner = true;
    this.client.obtenerClientes(this.ccia,2).subscribe(
      {
        next: (clientes) => {
          this.listaClientes = clientes;
          // // console.log(this.listaClientes)
        },
        error: (e) => {
          // console.error(e);
          this._show_spinner = false;
        },
        complete: () => {
          this._show_spinner = false;
        }
      }
    )
  }

  obtenerClienteUnit() {
    this.listaClientes.filter( (element:any) => {
      if( element.codcliente == this.clienteForm.controls['codcliente'].value ) {
        // console.warn(element);
        this.clientesel = element.nombre;
        this._IMGE = element.imagen;
        // // console.warn(this.modelClientUnit);s
      }
    })

  }

  catchData(data:any, codecZone: string) {
    this.codeZone = codecZone;
    this.codAgencia = data.codAgencia;
    this.nombrelocalizacion = data.nombrelocalizacion;
    this.idlocalidad = data.idlocalidad;
    // console.log(this.idlocalidad);
  }

  modelZonificacion:any = [];
  guardarZonificacion() {

    let xuser = sessionStorage.getItem('UserCod');
    this._show_spinner = true;
    this.modelZonificacion = {
      "nombrelocalizacion": this.codeZone,
      "feccrea": new Date(),
      "codusercrea": xuser,
      "idlocalidad": null,
      "campoA": null,
      "campoB": 0,
      "codagencia": this.codAgencia,
      "codtecnico": null
    };

    this.crone.guardarZonificacion(this.modelZonificacion).subscribe({
      next: (x) => {
        this._show_spinner = false;
        Toast.fire({ icon: 'success', title: 'Se ha asignado con exito' });
      },
      error: (e) => {
        this._show_spinner = false;
        Toast.fire({ icon: 'error', title: 'No se ha podido generar la asignación' });
      },
      complete: () => {
        this.obtenerAgenciaRes();
        this.listaZonificacion.filter((element:any)=>{
          this.obtenerZonaAgencia(element.codigo);
        })
      }
    })

  }

  permisos() {
    
    switch(this.modulo.permiso) {
      case 1:
        this.columnHead = [ 'foto', 'nombre', 'nombreDepartamento', 'nombreProvincia', 'nombreEstado', 'nombreMovilidad', 'nombreLicencia', 'provincia' ];
        this._delete_show = true;
        this._edit_show   = true;
        this._create_show = true;
        this._form_create = true;
        break;
      case 2:
        this.columnHead = [ 'foto', 'nombre', 'nombreDepartamento', 'nombreProvincia', 'nombreEstado', 'nombreMovilidad', 'nombreLicencia', 'provincia' ];
        this._delete_show = false;
        this._edit_show   = true;
        this._create_show = true;
        this._form_create = true;
        break;
      case 3:
        this.columnHead = [ 'foto', 'nombre', 'nombreDepartamento', 'nombreProvincia', 'nombreEstado', 'nombreMovilidad', 'nombreLicencia', 'provincia' ];
        this._delete_show = false;
        this._edit_show   = true;
        this._create_show = false;
        this._form_create = true;
        break;      
      case 4:
        alert('nivel de permiso ' + this.modulo.permiso)
        this.columnHead = [ 'foto', 'nombre', 'nombreDepartamento', 'nombreProvincia', 'nombreEstado', 'nombreMovilidad', 'nombreLicencia' ];
        this._delete_show = false;
        this._edit_show   = false;
        this._create_show = false;
        this._form_create = false;
        break;
    }

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialog(data:any): void {

    const dialogRef = this.dialog.open( ModalProvicComponent, {
      height: '650px',
      width: '80%',
      data: data, 
    });

    dialogRef.afterClosed().subscribe( result => {      
      // console.warn( result );
    });

  }


}
