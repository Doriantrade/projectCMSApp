import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CronoGridComponent } from '../crono-grid.component';
import { FormControl, FormGroup } from '@angular/forms';
import { ClienteService } from '../../clientes/services/cliente.service';
import { UserService } from '../../usuario/services/user.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CronogramaService } from '../../cronograma/services/cronograma.service';
import Swal from 'sweetalert2'
import { SharedService } from 'src/app/components/shared/services/shared.service';
interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

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
  selector: 'app-modal-detalle-crono',
  templateUrl: './modal-detalle-crono.component.html',
  styleUrls: ['./modal-detalle-crono.component.scss']
})
export class ModalDetalleCronoComponent implements OnInit {
  pMod: number = 4;

  listaClientes:any = [];
  _show_spinner: boolean = false;
  filteredusers: any[] = [];
  agencia: any = [];
  UsuarioTecnico:any = [];
  clientes: any[] = [];
  filteredcliente: any[] = [];
  users: any[] = [];
  ccia:      any;
  resultado: any = [];
  public cronoForm = new FormGroup({
    ndia:            new FormControl(),
    codcliente:      new FormControl(),
    codagencia:      new FormControl(),
    codusertecnico:  new FormControl(),
    nmaquinas:       new FormControl(),
    observacion:     new FormControl(),
  })

  constructor(public dialogRef: MatDialogRef<CronoGridComponent>, private us: UserService, private DataMaster: SharedService,
    @Inject(MAT_DIALOG_DATA) public data: any,private client: ClienteService, private crono: CronogramaService,) { }


  clientecod:any;
  agenciacod:any;
  tecnicocod:any; 
  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;


    console.warn('%%%%%%%%%%%%%%%%%%%%%%%%%')
    console.warn('DATA ENVIADA AL MODAL')
    console.warn(this.data)
    console.warn('%%%%%%%%%%%%%%%%%%%%%%%%%')

