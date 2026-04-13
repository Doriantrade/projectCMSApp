import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CrononewdisService } from './services/crononewdis.service';
import { ClienteService } from '../clientes/services/cliente.service';
import { SharedService } from 'src/app/components/shared/services/shared.service';
import { UserService } from '../usuario/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Swal from 'sweetalert2'
import { ChangeDetectorRef } from '@angular/core';


import { CronogramaService } from '../cronograma/services/cronograma.service';
import { FormControl, FormGroup } from '@angular/forms';

import { MantenimientoCronogramaService } from '../crono-grid/services/mantenimiento-cronograma.service';
import { ModalDetalleCronoComponent } from '../crono-grid/modal-detalle-crono/modal-detalle-crono.component';
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
  selector: 'app-crononewdis',
  templateUrl: './crononewdis.component.html',
  styleUrls: ['./crononewdis.component.scss']
})
export class CrononewdisComponent implements OnInit {
  pMod: number = 4;


  listadetalleCronoUnit: any = [];
  modelUnitCronoDetalle: any = [];
  agenciaChoiceManten:string = '';
  codCrono:any;

  listaLocalidades: any = [];
  _color_letras:string = '';
  filterMant:any;
  _show_filters:boolean = true;
  _width_filter: string = 'auto';
  _show_historymaquine: boolean = false;
  _viewMantenim:boolean = false;
  filtroTexto:any;
  resultado:any = [];  
  listUsuarios:any = [];
  lisTecnicos: any = [];

  env = environment.image_url;

  calssMenuFilter: string = 'filter-section rounded-2 animate__animated animate__backInDown';

  _filtros:any;
  mesSeleccionado:any;
  codMachine:any;
  _dis_btn_setts:boolean = false;
  clientesel: string = 'Escoge un cliente a visualizar'
  listaAgenciasRes: any = [];
  resultadosFiltrados: any = [];
  public ccia:any;
  filteredCronos:any = [];
  _IMGE: any;
  resultadosFiltradosNorte:any = [];
  resultadosFiltradosCentro:any = [];
  resultadosFiltradosSur:any = [];
  resultadosFiltradosGeneral:any = [];
  anioactual: any;

  maqsel:boolean = false;
  listaManetnimientoMaquinas: any = [];
  selectAll: boolean = false;
  tecnicoObtenido:any=[];
  manteniminetocount:number = 0;

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
  sumatoria = 0;
  sumatoriaFilter = 0;
  mes = 0;

  _background_crono: string = 'rgb(255, 252, 238)';
  copyCodCrono: any;
  copyCodAgencia: any;
  copyCantMaqIngre: any;
  copy: boolean = false;
  copyNombreAgencia: string = '';
  copyImagenAgencia: string = '';
  idcopy: string = '';

  listaZonificacion: any = [];

  public localidadform = new FormGroup({
    localidad:   new FormControl(),
  })

  public viewtecnicosform = new FormGroup({
    tecnicoLocal: new FormControl(true)
  })
 

  codeZone:string = '';
  _show_spinner: boolean = false;

  listmeses: any = [{nombre:"Enero", cod: 1}, {nombre:"Febrero", cod: 2}, {nombre:"Marzo", cod: 3}, {nombre:"Abril", cod: 4},
                    {nombre:"Mayo", cod: 5}, {nombre:"Junio", cod: 6}, {nombre:"Julio", cod: 7}, {nombre:"Agosto", cod: 8}, {nombre:"Septiembre", cod: 9},
                    {nombre:"Octubre", cod: 10}, {nombre:"Noviembre", cod: 11}, {nombre:"Diciembre", cod: 12}]

  staticDias: any = [ 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sábados' ];

  constructor( private crone: CrononewdisService,
               public dialog: MatDialog,
               private client: ClienteService, 
               private crono: CronogramaService,
               private DataMaster: SharedService,
               private us: UserService,
               private mantenimineto: MantenimientoCronogramaService,
               private cdRef: ChangeDetectorRef ) { }


  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;


    let xlocalidad:any = localStorage.getItem('localidad-cronograma-2');

    this.localidadform.controls['localidad'].setValue(Number(xlocalidad));
    this.obtenerLocalidadId();
    this.anioactual = new Date().getFullYear();
    this.ccia = sessionStorage.getItem('codcia');

    const meselegido = localStorage.getItem('meselegido');
  
    if (meselegido) {
      this.mesSeleccionado = Number(meselegido);
      this.diasdelMes(this.mesSeleccionado);
    }
    
    this.asignarColores();  
    this.obtenerLocalidades();

  }
  
  getDataMaster(cod:string) {
    this.DataMaster.getDataMaster(cod).subscribe({
      next: (data) => {
        switch(cod) {
          case 'ZNF':
            this.listaZonificacion = data;
            console.log(this.listaZonificacion);
            break;
        }
      }, complete: () => {

        this.listaZonificacion.filter((element:any) => {
          this.obtenerZonaAgencia(element.codigo);
        })

      }
    }) 
  }

  filtrarElementos() {
    this.listaMaquinariaAsignadaGhost = this.resmaquinas.filter((item:any)     =>
      item.nombremarca.toLowerCase().includes(this.filtroTexto.toLowerCase())  ||
      item.nombremodelo.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      item.nserie.toLowerCase().includes(this.filtroTexto.toLowerCase())       ||
      item.tipomaquina.toLowerCase().includes(this.filtroTexto.toLowerCase())
    );
  }

