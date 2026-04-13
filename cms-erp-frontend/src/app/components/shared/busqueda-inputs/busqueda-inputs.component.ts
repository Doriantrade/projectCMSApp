import { Component, OnInit } from '@angular/core';
import { UserService } from '../../dashboard/app-dashboards/usuario/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { ClienteService } from '../../dashboard/app-dashboards/clientes/services/cliente.service';
import { CronogramaService } from '../../dashboard/app-dashboards/cronograma/services/cronograma.service';
import { SharedService } from '../services/shared.service';
import { MantenimientoCronogramaService } from '../../dashboard/app-dashboards/crono-grid/services/mantenimiento-cronograma.service';
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
  selector: 'app-busqueda-inputs',
  templateUrl: './busqueda-inputs.component.html',
  styleUrls: ['./busqueda-inputs.component.scss']
})
export class BusquedaInputsComponent implements OnInit {

  constructor(private us: UserService,
    public dialog: MatDialog,
    private client: ClienteService,
    private crono: CronogramaService,
    private DataMaster: SharedService,
    private mantenimineto: MantenimientoCronogramaService) { }

  ngOnInit(): void {
  }


  
  maqsel:boolean = false;
  ccia:any;
  listaManetnimientoMaquinas: any = [];
  selectAll: boolean = false;
  selectAllMachine(coduser: any) {
    this.ccia = sessionStorage.getItem('codcia');   
    
    this.listaMaquinariaAsignadaGhost.forEach((maquina: any) => {
      maquina.selected = this.selectAll;
      if (this.selectAll && !this.listaManetnimientoMaquinas.find((item: any) => item.codprod === maquina.codmaquina)) {
          this.addMaquinaManetenimiento({ target: { checked: true } }, maquina.codmaquina, coduser.codusertecnic);
          this.listaMaquinariaAsignadaGhost.filter((element:any) => {
              element.tecniconombre = coduser.tecnico;
              element.fotoperfil = coduser.imagenTecnico;
              element.show = true;            
          })
      } else if (!this.selectAll) {
          this.listaManetnimientoMaquinas = this.listaManetnimientoMaquinas.filter((item: any) => item.codprod !== maquina.codmaquina);
          this.listaMaquinariaAsignadaGhost.filter((element:any) => {

            element.tecniconombre = '';
            element.fotoperfil = '';
            element.show = false;

        })
      }
    });

  }

  addMaquinaManetenimiento(event: any, codmachine: any, coduser:any) {

    const xuser: any = sessionStorage.getItem('UserCod');
    if (event.target.checked) {
        const array = {
            codcrono: this.codCrono,
            codtecnico: coduser.codusertecnic,
            feciniciomante: null,
            feccrea: new Date(),
            fecfinmant: null,
            horainit: 0,
            horafin: 0,
            usercrea: xuser,
            codprod: codmachine,
            estado: 1
        };

        this.listaManetnimientoMaquinas.push(array);

        this.listaMaquinariaAsignadaGhost.filter((element:any) => {
          if( codmachine == element.codmaquina) {
            element.tecniconombre = coduser.tecnico;
            element.fotoperfil = coduser.imagenTecnico;
            element.show = true;
          }
        })
        
    } else {
        this.listaManetnimientoMaquinas = this.listaManetnimientoMaquinas.filter((item: any) => item.codprod !== codmachine);

        this.listaMaquinariaAsignadaGhost.filter((element:any) => {
          if( codmachine == element.codmaquina) {
            element.tecniconombre = '';
            element.fotoperfil = '';
            element.show = false;
          }
        })

    }

  }

  filtrarAsignacionTecnicoMaquina () {
    this.resultadosFiltrados = this.listadetalleCronoUnit.filter((item:any) =>
      item.nombremarca.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      item.nombremodelo.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      item.nserie.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      item.nombreTipoMaquina.toLowerCase().includes(this.filtroTexto.toLowerCase())
    );
  }

  guardarMantenimiento() {

    console.warn(this.listaManetnimientoMaquinas);

    this.listaManetnimientoMaquinas.filter((element:any)=>{

    this.mantenimineto.guardarMantenimiento(element).subscribe({
        next:(x) => {
          Toast.fire({ icon: 'success', title: 'Asignación ha sido completada' })
          console.log(x);
        }, error: (e) => {
          Toast.fire({ icon: 'error', title: 'No se ha podido completar la asignación' })
          console.log(e);
        }, complete: () => {
          this.obtenerMantenimiento();
        }
      }
    )
    }
    )

  }

 
  _show_spinner: boolean = false;
  eliminarMantenimiento( id:number ) {
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
        this.mantenimineto.eliminarMantenimiento( id ).subscribe({
          next: (x) => {
            this._show_spinner = false;
            Swal.fire(
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
            // this.obtenerMantenimiemnto();
          } 
          })
        }
    })
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
      // this.mantenimineto.obtenerMantenimientos(this.codCrono).subscribe({
      //   next: (mantenimiento) => {
      //     this.listaMantenimientoMaquinaGhost = mantenimiento;
      //     console.warn('--------MANTENIMIENTO--------');
      //     console.warn(this.listaMantenimientoMaquinaGhost);
      //   }
      // });
    }

  listadetalleCronoUnit: any = [];
  modelUnitCronoDetalle: any = [];
  resultadosFiltrados: any = [];
  codCrono:string = '';
  obtenerCronoUnit(codcrono:string, codagencia:string, mes:any, dia:any) {

    this.codCrono = codcrono;

    this.crono.obtenerDetalleCronoUnit(2, codagencia, mes, dia).subscribe({
      next: (x) => {
        this.listadetalleCronoUnit = x;
        this.resultadosFiltrados = x;
        console.warn(this.listadetalleCronoUnit);
        this.modelUnitCronoDetalle = this.listadetalleCronoUnit[0];
        console.warn('============================');
        // console.warn('modelUnitCronoDetalle');
        console.warn(this.resultadosFiltrados);
        console.warn('============================');
      }, complete: () => {

        
        this.obtenerMaquinaAsignada(codagencia)
        this.obtenerMantenimiento();
        setTimeout(() => {
          this.encontrarMaquinasFaltantes();
          // this.encontrarMaquinasRepetidas();
        }, 1000);


      }
    })
  }

  filtroTexto: string = '';
  filtrarElementos() {
    this.resultadosFiltrados = this.listadetalleCronoUnit.filter((item:any) =>
      item.nombremarca.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      item.nombremodelo.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      item.nserie.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      item.nombreTipoMaquina.toLowerCase().includes(this.filtroTexto.toLowerCase())
    );
  }

  kal:boolean = true;
  catchData() {
    
  }


}
