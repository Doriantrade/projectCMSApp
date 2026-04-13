import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';

import Swal from 'sweetalert2'
import { ModalCronogramaComponent } from './modal-cronograma/modal-cronograma.component';
import { ClienteService } from '../clientes/services/cliente.service';
import { FormControl, FormGroup } from '@angular/forms';
import { CronogramaService } from './services/cronograma.service';
import { SharedService } from 'src/app/components/shared/services/shared.service';
import { MatTableDataSource } from '@angular/material/table';
import { UserService } from '../usuario/services/user.service';
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

interface DiaModel {
  dianombre: string;
  fecha: string;
  nombreTecnico: string;
  codfrecuencia: string;
  frecuencia: string;
  nombreCliente: string;
  nombreAgencia: string;
  codcrono: string;
  codusertecnic: string;
  codagencia: string;
  observacion: string;
  feccrea: string;
  codusercreacrono: string;
  semanainicio: number;
  mes: number;
  dia: number;
  anio: number;
  fechamantenimiento: string;
  maquinasmanuales: number;
  dias?: any[]; 
  numero?: number; 
  color: any
}

@Component({
  selector: 'app-cronograma',
  templateUrl: './cronograma.component.html',
  styleUrls: ['./cronograma.component.scss']
})
export class CronogramaComponent implements OnInit {
  pMod: number = 4;

  _crono_calendar:boolean = false;
  _crono_grid:boolean     = false;
  _crono_new_dis: boolean = true;
  usuario_tecnico: string = '';
  public dataSource!: MatTableDataSource<any>;
  public dataSourceTecnicos!: MatTableDataSource<any>;
  _agencia_tabla:boolean = true;
  _agencia_es_bol:boolean = false;
  _tecnico_tabla:boolean = true;
  _tecnico_escogido:boolean = false;
  numero_maquina:any;
  fecha_mantenimiento:any;
  @ViewChild(MatPaginator)
  paginatorAgencia!: MatPaginator;
  columnHead:         any = [ 'nombreCliente',  'nombre', 'mantenimiento', 'cantidadMaquinaAgencia', 'action' ];
  columnHeadTecnicos:         any = [ 'nombre', 'nombreProvincia', 'action' ];
  anioActual: number = 0;
  ccia:               any;
  _show_spinner:      boolean = false; 
  lisTecnicos: any = [];
  @Input() modulo: any = [];
  _class_btn = 'btn btn-outline-secondary';
  _icon_button: string    = 'add';
  _action_butto: string   = 'Crear';
  _cancel_button: boolean = false;
  _delete_show:boolean    = true;
  _dis_btn:boolean        = true;
  agencia_esc:string      = '';
  codagencia:string = '';
  coduser:string = '';
  semanainicial:number=0;
  fecha:any;
  dia:any;
  anio:any;
  mes:any;
  data: any;

  options: any;
  public agenciaForm = new FormGroup(
    {
      codcliente:        new FormControl('')
    }
  )

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  @ViewChild(MatPaginator)
  paginatorTecnicos!: MatPaginator;

  constructor( private us: UserService, public dialog: MatDialog, 
               private client: ClienteService, private crono: CronogramaService,
               private DataMaster: SharedService ) { }

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    this.ccia = sessionStorage.getItem('codcia');
    this.anioActual = new Date().getFullYear();
    this.obtenerCliente();
    this.calcularDiasRestantes();

    /**
     * INICIO DEL GRAFICO TECNICOS
     */