  selectAllMachine() {

    this.listaMaquinariaAsignadaGhost.forEach((maquina: any) => {
      maquina.selected = this.selectAll;
      if (this.selectAll && !this.listaManetnimientoMaquinas.find((item: any) => item.codprod === maquina.codmaquina)) {
          this.addMaquinaManetenimiento({ target: { checked: true } }, maquina.codmaquina);
          this.listaMaquinariaAsignadaGhost.filter((element:any) => {
              element.tecniconombre = this.tecnicoObtenido.tecnico;
              element.fotoperfil = this.tecnicoObtenido.imagenTecnico;
              element.show = true;            
          })
      } 
      
      else if (!this.selectAll) {
          this.listaManetnimientoMaquinas = this.listaManetnimientoMaquinas.filter((item: any) => item.codprod !== maquina.codmaquina);
          this.listaMaquinariaAsignadaGhost.filter((element:any) => {
            element.tecniconombre = '';
            element.fotoperfil = '';
            element.show = false;
        })
      }

    });

  }

  
  addMaquinaManetenimiento(event: any, codmachine: any) {
    const xuser: any = sessionStorage.getItem('UserCod');
  
    if (event.target.checked) {
      
        const array = {
            codcrono:       this.codCrono,
            codtecnico:     this.tecnicoObtenido.codusertecnic,
            feciniciomante: null,
            feccrea:        new Date(),
            fecfinmant:     null,
            horainit:       '00:00:00',
            horafin:        '00:00:00',
            usercrea:       xuser,
            codprod:        codmachine,
            estado:         1,
            idRequer:       0
        };

        this.listaManetnimientoMaquinas.push(array);

        this.listaMaquinariaAsignadaGhost.filter((element:any) => {
          if( codmachine == element.codmaquina) {
            element.tecniconombre = this.tecnicoObtenido.tecnico;
            element.fotoperfil = this.tecnicoObtenido.imagenTecnico;
            element.show = true;
          }
        });
  
    } else {
  
        this.listaManetnimientoMaquinas = this.listaManetnimientoMaquinas.filter((item: any) => item.codprod !== codmachine);
        this.listaMaquinariaAsignadaGhost.filter((element:any) => {
          if( codmachine == element.codmaquina) {
            element.tecniconombre = '';
            element.fotoperfil = '';
            element.show = false;
          }
        });
  
    }
  
    this.manteniminetocount = this.listaManetnimientoMaquinas.length;
  }
  
  


  getTecnico(tecnico: any) {
    console.log('🔍 Este es el técnico recibido en getTecnico:', tecnico); // ✅ Muestra el técnico recibido
    this.tecnicoObtenido = tecnico;

    setTimeout(() => {
        console.log('🛠 Técnico asignado en this.tecnicoObtenido:', this.tecnicoObtenido); // ✅ Verifica que se haya guardado correctamente
        this.encontrarMaquinasFaltantes();
    }, 500);
}


guardarMantenimiento() {
  console.log("⚠️ Se está ejecutando guardarMantenimiento()");

  console.log("🔄 Iniciando guardado de mantenimiento...");

  // 1️⃣ Verificar si ya existe antes de guardarlo
console.log("🔄 Lista antes de eliminar duplicados:", this.listaManetnimientoMaquinas);

this.listaManetnimientoMaquinas = this.listaManetnimientoMaquinas.filter(
    (maquina: any, index: number, self: any[]) =>
        index === self.findIndex((m: any) => m.codprod === maquina.codprod)
);

console.log("✅ Lista después de eliminar duplicados:", this.listaManetnimientoMaquinas);



if (this.listaManetnimientoMaquinas.length === 0) {
  console.warn("⚠️ No hay nuevas máquinas para guardar.");
  return;
}

  // 2️⃣ Guardar solo las máquinas nuevas
  this.listaManetnimientoMaquinas.forEach((element: any) => {
      this.mantenimineto.guardarMantenimiento(element).subscribe({
          next: (x) => {
              console.log("✅ Máquina guardada:", x);
              Toast.fire({ icon: 'success', title: 'Asignación ha sido completada' });
          },
          error: (e) => {
              console.error("❌ Error al guardar:", e);
              Toast.fire({ icon: 'error', title: 'No se ha podido completar la asignación' });
          },
          complete: () => {
              this.obtenerMantenimiento();
              this.manteniminetocount = 0;
              this.selectAll = false;
              setTimeout(() => {
                  this.encontrarMaquinasFaltantes();
              }, 500);
          }
      });
  });

  setTimeout(() => {
    this.listaManetnimientoMaquinas = [];
    console.log("🗑 Lista vaciada después de guardar:", this.listaManetnimientoMaquinas);
}, 1000);
}






  obtenerCodMachine(codmachine:any):string {
    this.codMachine = codmachine;
    console.warn('CODIGO DE NO SE QUE!');
    console.warn(this.codMachine);
    return this.codMachine;
  }

  eliminarMantenimiento( id:number ) {
    Swal.fire({
      title:              'Estás seguro?',
      text:               "Esta acción es irreversible y podría provocar perdida de datos en otros procesos!",
      icon:               'warning',
      showCancelButton:   true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor:  '#d33',
      confirmButtonText:  'Sí, eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this._show_spinner = true;
        this.mantenimineto.eliminarMantenimiento( id ).subscribe({
          next: (x) => {
            this._show_spinner = false;
            Swal.fire (
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
            this.obtenerMantenimiento();
            setTimeout(() => {
              this.encontrarMaquinasFaltantes();
              // this.encontrarMaquinasRepetidas();
            }, 1000);
          } 
          })
        }
    })
  }