    this.cronoForm.controls['ndia'].setValue(this.data.dia);
    this.cronoForm.controls['codcliente'].setValue(this.data.codcli);
    this.cronoForm.controls['codagencia'].setValue(this.data.codagencia);
    this.cronoForm.controls['codusertecnico'].setValue(this.data.codusertecnic);
    this.cronoForm.controls['nmaquinas'].setValue(this.data.maquinasmanuales);
    this.cronoForm.controls['observacion'].setValue(this.data.observacion);
    this.ccia = sessionStorage.getItem('codcia');   
    this.obtnClientes();
    this.obtnUsuarioTecnicos();
    this.diasdelMes(this.data.mes, this.data.anio);
  }

  obtnClientes () {
    
    this.client.obtenerClientes(this.ccia,2).subscribe({
      next: (x) => {
        if (Array.isArray(x)) {
          this.listaClientes = x;
          console.log(this.listaClientes);

          this.listaClientes.filter((element:any)=>{            
              let arr = {
                name: element.nombre, code: element.codcliente
              }
              this.clientes.push(arr);            
          })
          console.warn(this.clientes);
        }

      }, complete: () => {
        // console.log(this.agenciaForm.controls['codagencia'].value);
      }
    })
  }


  filterUsuario(event: AutoCompleteCompleteEvent) {
    
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < (this.users as any[]).length; i++) {
      let usuario = (this.users as any[])[i];
      if (usuario.name.toLowerCase().includes(query)) {
        filtered.push(usuario);
      }
    }

    this.filteredusers = filtered;
    console.log(this.filteredusers)

  }


  obtnUsuarioTecnicos() {
    this.us.obtenerUsuarios(this.ccia).subscribe(
      {
        next: (x: any) => {
          if (Array.isArray(x)) {
            this.UsuarioTecnico = x;
            console.log(this.UsuarioTecnico);

            this.UsuarioTecnico.filter((element:any) => {
              if ( element.tipo == '003' ) {
                let arr = {
                  name: element.nombre + ' ' + element.apellido, code: element.coduser
                }
                this.users.push(arr);
              }
            })
            console.warn(this.users);
          }
        }
      }
    );
  }

  modelUnitCrono:any = [];
  sendCrono( type:number ) {

    switch( type ) {   
      case 1:

        console.warn('------------------------');
        console.warn('codcrono');
        console.warn(this.data.codcrono);
        console.warn(this.data.codcrono);
        console.warn('------------------------');

        this.modelUnitCrono = {
          "codcrono":           this.data.codcrono,
          "codusertecnic":      this.cronoForm.controls['codusertecnico'].value.code || this.data.codusertecnic,
          "codagencia":         this.cronoForm.controls['codagencia'].value.code || this.data.codagencia,
          "observacion":        this.cronoForm.controls['observacion'].value,
          "feccrea":            this.data.feccrea,
          "codusercreacrono":   this.data.codusercreacrono,
          "semanainicio":       this.data.semanainicio,
          "dia":                this.cronoForm.controls['ndia'].value,
          "mes":                this.data.mes,
          "anio":               this.data.anio,
          "fechamantenimiento": this.data.mes+'-'+this.cronoForm.controls['ndia'].value+'-'+this.data.anio,
          "maquinasmanuales":   this.cronoForm.controls['nmaquinas'].value,
          "Codlocalidad":       this.data.localidad,
          "Estado":             1
        }   

        console.log(this.modelUnitCrono);
      
        this.crono.editarCrnograma(this.data.codcrono, this.modelUnitCrono).subscribe({
          next: (x) => {
            console.log('SE ESTA EDITANDO')
            console.log(x)
            Toast.fire({ icon: 'success', title: 'Data editada con éxito' })
          },
          error: (e) => {
            console.error(e)
            Toast.fire({ icon: 'error', title: 'Algo ha sucedido' })
          },
          complete: () => {
            this.closeDialog(this.modelUnitCrono);
            // this.obtenerCrono(this.anio, this.mes+1);
            // this.clean();
          }
        })
        break;
      case 2:
        
        let anio = new Date().getFullYear();
        let codigoCrono    = 'CRONO-'+this.DataMaster.generateRandomString(15)+'-'+anio.toString();
        
        this.modelUnitCrono = {
          "codcrono":           codigoCrono,
          "codusertecnic":      this.cronoForm.controls['codusertecnico'].value.code,
          "codagencia":         this.cronoForm.controls['codagencia']    .value.code,
          "observacion":        this.cronoForm.controls['observacion']   .value,
          "feccrea":            this.data.feccrea,
          "codusercreacrono":   this.data.codusercreacrono,
          "semanainicio":       this.data.semanainicio,
          "dia":                this.cronoForm.controls['ndia'].value,
          "mes":                this.data.mes,
          "anio":               this.data.anio,
          "fechamantenimiento": this.data.mes+'-'+this.cronoForm.controls['ndia'].value+'-'+this.data.anio,
          "maquinasmanuales":   this.cronoForm.controls['nmaquinas'].value,
          "Codlocalidad":       this.data.localidad,
          "Estado":             1
        }   

        this.crono.guardarCronos(this.modelUnitCrono).subscribe({
          next: (x) => {
            this._show_spinner = false;
            Swal.fire(
              'Se generó copia con éxito!',
              'Se ha guardado',
              'success'
            )
          }, error: (e) => {
            this._show_spinner = false;
            Swal.fire(
              'Oops!',
              'No se ha podido copiar',
              'error'
            )
          }, complete: () => { 
          }
        })
        break;
    }
  }

  listAgencias: any = [];
  obtenerAgencias() {
      this.client.obtenerAgencias( this.ccia, 
                                   this.cronoForm.controls['codcliente'].value.code.trim(),
                                   this.data.localidad )
                 .subscribe((x) => {

        if (Array.isArray(x)) {
          this.agencia = [];
          this.listAgencias = x;
          this.listAgencias.filter((element:any) => {
              let arr = {
                name: element.nombre,
                code: element.codagencia,
                nmaquinas: element.cantidadMaquinaAgencia
              }
              this.agencia.push(arr);
            });
          }
        }
      );
  }

  filteredAgencias: any | undefined;
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
    console.log(this.filteredcliente);
  }

  filterAgencia(event: AutoCompleteCompleteEvent) {

    let filtered: any[] = [];
    let query = event.query;

    for (let i = 0; i < (this.agencia as any[]).length; i++) {
        let agencies = (this.agencia as any[])[i];
        if (agencies.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
            filtered.push(agencies);
        }
    }

    this.filteredAgencias = filtered;

}

  sendClient(data:any) {
    this.closeDialog(data);
  }

  closeDialog(data:any) {
    this.dialogRef.close(data);
  }

  limpiarAgencias() {
    this.cronoForm.controls['codagencia'].setValue([]);
  }

  onSubmit() {}

  catchdata() {
    this.cronoForm.controls['codcliente'].setValue(this.data.nombreCliente);
    this.cronoForm.controls['ndia'].setValue(this.data.dia);
  }
  
  diasdelMes(mes: number, anio: number): any[] {
    if (mes < 1 || mes > 12) {
      throw new Error('Número de mes inválido. Debe estar entre 1 y 12.');
    }

    const esBisiesto = (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
    const diasEnFebrero = esBisiesto ? 29 : 28;
    const fecha = new Date(anio, mes - 1, 1);
    let diasEnMes = 31;
    if (mes === 4 || mes === 6 || mes === 9 || mes === 11) {
      diasEnMes = 30;
    } else if (mes === 2) {
      diasEnMes = diasEnFebrero;
    }
        
    this.resultado = [];
    
    for (let i = 1; i <= diasEnMes; i++) {
      const fechaDia = new Date(anio, mes - 1, i);
      const diaDeSemana = format(fechaDia, 'eeee', { locale: es }); 
      const numeroDia = format(fechaDia, 'dd', { locale: es }); 
      this.resultado.push({ dia: diaDeSemana, numero: Number(numeroDia) });
    }

    return this.resultado;

  }

}