    const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.data = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
              {
                  label: 'Mantenimientos',
                  backgroundColor: documentStyle.getPropertyValue('--purple-500'),
                  borderColor: documentStyle.getPropertyValue('--purple-500'),
                  data: [28, 48, 40, 19, 86, 27, 90]
              },
              // {
              //     label: 'My First dataset',
              //     backgroundColor: documentStyle.getPropertyValue('--blue-500'),
              //     borderColor: documentStyle.getPropertyValue('--blue-500'),
              //     data: [65, 59, 80, 81, 56, 55, 40]
              // }
            ]
        };

        this.options = {
            indexAxis: 'x',
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500
                        }
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };

    /**
     * FIN
     */

  }

  onSubmit() {
    console.log(this.agenciaForm.value);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applyFilterTecnico(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceTecnicos.filter = filterValue.trim().toLowerCase();
  }

  meses: string[] = [ 'enero', 'febrero', 'marzo', 
                      'abril', 'mayo', 'junio', 
                      'julio', 'agosto', 'septiembre', 
                      'octubre', 'noviembre', 'diciembre' ];

  
  diasPorSemana: DiaModel[] = [];
  obtenerDias(mes: string) {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth();
    const añoActual = fechaActual.getFullYear();
    const esAnioBisiesto = this.esAnioBisiesto(añoActual);
    
    // Obtener el número de días en el mes
    let ultimoDia: number;
    if (mes === 'febrero' && esAnioBisiesto) {
      ultimoDia = 29;
    } else {
      ultimoDia = new Date(añoActual, this.obtenerNumeroMes(mes), 0).getDate();
    }
    
    // Limpiar el array de días por semana
    this.diasPorSemana = [];
    
    // Iterar para agrupar los días por semanas
    let semana: any = { numero: 1, dias: [] };
    for (let dia = 1; dia <= ultimoDia; dia++) {
      const fecha = new Date(añoActual, this.obtenerNumeroMes(mes) - 1, dia);
      const nombreDia = this.obtenerNombreDia(fecha.getDay());
      
      semana.dias.push({
        dianombre: nombreDia,
        fecha: fecha.toLocaleDateString(),
        nombreTecnico: "",
        codfrecuencia: "",
        frecuencia: "",
        nombreCliente: "",
        nombreAgencia: "",
        codcrono: "",
        codusertecnic: "",
        codagencia: "",
        observacion: "",
        feccrea: "",
        codusercreacrono: "",
        semanainicio: semana.numero,
        mes: null,
        dia: fecha.getDay()+1,
        anio: null,
        fechamantenimiento: null,
        maquinasmanuales: null
      });
      
      // Si es el último día de la semana, agregar la semana al array y comenzar una nueva semana
      if (fecha.getDay() === 6 || dia === ultimoDia) {
        this.diasPorSemana.push(semana);
        semana = { numero: semana.numero + 1, dias: [] };
      }
    }
  }

listacrono: any = [];
listacronoGhost: any = [];
cronograma(anio: number, mes: string) {

  let xmes = 0;
  if (mes === 'enero') xmes = 1;
  else if (mes === 'febrero') xmes = 2;
  else if (mes === 'marzo') xmes = 3;
  else if (mes === 'abril') xmes = 4;
  else if (mes === 'mayo') xmes = 5;
  else if (mes === 'junio') xmes = 6;
  else if (mes === 'julio') xmes = 7;
  else if (mes === 'agosto') xmes = 8;
  else if (mes === 'septiembre') xmes = 9;
  else if (mes === 'octubre') xmes = 10;
  else if (mes === 'noviembre') xmes = 11;
  else if (mes === 'diciembre') xmes = 12;

  this.listacrono = [];
  this.listacronoGhost = [];

  this.crono.obtenerCronograma(this.ccia, anio, xmes, 0, 1, 'void').subscribe({
    next: (listaCronograma:any) => {
      this.listacronoGhost = listaCronograma;
      const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

      this.listacronoGhost.forEach((element: any) => {
        const fechaString = element.mes + '/' + element.dia + '/' + element.anio;
        const diaModel: DiaModel = {
          dianombre: nombresDias[element.dia],
          fecha: element.mes + '/' + element.dia + '/' + element.anio,
          nombreTecnico: element.nombreTecnico,
          codfrecuencia: element.codfrecuencia,
          frecuencia: element.frecuencia,
          nombreCliente: element.nombreCliente,
          nombreAgencia: element.nombreAgencia,
          codcrono: element.codcrono,
          codusertecnic: element.codusertecnic,
          codagencia: element.codagencia,
          observacion: element.observacion,
          feccrea: element.feccrea,
          codusercreacrono: element.codusercreacrono,
          semanainicio: element.semanainicio,
          mes: element.mes,
          dia: element.dia,
          anio: element.anio,
          fechamantenimiento: element.fechamantenimiento,
          maquinasmanuales: element.maquinasmanuales,
          color: '#FFEEBD'
        };

        let semana = this.diasPorSemana.find((s) => s.numero === diaModel.semanainicio);
        if (semana) {
          if (semana.dias) {
            const diaExistente = semana.dias.find((d) => d.fecha === diaModel.fecha);
            if (diaExistente) {
              Object.assign(diaExistente, diaModel);
            } else {
              semana.dias.push(diaModel);
            }
          } else {
            semana.dias = [diaModel];
          }
        } else {
          const nuevaSemana: DiaModel = {
            dianombre:          nombresDias[element.dia],
            fecha:              element.fecha,
            nombreTecnico:      '',
            codfrecuencia:      '',
            frecuencia:         '',
            nombreCliente:      '',
            nombreAgencia:      '',
            codcrono:           '',
            codusertecnic:      '',
            codagencia:         '',
            observacion:        '',
            feccrea:            '',
            codusercreacrono:   '',
            semanainicio:       element.semanainicio,
            mes:                element.mes,
            dia:                element.dia,
            anio:               element.anio,
            fechamantenimiento: '',
            maquinasmanuales:   0,
            color:              '#FFEEBD'
          };
          nuevaSemana.dias = [diaModel];
          this.diasPorSemana.push(nuevaSemana);
        }
      });

      console.log(this.listacrono);
      console.log(this.diasPorSemana);
    }
  });
}



  obtenerNumeroMes(mes: string): number {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return meses.indexOf(mes.toLowerCase()) + 1;
  }
  
  esAnioBisiesto(anio: number): boolean {
    return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
  }
  
  obtenerNombreDia(numeroDia: number): string {
    const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return nombresDias[numeroDia];
  }

  obtenerData(semana:any,fecha:any) {

    
    this.semanainicial = semana.numero;
    this.fecha = fecha.fecha;
    const fechSplit = this.fecha.toString();
    const fechas = fechSplit.split('/');
    this.dia  = fechas[1].trim();
    this.mes  = fechas[0].trim();
    this.anio = fechas[2].trim();
    console.log(fecha)
    console.log(fechSplit)
    console.log(fechas)
    console.log(this.dia)
    console.log(this.mes)
    console.log(this.anio)
  }

  existCli() {
    if( this.agenciaForm.controls['codcliente'].value == undefined ||
        this.agenciaForm.controls['codcliente'].value == null ||
        this.agenciaForm.controls['codcliente'].value == '' ) {
        this._dis_btn = true;
        this._class_btn = 'btn btn-outline-secondary';
    }
    else {
      this._dis_btn = false;
      this._class_btn = 'btn btn-outline-primary';
    }
  }

  seleccionarTecnico(data:any) {
    this.coduser = data.coduser;
    this.usuario_tecnico   = data.nombre + ' ' + data.apellido;
    this._tecnico_escogido = true;
    this._tecnico_tabla    = false;
  }

  cantidadmaquina:number = 0;
  seleccionarAgencia(data:any) {
    // this.cantidadmaquina = data.cantidadMaquinaAgencia;
    this.codagencia      = data.codagencia;
    this.agencia_esc     = data.nombre;
    this._agencia_tabla  = false;
    this._agencia_es_bol = true;
    this.numero_maquina = data.cantidadMaquinaAgencia
  }

  calcularDiasFinales: any;
  calcularDiasRestantes(): void {
    const fechaActual: Date = new Date();
    const ultimoDiaAnio: Date = new Date(fechaActual.getFullYear(), 11, 31);
    const milisegundosPorDia: number = 24 * 60 * 60 * 1000;
    const diasRestantes: number = Math.round((ultimoDiaAnio.getTime() - fechaActual.getTime()) / milisegundosPorDia);
    this.calcularDiasFinales = diasRestantes;
    console.log(this.calcularDiasFinales);
  }

  openDialog(): void {

    const dialogRef = this.dialog.open( ModalCronogramaComponent, {
      height: '700px',
      width: '80%',
      data: {
        codcli: this.agenciaForm.controls['codcliente'].value
      }
      
    });

    dialogRef.afterClosed().subscribe( result => {      
      console.warn( result );
    });

  }

  labeldescription = '';
  validarMaquinaria(value:number) {
    if ( value > this.cantidadmaquina  ) {
      this.labeldescription = 'Esta superando el límite de maquinas que esta agencia tiene asignada, debe ingresar estas máquianas más adelante y escribir una observación';
    } else {
      this.labeldescription = '';
    }
  }

  listAgencias:any = [];
  obtenerAgencias() {
    this._show_spinner = true;
    this.client.obtenerAgencias(this.ccia, this.agenciaForm.controls['codcliente'].value, 'void').subscribe(
      {
        next: (agencias) => {
          this.listAgencias = agencias;
          console.log(this.listAgencias);
        },
        error: (e) => {
          console.error(e);
        },
        complete: () => {
          this.dataSource = new MatTableDataSource(this.listAgencias);
          this.dataSource.paginator = this.paginatorAgencia;
          this._show_spinner = false;
        }
    })
  }

  modelCrono:any = [];
  observacion:string='';
  guardarCronograma() {

    this._show_spinner = true;
    const usercrono: any = sessionStorage.getItem('UserCod');
    const codigoCrono    = 'CRONO-'+this.DataMaster.generateRandomString(15);

    this.modelCrono = {
      "codcrono":           codigoCrono,
      "codusertecnic":      this.coduser,
      "codagencia":         this.codagencia,
      "observacion":        this.observacion,
      "feccrea":            new Date(),
      "codusercreacrono":   usercrono,
      "semanainicio":       this.semanainicial,
      "mes":                this.mes,
      "dia":                this.dia,
      "anio":               this.anio,
      "fechamantenimiento": this.fecha_mantenimiento,
      "maquinasmanuales":   this.numero_maquina
    }

    console.log(this.modelCrono);

    this.crono.guardarCronos(this.modelCrono).subscribe({
      next: (x) => {
        this._show_spinner = false;
        Swal.fire(
          'Guardado con éxito!',
          'El cronograma ha sido guardado',
          'success'
        )
      }, error: (e) => {
        this._show_spinner = false;
        Swal.fire(
          'Oops!',
          'No se ha podido guardar',
          'error'
        )
      }, complete: () => {
        this.cronograma(this.anio, this.mes);
        this.clean();
      }
    })

  }
  
  
  clean() {
    this._tecnico_escogido = false;
    this._tecnico_tabla    = true;
    this.observacion = '';
    this.numero_maquina = 0;
    this._agencia_es_bol   = false;
    this._agencia_tabla    = true;
  }

  listaClientes: any = [];
  obtenerCliente() {
    this._show_spinner = true;
    this.client.obtenerClientes(this.ccia,2).subscribe({
      next: (clientes) => {
        this.listaClientes = clientes;
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

  listUsuarios:any = [];
  obtenerUsuario() {
    this.us.obtenerUsuarios(this.ccia).subscribe({
      next: (usuarios) => {
        this.listUsuarios = usuarios;
        // console.log(this.listUsuarios)
      }, error: (e) => {
        console.error(e);
      },complete: () => {
        this.listUsuarios.find( (element:any) => {
          if( element.tipo == '003' ) {
            this.lisTecnicos.push(element);
            this.dataSourceTecnicos = new MatTableDataSource(this.lisTecnicos);
            this.dataSourceTecnicos.paginator = this.paginatorTecnicos;
          }
        })
      }
    })
  }

}