  openDialog(data:any): void {

    const reasignData = {
        "nombreTecnico": data.nombreTecnico,
        "codfrecuencia": data.codfrecuencia,
        "frecuencia": data.frecuencia,
        "nombreCliente": data.nombreCliente,
        "nombreAgencia": data.nombreAgencia,
        "codcrono": data.codcrono,
        "codusertecnic": data.codusertecnic,
        "codcli": data.codcliente,
        "codagencia": data.codagencia,
        "observacion": data.observacion,
        "feccrea": data.feccrea,
        "codusercreacrono": data.codusercreacrono,
        "semanainicio": data.semanainicio,
        "mes": data.mes,
        "dia": Number(data.dia),
        "anio": data.anio,
        "fechamantenimiento": data.fechamantenimiento,
        "maquinasmanuales": data.maquinasmanuales,
        "localidad": this.idLocalidad,
        "idRequer": data.idRequer
    }

    const dialogRef = this.dialog.open( ModalDetalleCronoComponent, {
      height: '600px',
      width:  '50%',
      data: reasignData, 
    });

    dialogRef.afterClosed().subscribe( result => {      
      
      console.warn( 'result' );
      console.warn( result );
      console.warn('mes: ' + this.mes);
      this.diasdelMes(this.mes);

    });


  }

  actualizarEstadoAgencia( st:number, codagencia:string ) {
    this.crone.ActualizaEstadoAgencia(st, codagencia).subscribe({
      next:( x ) => {
        console.warn('ESTADO DE LA AGENCIA ' + codagencia +  ' A CAMBIADO A: ' + st);
      }, error: (e) => {
        console.error(e);
      }, complete: () => {
        this.getDataMaster('ZNF');
      }
    })
  }

  filterMantenimiento () {
    this.listaMantenimientoMaquinaGhost = this.listaMaquinaMantenimiento.filter((item:any) =>
    item.nombreTecnico.toLowerCase().includes(this.filterMant.toLowerCase()) ||
    item.marca.toLowerCase().includes(this.filterMant.toLowerCase()) ||
    item.modelo.toLowerCase().includes(this.filterMant.toLowerCase()) ||
    item.nserie.toLowerCase().includes(this.filterMant.toLowerCase()) ||
    item.nombretipomaquina.toLowerCase().includes(this.filterMant.toLowerCase())
  );
  }

  obtenerZonaAgencia(codec:string) {  
    this.resultadosFiltradosNorte   = [];
    this.resultadosFiltradosCentro  = [];
    this.resultadosFiltradosSur     = [];
    this.resultadosFiltradosGeneral = [];
    this.crone.obtenerAgenciaLocalizacion(this.idLocalidad, codec).subscribe({
      next:(x:any) => {        
        if( codec == '001' ) {
          this.zlist1 = x;
          this.resultadosFiltradosNorte = x;
          console.warn('Norte');
          console.warn(this.resultadosFiltradosNorte);
          this.resultadosFiltradosNorte.filter( (cli:any) => {
            cli.imagen = this.env + cli.imagen;
          })
        }
        else if (codec == '002') {
          this.zlist2 = x;
          this.resultadosFiltradosSur = x;
          console.warn('SUR');
          console.warn(this.resultadosFiltradosSur);
          this.resultadosFiltradosSur.filter( (cli:any) => {
            cli.imagen = this.env + cli.imagen;
          })
        } 
        else if (codec == '003') {
          this.zlist3 = x;
          this.resultadosFiltradosCentro = x;
          this.resultadosFiltradosCentro.filter( (cli:any) => {
            cli.imagen = this.env + cli.imagen;
          })
        }
        else if (codec == '004') {
          this.zlist4 = x;
          this.resultadosFiltradosGeneral = x;
          this.resultadosFiltradosGeneral.filter( (cli:any) => {
            cli.imagen = this.env + cli.imagen;
          })
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

  transform(items: any[], filter: any): any[] {
    if (!items || !filter) {
      return items;
    }
    return items.filter(item => item.dia === filter.dia);
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

  filtroTextoNorte: string = '';
  filtrarElementosNorte() {
    this.resultadosFiltradosNorte = this.zlist1.filter((item:any) =>
      item.nombreAgencia.toLowerCase().includes(this.filtroTextoNorte.toLowerCase())
    );
  }

  filtroTextoCentro: string = '';
  filtrarElementosCentro() {
    this.resultadosFiltradosCentro = this.zlist3.filter((item:any) =>
      item.nombreAgencia.toLowerCase().includes(this.filtroTextoCentro.toLowerCase())
    );
  }

  filtroTextoSur: string = '';
  filtrarElementosSur() {
    this.resultadosFiltradosSur = this.zlist2.filter((item:any) =>
      item.nombreAgencia.toLowerCase().includes(this.filtroTextoSur.toLowerCase())
    );
  }
  
  filtroTextoGeneral: string = '';
  filtrarElementosGeneral() {
    this.resultadosFiltradosGeneral = this.zlist4.filter((item:any) =>
      item.nombreAgencia  .toLowerCase().includes(this.filtroTextoGeneral.toLowerCase())
    );
  }

  resTecnicosFiltrados:any=[];
  filtroTecnico:any;
  fitrarTecnicos() {
    
    console.log(this.filtroTecnico)
    this.resTecnicosFiltrados = this.lisTecnicos.filter( (item:any) => 
    item.nombre.toLowerCase()
               .includes( this.filtroTecnico.toLowerCase() ))
               console.warn(this.resTecnicosFiltrados);

  }

  obtenerLocalidades() {
    this.crono.obtenerLocalidades().subscribe({
        next: (x) => {
          this.listaLocalidades = x;
          console.warn('Estas son las localidades');
          console.warn(this.listaLocalidades);
        }, error: (e) => {
          console.error(e);
        }
      }
    )
  }

  idLocalidad: any;
  obtenerLocalidadId() {

      this.idLocalidad = this.localidadform.controls['localidad'].value;
      if ( this.idLocalidad != null || this.idLocalidad != undefined ) {
        this.validatesettings(this.idLocalidad);
        this.getDataMaster('ZNF');
      }

      localStorage.setItem('localidad-cronograma-2', this.idLocalidad);

  }

  validatesettings(id:any) {

    if ( (id == undefined || id == null)  ) {
      this._dis_btn_setts = false;
      return this._dis_btn_setts;
    }
    else {
      this._dis_btn_setts = true;
      return this._dis_btn_setts;
    }

  }

  eliminarCrono( crono:any, tecnico: any ) {

    Swal.fire({
      title: 'Estás seguro?',
      text: "¡Esta acción es irreversible y podría provocar perdida de datos en otros procesos!. ¿Estas seguro?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!'
    }).then( (result) => {
      if (result.isConfirmed) {
        this._show_spinner = true;
        this.crono.deleteCrono(crono.codcrono).subscribe({
          next: (x) => {
            this._show_spinner = false;
            Swal.fire(
              'Deleted!',
              'Cronograma eliminado',
              'success'
            )
          }, error: (e) => {
            console.error(e);
            this._show_spinner = false;
            Swal.fire(
              'Upps!',
              'No hemos podido eliminar el cronograma',
              'error'
            )
          }, complete: () => {
            this.obtenerCrono(this.mes, 'void', 3);
            this.actualizarEstadoAgencia(1, crono.codagencia);
          } 
        })
      }
    })

  }

  diasdelMes(mes: number): any[] {

    this.mes = mes;
    localStorage.setItem('meselegido', this.mes.toString());

    // Verifica si el número de mes es válido (entre 1 y 12)
    if (mes < 1 || mes > 12) {
      throw new Error('Número de mes inválido. Debe estar entre 1 y 12.');
    }

    const esBisiesto = (this.anioactual % 4 === 0 && this.anioactual % 100 !== 0) || this.anioactual % 400 === 0;
    const diasEnFebrero = esBisiesto ? 29 : 28;

    const fecha = new Date(this.anioactual, mes - 1, 1);

    let diasEnMes = 31;
    if (mes === 4 || mes === 6 || mes === 9 || mes === 11) {
      diasEnMes = 30;
    } else if (mes === 2) {
      diasEnMes = diasEnFebrero;
    }

    this.resultado = [];

    for (let i = 1; i <= diasEnMes; i++) {
      const fechaDia = new Date(this.anioactual, mes - 1, i);
      const diaDeSemana = format(fechaDia, 'eeee', { locale: es }); 
      if (diaDeSemana !== 'domingo') {
        const numeroDia = format(fechaDia, 'dd', { locale: es }); 
        this.resultado.push({ dia: diaDeSemana, numero: numeroDia });
      }
    }

    this.obtenerUsuario();
    return this.resultado;

  }

  dismes:any = [];
  searchText: string = '';
  selectedDay: string = '';
  filteredData: any[] = [];
  unirDatos() {

    this.dismes = this.resultado.map((diaMes: any) => ({
      dia: diaMes.dia,
      numero: diaMes.numero,
      tecnicos: [],
      totalPorDiaMaquinasIngresadasManual: 0, // Inicializa a cero
      totalPorDiaMaquinasManual: 0, // Inicializa a cero
    }));
  
    for (const tecnico of this.lisTecnicos) {
      for (const diaMes of this.dismes) {
        diaMes.tecnicos.push({
          ...tecnico,
          cronograma: [],
          TotalMaquinasIngresadasManual: 0, // Inicializa a cero
          TotalMaquinasManuales: 0, // Inicializa a cero
          colorestadomaquinaria: '', // Inicializa con cadena vacía o un valor por defecto
        });
      }
    }

    for (const tecnico of this.lisTecnicos) {
      const cronogramasTecnico = this.filteredCronos.filter(
        (crono: any) => crono.codusertecnic === tecnico.codusertecnic
      );
  
      for (const cronogramaTecnico of cronogramasTecnico) {
        const diaMes = this.dismes.find((d: any) => d.numero === cronogramaTecnico.dia);
        if (diaMes) {
          const tecnicoEnDia = diaMes.tecnicos.find((t: any) => t.codusertecnic === tecnico.codusertecnic);
          if (tecnicoEnDia) {
            tecnicoEnDia.cronograma.push(cronogramaTecnico);
          }
        }
      }
    }
  
  
    this.dismes.forEach((diaMes: any) => {   

      //  Aqui agrupamos el cronograma
      const cronogramasAgrupados: { [key: string]: any } = {};
      diaMes.tecnicos.forEach((tecnico: any) => {
        tecnico.cronograma.forEach((cronograma: any) => {
          const codagencia = cronograma.codagencia;
          if (!cronogramasAgrupados[codagencia]) {
            cronogramasAgrupados[codagencia] = {
              maquinasIngresadasManual: 0,
              maquinasmanuales: 0,
            };

            // console.warn('agencias agrupadas');
            // console.warn('♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠');
            // console.warn(cronogramasAgrupados[codagencia]);
            // console.warn('♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠♠');

          }
  
          cronogramasAgrupados[codagencia].maquinasIngresadasManual += cronograma.cantidadMaquinasAsignadas;
          cronogramasAgrupados[codagencia].maquinasmanuales         += cronograma.maquinasmanuales;
  
        });
  
      });

      diaMes.tecnicos.forEach((tecnico: any) => {
        let totalMaquinasIngresadasManual = tecnico.cronograma.reduce(
          (sum: number, cronograma: any) => sum + cronograma.cantidadMaquinasAsignadas, 0
        );
  
        let totalMaquinasManuales = tecnico.cronograma.reduce(
          (sum: number, cronograma: any) => sum + cronograma.maquinasMantenimiento, 0
        );
  
        tecnico.TotalMaquinasManuales = totalMaquinasManuales;
        tecnico.TotalMaquinasIngresadasManual = totalMaquinasIngresadasManual;

        if (tecnico.TotalMaquinasManuales == 0) tecnico.colorestadomaquinaria = 'gray';
        else if (tecnico.TotalMaquinasManuales > 0 && tecnico.TotalMaquinasManuales < tecnico.TotalMaquinasIngresadasManual) tecnico.colorestadomaquinaria = '#51B5D9';
        else if (tecnico.TotalMaquinasManuales == tecnico.TotalMaquinasIngresadasManual) tecnico.colorestadomaquinaria = '#5C8300';
        else if (tecnico.TotalMaquinasManuales > tecnico.TotalMaquinasIngresadasManual) tecnico.colorestadomaquinaria = 'red';

      });

      diaMes.totalPorDiaMaquinasIngresadasManual = diaMes.tecnicos.reduce(
        (sum: number, tecnico: any) => sum + tecnico.TotalMaquinasIngresadasManual,
        0
      );
  
      diaMes.totalPorDiaMaquinasManual = diaMes.tecnicos.reduce(
        (sum: number, tecnico: any) => sum + tecnico.TotalMaquinasManuales,
        0
      );
  
      // console.warn(diaMes);

    }); 
    
    this.filteredData = this.dismes;

    // console.warn('======================================');
    // console.warn('<<<<<<<<<<this.filteredData>>>>>>>>>>');
    // console.warn(this.filteredData);
    // console.warn('======================================');

  }
  
  

//#region UnirDatos Antiguo()
  // unirDatos() {
  //   this.dismes = this.resultado.map((diaMes: any) => ({
  //     dia: diaMes.dia,
  //     numero: diaMes.numero,
  //     tecnicos: [],
  //   }));
  
  //   for (const tecnico of this.lisTecnicos) {
  //     for (const diaMes of this.dismes) {
  //       diaMes.tecnicos.push({ ...tecnico, cronograma: [] });
  //     }
  //   }
  
  //   for (const tecnico of this.lisTecnicos) {

  //     const cronogramasTecnico = this.filteredCronos.filter(
  //       (crono: any) => crono.codusertecnic === tecnico.codusertecnic
  //     );
  
  //     for (const cronogramaTecnico of cronogramasTecnico) {
        
  //       const diaMes = this.dismes.find((d: any) => d.numero === cronogramaTecnico.dia);
  //       if (diaMes) {
  //         const tecnicoEnDia = diaMes.tecnicos.find( (t: any) => t.codusertecnic === tecnico.codusertecnic );
  //         if (tecnicoEnDia) { tecnicoEnDia.cronograma.push(cronogramaTecnico); }
  //       }
  //     }  
  //   }

  //   this.filteredData = this.dismes;
  //   this.filteredData.filter((x:any)=>{
  //     console.warn('♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣')
  //     console.warn(x.tecnicos);
  //     console.warn('♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣♣')
  //   })
  
  // }
  //#endregion

  filterByTechnicianName() {
    if (!this.searchText) {
        this.filteredData = this.dismes;
        return;
    }

    this.filteredData = this.dismes.map((diaMes:any) => {
        return {
            ...diaMes,
            tecnicos: diaMes.tecnicos.filter((tecnico:any) => 
                tecnico.nombre.toLowerCase().includes(this.searchText.toLowerCase()) ||
                tecnico.apellido.toLowerCase().includes(this.searchText.toLowerCase())
            )
        };
    });
  }

  filterByDay() {
    if (!this.selectedDay) {
        this.filteredData = this.dismes;
        return;
    }

    this.filteredData = this.dismes.filter((diaMes:any) =>
        diaMes.numero === this.selectedDay || 
        diaMes.dia === this.selectedDay
    );
  }


  obtenerCronoUnit(codcrono: string, codagencia: string, mes: any, dia: any) {
    this.listaManetnimientoMaquinas = [];
    this.codCrono = codcrono;
    this.agenciaChoiceManten = codagencia;
    console.log("🔄 Antes de abrir vista - Estado actual de listaManetnimientoMaquinas:", this.listaManetnimientoMaquinas);

    console.log('listaaaaaaaaaaaaaaaaaaaaaaa',this.listaMantenimientoMaquinaGhost);
    
    this.crono.obtenerDetalleCronoUnit(2, codagencia, mes, dia).subscribe({
        next: (x) => {
            this.listadetalleCronoUnit = x;
            this.resultadosFiltrados = x;
            console.warn('✅ Crono Unit obtenido:', this.listadetalleCronoUnit);
            this.modelUnitCronoDetalle = this.listadetalleCronoUnit[0];
        },
        complete: () => {
            //this.obtenerMaquinaAsignada(codagencia);
            //this.obtenerMantenimiento();
            console.log("🔍 Después de obtenerMantenimiento - listaManetnimientoMaquinas:", this.listaManetnimientoMaquinas);


            setTimeout(() => {
                this.encontrarMaquinasFaltantes();

                // ✅ Verificar si solo hay una máquina disponible
                if (this.listaMaquinariaAsignada.length === 1) {
                    console.log("✅ Solo hay una máquina, se asignará automáticamente.");

                    // 🔹 Obtener la única máquina
                    const maquinaUnica = this.listaMaquinariaAsignada[0];

                    // 🔹 Verificar si la máquina ya está asignada en `listaManetnimientoMaquinas`
                    const maquinaYaAsignada = this.listaManetnimientoMaquinas.find(
                        (m: any) => m.codprod === maquinaUnica.codmaquina
                    );

                    if (maquinaYaAsignada) {
                        console.warn("⚠️ La máquina ya está asignada, no se volverá a guardar.");
                        return; // 🚫 Salimos de la función y no seguimos con la asignación
                    }

                    // 🔹 Buscar técnico ASOCIADO antes de asignar la máquina
                    console.log("🔍 Buscando técnico asignado...");
                    const tecnicoAsociado = this.resultadosFiltrados[0];

                    if (tecnicoAsociado) {
                        this.getTecnico(tecnicoAsociado);
                    }

                    // ⏳ Esperar 500ms para asegurarnos de que `this.tecnicoObtenido` tiene datos antes de asignar
                    setTimeout(() => {
                        console.log("🛠 Técnico obtenido antes de asignar máquina:", this.tecnicoObtenido);

                        if (!this.tecnicoObtenido || Object.keys(this.tecnicoObtenido).length === 0) {
                            console.warn("⚠️ No hay técnico asignado, pero se asignará la máquina de todas formas.");
                        }

                        // 🔹 Marcar la máquina en la lista para que la UI la seleccione
                        maquinaUnica.selected = true;

                        // 🔹 Asignar la máquina automáticamente
                        this.addMaquinaManetenimiento({ target: { checked: true } }, maquinaUnica.codmaquina);

                        // 🔹 Forzar actualización en la UI
                        setTimeout(() => this.cdRef.detectChanges(), 0);

                        // 🔹 ✅ Guardar mantenimiento automáticamente después de la asignación
                        setTimeout(() => {
                            console.log("💾 Guardando mantenimiento automáticamente...");
                            this.guardarMantenimiento();
                        }, 1000);
                    }, 500);
                }
            }, 1000);

            if (this.modelUnitCronoDetalle.length > 0) {
                this.modelUnitCronoDetalle.forEach((x: any) => {
                    if (x.imagen == null || x.imagen == undefined) x.imagen = '';
                });
            }
        }
    });
}










  

  listaMaquinariaAsignada:any = [];
  listaMaquinariaAsignadaGhost:any = [];
  obtenerMaquinaAsignada(codagencia: any) {
    this.client.obtenerMaquinaAgenciaAsignada(codagencia, this.ccia).subscribe({
      next: (maquinaAsignada) => {
        this.listaMaquinariaAsignada = maquinaAsignada;
        console.warn('NO ASIGNADOS');
        console.log(this.listaMaquinariaAsignada);
      },
      error: (e) => {
        console.error(e);
      }, complete: () => {

        this.listaMaquinariaAsignada.filter((element:any)=>{
          let array = {
            "codmaquina":   element.codmaquina,
            "nserie":       element.nserie,
            "tipomaquina":  element.tipomaquina,
            "nombremarca":  element.nombremarca,
            "nombremodelo": element.nombremodelo,
            "tecniconombre":  '',
            "fotoperfil": '',
            "show": false
          }

          this.listaMaquinariaAsignadaGhost = array;

        })

      }
    });
  }

  resmaquinas:any = [];
  encontrarMaquinasFaltantes() {

    const codMaquinasMantenimiento = new Set(
      this.listaMantenimientoMaquinaGhost.map((m: any) => m.codmaquina)
    );
  
    const maquinasFaltantes = this.listaMaquinariaAsignada.filter(
      (maquina: any) => !codMaquinasMantenimiento.has(maquina.codmaquina)
    );
  
    this.resmaquinas = maquinasFaltantes;
    console.log('Maquinas asignadas al mantenimiento:', this.resmaquinas);
    
    this.listaMaquinariaAsignadaGhost = this.resmaquinas;
    console.log('Maquinas Restantes para el mantenimiento:', this.listaMaquinariaAsignadaGhost);

  }

  maquinasEnviadasMantenimiento: any = [];
  encontrarMaquinasRepetidas() {
    const codMaquinasMantenimiento = new Set(
      this.listaMantenimientoMaquinaGhost.map((m: any) => m.codmaquina)
    );
  
    const codMaquinasAsignadas = new Set(
      this.listaMaquinariaAsignada.map((m: any) => m.codmaquina)
    );
  
    const codMaquinasRepetidas = Array.from(codMaquinasMantenimiento).filter(
      codMaquina => codMaquinasAsignadas.has(codMaquina)
    );

    this.maquinasEnviadasMantenimiento = codMaquinasRepetidas
    console.log('Máquinas que se repiten:', this.maquinasEnviadasMantenimiento);
  }
  
  


    listaMaquinaMantenimiento: any = [];
    listaMantenimientoMaquinaGhost:  any = [];
    obtenerMantenimiento() {    
      let year = new Date().getFullYear();
      this.manteniminetocount = 0;
      this.mantenimineto.obtenerMantenimientos(this.agenciaChoiceManten, this.mes,  year, this.idLocalidad).subscribe({
        next: (mantenimiento) => {
          this.listaMaquinaMantenimiento = mantenimiento; 
          this.listaMantenimientoMaquinaGhost = mantenimiento;
          // console.warn('--------MANTENIMIENTO--------');
          // console.warn(this.listaMaquinaMantenimiento);
        }
      });
    }
  
  
    obtenerCrono(mes:number, userTecnic:string, tipo: number) {

      this._show_spinner   = true;
      this.sumatoriaFilter = 0;
      this.filteredCronos  = [];
      this.crono.obtenerCronograma( this.ccia,
                                    this.anioactual,
                                    mes,
                                    this.idLocalidad,
                                    tipo, userTecnic )
                                    .subscribe (
        {
          next: (x) => {
             this.filteredCronos =  x;
            this.filteredCronos.filter( (cli:any) => {
              cli.imagen = this.env + cli.imagen;
            })
          },
          error: (e) => {
            this._show_spinner = false;
            console.error(e);
          },
          complete: () => {
            this._show_spinner = false;
            this.unirDatos();
          }
        }
      )
    }
    


  obtenerUsuario() {
    this._show_spinner = true;
    this.listUsuarios = [];

    if (this.viewtecnicosform.controls['tecnicoLocal'].value) {
      this.us.obtenerUsuariosCronos(this.idLocalidad).subscribe({
        next: (usuarios) => {
          this.listUsuarios = usuarios;
        }, error: (e) => {
          console.error(e);
          this._show_spinner = false;
        }, complete: () => {
          this.lisTecnicos = [];
          this.listUsuarios.filter( (element:any) => {
              const arr = {
                  "imagenPerfil":  element.imagenPerfil,
                  "codusertecnic": element.coduser,
                  "email":         element.email,
                  "nombre":        element.nombre,
                  "apellido":      element.apellido,
                  "cedula":        element.cedula,
                  "cargo":         element.cargo,
                  "nombreCargo":   element.nombreCargo,
                  "contrasenia":   element.contrasenia,
                  "estado":        element.estado,
                  "nombreEstado": element.nombreEstado,
                  "edad": element.edad,
                  "tipo": element.tipo,
                  "movilidad": element.movilidad,
                  "nombreMovilidad": element.nombreMovilidad,
                  "codcaracteristicas": element.codcaracteristicas,
                  "nombreCapacidad": element.nombreCapacidad,
                  "valoracion": element.valoracion,
                  "codProvincia": element.codProvincia.trim(),
                  "nombreProvincia": element.nombreProvincia,
                  "codCanton": element.codCanton.trim(),
                  "nombreCanton": element.nombreCanton,
                  "codSexo": element.codSexo.trim(),
                  "nombreSexo": element.nombreSexo,
                  "codEstadoCivil": element.codEstadoCivil,
                  "nombreEstadoCivil": element.nombreEstadoCivil,
                  "codDepartamento": element.codDepartamento,
                  "nombreDepartamento": element.nombreDepartamento,
                  "codLicencia": element.codLicencia,
                  "nombreLicencia": element.nombreLicencia,
                  "telf": element.telf,
                  "direccion": element.direccion
              }
  
              this.lisTecnicos.push(arr);
              this._show_spinner = false;
  
          })
          
          this.obtenerCrono(this.mes, 'void',3);

        }

      })
    } else if ( !this.viewtecnicosform.controls['tecnicoLocal'].value ) {
      this.us.obtenerUsuarios(this.ccia).subscribe({
        next: (usuarios) => {
          this.listUsuarios = usuarios;
        }, error: (e) => {
          console.error(e);
          this._show_spinner = false;
        },complete: () => {
          this.lisTecnicos = [];
          this.listUsuarios.filter( (element:any) => {
            if( element.tipo == '003' ) {
  
              const arr = {
                  "imagenPerfil": element.imagenPerfil,
                  "codusertecnic": element.coduser,
                  "email": element.email,
                  "nombre": element.nombre,
                  "apellido": element.apellido,
                  "cedula": element.cedula,
                  "cargo": element.cargo,
                  "nombreCargo": element.nombreCargo,
                  "contrasenia": element.contrasenia,
                  "estado": element.estado,
                  "nombreEstado": element.nombreEstado,
                  "edad": element.edad,
                  "tipo": element.tipo,
                  "movilidad": element.movilidad,
                  "nombreMovilidad": element.nombreMovilidad,
                  "codcaracteristicas": element.codcaracteristicas,
                  "nombreCapacidad": element.nombreCapacidad,
                  "valoracion": element.valoracion,
                  "codProvincia": element.codProvincia.trim(),
                  "nombreProvincia": element.nombreProvincia,
                  "codCanton": element.codCanton.trim(),
                  "nombreCanton": element.nombreCanton,
                  "codSexo": element.codSexo.trim(),
                  "nombreSexo": element.nombreSexo,
                  "codEstadoCivil": element.codEstadoCivil,
                  "nombreEstadoCivil": element.nombreEstadoCivil,
                  "codDepartamento": element.codDepartamento,
                  "nombreDepartamento": element.nombreDepartamento,
                  "codLicencia": element.codLicencia,
                  "nombreLicencia": element.nombreLicencia,
                  "telf": element.telf,
                  "direccion": element.direccion
              }
              this.lisTecnicos.push(arr);
            }
            this._show_spinner = false;
  
          })
          this.obtenerCrono(this.mes, 'void', 3);
        }
      })
    } 
  }

  draggedItem: any;
  codFrecuencyChoice: any;
  dragStart = (data: any) => {
    this.codFrecuencyChoice = data.codfrecuencia;
    this.draggedItem = data;
  }
  
  modelCrono: any = [];
  listaCronoGenerada:any = [];
  drop = (diames:any, tecnico:any, data:any) => {

    if (this.draggedItem) {

      let xuser: any = sessionStorage.getItem('UserCod');

      let anio = new Date().getFullYear();
      let mes  = new Date().getMonth();
      const codigoCrono    = 'CRONO-'+this.DataMaster.generateRandomString(15)+'-'+mes.toString()+anio.toString();
      
      this.modelCrono = 
      {
        "codcrono":           codigoCrono,
        "codusertecnic":      tecnico.codusertecnic,
        "codagencia":         this.draggedItem.codagencia,
        "observacion":        '',
        "feccrea":            new Date(),
        "codusercreacrono":   xuser,
        "semanainicio":       0,
        "dia":                Number(diames.numero),
        "mes":                this.mes,
        "anio":               this.anioactual,
        "fechamantenimiento": (this.mes)+'-'+1+'-'+this.anioactual,
        "maquinasmanuales":   this.draggedItem.cantidadMaqIngre,
        "Codlocalidad":       this.idLocalidad,
        "Estado":             0,
        "idRequer":           0
      }

      const dia = diames.numero;
      const diaMes = this.dismes.find((d: any) => d.numero === dia);
      if (diaMes) {
        const tecnicoEnDia = diaMes.tecnicos.find((t: any) => t.codusertecnic === tecnico.codusertecnic);
        if (tecnicoEnDia) {
          tecnicoEnDia.cronograma.push(this.draggedItem);
        }
      }

      this.guardarCrono( this.modelCrono, tecnico.nombre + ' ' + tecnico.apellido );      
      // this.selectAll = true;
        this.crone.guardarCronoInteligente( this.codFrecuencyChoice, codigoCrono ).subscribe(
          {
            next: (x) => {
              this.listaMaquinariaAsignada.filter( (x:any) => {
                this.addMaquinaManetenimiento(true, x.codmaquina);
              })
            }, error: (e) => {
              console.error(e);
            },complete: () => {
              //this.obtenerCronoUnit(codigoCrono,  this.modelCrono.codagencia, this.mes, Number(diames.numero));
              this.selectAllMachine();
              // this.obtenerMaquinaAsignada(this.modelCrono.codagencia);
            }
          } 
        )  
      
    }
  }  

  copiarCrono(data:any, id:any) {
    this.copy = true;
    this.copyNombreAgencia = data.nombreAgencia;
    this.copyImagenAgencia = data.imagen;
    this.idcopy = id;
    let x = <HTMLDivElement>  document.getElementById(this.idcopy);
    x.style.transition = 'ease-in all 1s';
    x.style.border = 'groove 2px whitesmoke !important';
    x.style.backgroundColor = '#B4FAE5';
    x.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.5)';
    this._background_crono = '#F5E6B9 !important';
    this.copyCodCrono   = data.codcrono;
    this.copyCodAgencia = data.codagencia;
    this.copyCantMaqIngre = data.cantidadMaqIngre;
  }

  cancelCopy() {
    this._background_crono = 'rgb(255, 252, 238)';
    let x = <HTMLDivElement>  document.getElementById(this.idcopy);
    x.style.backgroundColor = 'transparent';
    x.style.boxShadow = '0px 0px 0px rgba(0,0,0,0.0)';
    setTimeout(() => {
      this.copy = false;
    }, 1000);

  }


  countCrono:number = 1;
  pegarCrono(dataDate:any, dataTecnic: any) {
    if( this.copy ) {
      let xuser: any = sessionStorage.getItem('UserCod');
      let codusertecnic = dataTecnic.codusertecnic;
      let diaPaste = dataDate.numero;
      let nombreTecnic = dataTecnic.nombre + ' ' + dataTecnic.apellido;
      let mes = this.mes;

      this.countCrono ++
      this.modelCrono = {
          "codcrono":           'co'+this.countCrono+this.copyCodCrono,
          "codusertecnic":      codusertecnic,
          "codagencia":         this.copyCodAgencia,
          "observacion":        '',
          "feccrea":            new Date(),
          "codusercreacrono":   xuser,
          "semanainicio":       0,
          "dia":                diaPaste,
          "mes":                mes,
          "anio":               new Date().getFullYear(),
          "fechamantenimiento": (this.mes)+'-'+1+'-'+new Date().getFullYear(),
          "maquinasmanuales":   this.copyCantMaqIngre,
          "Codlocalidad":       this.idLocalidad,
          "Estado":             0,
          "idRequer":           0
      }

      // console.warn(this.modelCrono);
      this.guardarCrono( this.modelCrono, nombreTecnic );
    }
  }

  guardarCrono( modelCrono:any, tecnico:string ) {
    this._show_spinner = true;
    this.crono.guardarCronos(modelCrono).subscribe (
      {
        next: (x) => {
          this._show_spinner = false;
          Toast.fire({ icon: 'success',
                       title: 'Trabajo asignado al técnico: ' + tecnico+'.',
                       text: 'Esperando la confirmación del trabajo para cambiar de estado.',
                       timer: 2500  });
        }, error: (e) => {
          this._show_spinner = false;
          Toast.fire({ icon: 'error',
                       title: 'No se ha podido agregar este trabajo al ' + tecnico+'.' });
        }, complete: () => { 
          this.obtenerCrono(modelCrono.mes, 'void', 3)
          this.actualizarEstadoAgencia(2, this.modelCrono.codagencia);
          this._show_spinner = false;
        }
      }
    )
  }
  
  dragEnd = () => {
    /* Limpia el elemento arrastrado 
    después de agregarlo al cronograma */
    this.draggedItem = null;
  }
  
}

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], filter: any): any[] {
    if (!items || !filter) {
      return items;
    }
    return items.filter(item => item.dia === filter.dia);
  }
}


