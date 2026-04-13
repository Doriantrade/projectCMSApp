import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { UserService } from '../usuario/services/user.service';
import { ClienteService } from '../clientes/services/cliente.service';
import { CronogramaService } from '../cronograma/services/cronograma.service';
import { SharedService } from 'src/app/components/shared/services/shared.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import Swal from 'sweetalert2'
import { MatDialog } from '@angular/material/dialog';
import { ModalDetalleCronoComponent } from './modal-detalle-crono/modal-detalle-crono.component';
import { ModalAsignMaqtecnicoComponent } from './modal-asign-maqtecnico/modal-asign-maqtecnico.component';
import { MantenimientoCronogramaService } from './services/mantenimiento-cronograma.service';

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
  selector: 'app-crono-grid',
  templateUrl: './crono-grid.component.html',
  styleUrls: ['./crono-grid.component.scss']
})
export class CronoGridComponent implements OnInit {
  pMod: number = 4;


  manteniminetocount: number = 0;

  _showMes: boolean = false;
  rep: boolean = false;
  meses: string[] = [ 'enero', 'febrero', 'marzo', 
                      'abril', 'mayo', 'junio', 
                      'julio', 'agosto', 'septiembre', 
                      'octubre', 'noviembre', 'diciembre' ];
  _class_btn = 'btn btn-outline-warning';
  _class_btn_2 = 'btn btn-outline-primary';
  filteredCronos: any = []; 
  _data_crono_section: string = 'd-flex flex-column table-responsive w-100 m-2';

  modelCronoBack:  any = [];
  observacion:     string = '';
  opacity_tots: number = 0.8;
  semanainicial:any;
  mes:any;
  dia:any;
  anio:any;
  _multi_agen:boolean = true;
  _multi_tecnic:boolean = false;

  _dis_btn_setts:boolean = true;

  listaClientes:any = [];
  _show_spinner:boolean = false;
  cities: any =[];
  agencia: any = [];
  UsuarioTecnico:any = [];

  filteredusers: any[] = [];
  filteredlocalidad: any[] = [];
  filteredcliente: any[] = [];

  ccia:               any;
  public agenciaForm = new FormGroup({
    codusertecnico:         new FormControl([]),
    codcliente:             new FormControl(''),
    localidad:              new FormControl(''),
    fechamantenimiento:     new FormControl(''),
    observacion:            new FormControl(''),
    codagencia:             new FormControl([]),
    selectedCities:         new FormControl([])
  }
  )

  
  public reporCrono = new FormGroup({
    mantenimientoCompletados:   new FormControl(0),
    tecnicosAsignados:         new FormControl(0)
  })
 
  public diaform = new FormGroup({
    diaCrono:   new FormControl(),
  })
 
  public activateForm = new FormGroup({
    activateCheckAgencia:   new FormControl(),
    activateCheckTecnico:   new FormControl(),
  })

  public valoresform = new FormGroup({
    cantidadCrono:   new FormControl(),
  })
  countries: any[] | undefined;

  selectedCountry: any;

  filteredAgencias: any | undefined;

  constructor(private us: UserService,
    public dialog: MatDialog,
    private client: ClienteService,
    private crono: CronogramaService,
    private DataMaster: SharedService,
    private mantenimineto: MantenimientoCronogramaService
    ) { }


  users: any[] = [];
  local: any[] = [];
  clientes: any[] = [];
  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    this.ccia = sessionStorage.getItem('codcia');   
    this.reporCrono.controls['mantenimientoCompletados'].setValue(30);
    this.reporCrono.controls['tecnicosAsignados'].setValue(17);

    

    this.obtenerLocalidades();

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

    this.obtnClientes();
  

  }
  _show_filter:boolean = false;
  showFilt() {

    setTimeout(() => {
      this._show_filter = true

      const x = <HTMLInputElement> document.getElementById('username');
      x.focus()

    }, 1000);

  }
  datatext:any;
  mostrat(data:any) {
    console.warn(data);
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
        "dia": data.dia,
        "anio": data.anio,
        "fechamantenimiento": data.fechamantenimiento,
        "maquinasmanuales": data.maquinasmanuales,
        "localidad": this.idLocalidad
    }
    
    console.warn(reasignData);

    const dialogRef = this.dialog.open( ModalDetalleCronoComponent, {
      height: '600px',
      width:  '50%',
      data: reasignData, 
    });


    dialogRef.afterClosed().subscribe( result => {      
      
      console.warn( result );
      this.obtenerCrono(result.anio, result.mes);

    });


  }

  openDialogAsignacionTecnico(data:any): void {

    let modelData: any = {
      codcrono: this.codCrono,
      tecnico:  data,
      maquinas: this.listaMaquinariaAsignada
    }

    const dialogRef = this.dialog.open( ModalAsignMaqtecnicoComponent, {
      height: '600px',
      width:  '60%',
      data: modelData, 
    });


    dialogRef.afterClosed().subscribe( result => {      
      
      console.warn( result );
      // this.obtenerCrono(result.anio, result.mes);

    });


  }


  obtnClientes () {
    
    this.client.obtenerClientes(this.ccia, 2).subscribe({
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

  limpiarAgencias() {
    // alert('LIMPIANDO')
    this.agenciaForm.controls['codagencia'].setValue([]);
    // console.warn(this.agenciaForm.controls['codagencia'].value);
  }

  validatesettings() {

    console.log(this.idLocalidad);
    console.log(this.mes);

    if ( (this.idLocalidad == undefined || this.idLocalidad == null) || (this.mes == undefined || this.mes == null) ) {
      this._dis_btn_setts = true;
      // alert('No has seleccionado una localidad');
    }
    else {
      this._dis_btn_setts = false;
    }

  }

  onSubmitTypeCheck(){}

  selectDate( mes:any ) {
    this.mes = mes;
    this.anio = new Date().getFullYear();

    this.validatesettings();

    this.diasdelMes(this.mes+1, this.anio)

    this.obtenerCrono(this.anio, mes+1);
  }

  resultado:any = [];  
  diasdelMes(mes: number, anio: number): any[] {
    // Verifica si el número de mes es válido (entre 1 y 12)
    if (mes < 1 || mes > 12) {
      throw new Error('Número de mes inválido. Debe estar entre 1 y 12.');
    }

    // Validar si el año es bisiesto para febrero
    const esBisiesto = (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
    const diasEnFebrero = esBisiesto ? 29 : 28;

    // Crea una fecha usando el año y el número de mes proporcionados
    const fecha = new Date(anio, mes - 1, 1);

    // Obtiene el número de días en el mes
    let diasEnMes = 31;
    if (mes === 4 || mes === 6 || mes === 9 || mes === 11) {
      diasEnMes = 30;
    } else if (mes === 2) {
      diasEnMes = diasEnFebrero;
    }

    // Crea un arreglo para almacenar los objetos con el formato deseado
    this.resultado = [];

    // Itera por cada día del mes y crea el objeto con el día de la semana y el número del día
    for (let i = 1; i <= diasEnMes; i++) {
      const fechaDia = new Date(anio, mes - 1, i);
      const diaDeSemana = format(fechaDia, 'eeee', { locale: es }); // eeee representa el nombre completo del día de la semana
      const numeroDia = format(fechaDia, 'dd', { locale: es }); // dd representa el día del mes con dos dígitos
      this.resultado.push({ dia: diaDeSemana, numero: numeroDia });
    }

    return this.resultado;
  }


  public valoresSeleccionados: string[] = [];
  _bol_check:boolean= false;
  public onCheckboxChange(numero: number): void {
    const index = this.valoresSeleccionados.indexOf(numero.toString());

    if (index === -1) {
      this.valoresSeleccionados.push(numero.toString());
    } else {
      this.valoresSeleccionados.splice(index, 1);
    }

  }

  codCrono:any;
  modelUnitCrono:any = [];
  capturarIdCrono( model:any ) {

    this.codCrono = model.codcrono;
    let arr = {
      "codcrono":           this.codCrono,
      "codusertecnic":      model.codusertecnic,
      "codagencia":         model.codagencia,
      "observacion":        model.observacion,
      "feccrea":            model.feccrea,
      "codusercreacrono":   model.codusercreacrono,
      "semanainicio":       model.semanainicio,
      "dia":                this.diaform.controls['diaCrono'].value,
      "mes":                model.mes,
      "anio":               model.anio,
      "fechamantenimiento": model.mes+'-' + this.diaform.controls['diaCrono'].value + '-' + model.anio,
      "maquinasmanuales":   model.maquinasmanuales,
      "Codlocalidad":       this.idLocalidad,
      "Estado":             1
    }

    this.modelUnitCrono = arr;

  }

  capturarValorCrono(model:any) {
    this.codCrono = model.codcrono;
    let arr = {
      "codcrono":           this.codCrono,
      "codusertecnic":      model.codusertecnic,
      "codagencia":         model.codagencia,
      "observacion":        model.observacion,
      "feccrea":            model.feccrea,
      "codusercreacrono":   model.codusercreacrono,
      "semanainicio":       model.semanainicio,
      "dia":                model.dia,
      "mes":                model.mes,
      "anio":               model.anio,
      "fechamantenimiento": model.fechamantenimiento,
      "maquinasmanuales":   this.valoresform.controls['cantidadCrono'].value,
      "Codlocalidad":       this.idLocalidad,
      "Estado":             1
    }

    this.modelUnitCrono = arr;

  }

  clean(){
    
    this.diaform    .controls['diaCrono']      .setValue('');
    this.agenciaForm.controls['codcliente']    .setValue('');
    this.agenciaForm.controls['codagencia']    .setValue([]);
    this.agenciaForm.controls['codusertecnico'].setValue([]);
    this.valoresform.controls['cantidadCrono'] .setValue('');
    this.agenciaForm.controls['observacion']   .setValue('');
    this._bol_check           = false;
    this.valoresSeleccionados = [];

  }

  searchTerm: any;
  _sum_filter:boolean = false;
  filterCronos() {
    const searchTerm = this.searchTerm.toLowerCase().trim();  
    if (!searchTerm) {
      
      this.sumatoriaFilter = 0;
      this.filteredCronos = [...this.modelCronoBack];
      this._sum_filter = true;

    } else {

      const searchPrefix = searchTerm.charAt(0);
  
      if (searchPrefix === 'd') {
        const searchValue = searchTerm.substring(1).trim();
        this.filteredCronos = this.modelCronoBack.filter((crono: any) => {
          const dia = crono.dia.toString().toLowerCase();
          return dia.includes(searchValue);
        });
      } else if (searchPrefix === 'm') {
        // Filtrar por el campo "maquinasmanuales"
        const searchValue = searchTerm.substring(1).trim();
        this.filteredCronos = this.modelCronoBack.filter((crono: any) => {
          const nmaquinas = crono.maquinasmanuales.toString().toLowerCase();
          return nmaquinas.includes(searchValue);
        });
      } else {
        // Filtrar por los campos originales
        this.filteredCronos = this.modelCronoBack.filter((crono: any) => {
          const nombreTecnico = crono.nombreTecnico.toLowerCase();
          // const codfrecuencia = crono.codfrecuencia.toLowerCase();
          // const frecuencia = crono.frecuencia.toLowerCase();
          const nombreCliente = crono.nombreCliente.toLowerCase();
          const nombreAgencia = crono.nombreAgencia.toLowerCase();
          return (
            nombreTecnico.includes(searchTerm) ||
            // codfrecuencia.includes(searchTerm) ||
            // frecuencia.includes(searchTerm)    || 
            nombreCliente.includes(searchTerm) ||
            nombreAgencia.includes(searchTerm)
          );
        });
      }
    }
  
    // Calcular la sumatoria después de aplicar todos los filtros
    this.sumatoriaCronoMaquinasFilter();
  }
  


  ordenarPorDia() {
    this.filteredCronos.sort((a:any, b:any) => a.dia - b.dia);
  }
  
  ordenarAlfabeticamente() {
    this.filteredCronos.sort((a:any, b:any) => a.nombreTecnico.localeCompare(b.nombreTecnico));
  }
  
  restaurarOrdenOriginal() {
    this.filteredCronos = [...this.modelCronoBack];
    this.searchTerm = '';
    this.valoresSeleccionados = [];
  }

  obtenerCrono(anio:any, mes:number) {

    console.log('Obteniendo datos: ' + anio + ' / ' +mes)

    let x = this.idLocalidad;
    this.sumatoriaFilter = 0;
    this.filteredCronos = [];
    // this.agencia = [];
    this.crono.obtenerCronograma(this.ccia, anio, mes, x, 1, 'void').subscribe({
        next: (x) => {        
          this.modelCronoBack = x;
          this.filteredCronos = x;
          // console.warn(this.filteredCronos);
        },
        complete: () => {
          this.sumatoriaCronoMaquinas();
          this.clean();
        }
      }
    )
  }

  actualizarCrono() {
    this.crono.editarCrnograma(this.codCrono, this.modelUnitCrono).subscribe({
      next: (x) => {
        console.log('SE ESTA EDITANDO')
        console.log(x)
      },
      error: (e) => {
        // console.error(e)
      },
      complete: () => {
        this.obtenerCrono(this.anio, this.mes+1);
        this.clean();
      }
    })
  }

  idLocalidad: any;
  obtenerLocalidadId(data:any) {

      console.warn('=====================');
      console.warn(data);
      console.warn('=====================');

      this.idLocalidad = data;
      this.validatesettings();
  }

  obtenerCliente() {

    this._show_spinner = true;
    this.client.obtenerClientes(this.ccia,2).subscribe(
      {

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

      }
    )

  }

  listAgencias: any = [];
  obtenerAgencias() {
      this.client.obtenerAgencias( this.ccia, this.agenciaForm.controls['codcliente'].value.code.trim(),
                                   this.idLocalidad )
                 .subscribe((x) => {
        if (Array.isArray(x)) {
          this.agencia = [];
          this.listAgencias = x;
          this.listAgencias.filter((element:any)=>{            
              let arr = {
                name: element.nombre, code: element.codagencia, nmaquinas: element.cantidadMaquinaAgencia
              }
              this.agencia.push(arr);
          });
        }
      });
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

    console.log(filtered);
    console.log(this.filteredAgencias);

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



  _conf_crono:boolean  =false;
  x:boolean = true;
  configuracionOn() {

    switch(this.x) {
      case true:
        this._conf_crono = true;
        this._data_crono_section = 'd-flex flex-column table-responsive w-75 m-2'
        this.x = false;
        break;  
      case false:
        this.x = true;
        this._conf_crono = false;
        this._data_crono_section = 'd-flex flex-column table-responsive w-100 m-2'
        break;
    }

  }


  filterLocalidad(event: AutoCompleteCompleteEvent) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < (this.local as any[]).length; i++) {
      let Localidad = (this.local as any[])[i];
      if (Localidad.name.toLowerCase().includes(query)) {
        filtered.push(Localidad);
      }
    }

    this.filteredlocalidad = filtered;

    console.log(this.filteredlocalidad)

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
    // console.log(this.filteredcliente);
  }


  sumatoria = 0;
  sumatoriaFilter = 0;
  onSubmit() {

    this.guardarCronograma();
    this._btn_action_dis = true;
  }

  //element.sumatoria
  sumatoriaCronoMaquinas() {

    const agencias:   any = {};
    const duplicados: any = [];
    const unicos:     any = [];
  
    this.modelCronoBack.forEach((element: any) => {
      const codAgencia = element.codagencia;
  
      if (agencias[codAgencia]) {
        console.warn("Duplicado:", element);
        duplicados.push(element);
      } else {
        agencias[codAgencia] = 1;
        unicos.push(element);
      }
    });
  
    this.sumatoria = 0;
    unicos.filter((element:any)=>{
      this.sumatoria += element.maquinasmanuales
    })
    
  }

  sumatoriaCronoMaquinasFilter() {

    let agencias:   any = {};
    let duplicados: any = [];
    let unicos:     any = [];
  
    this.filteredCronos.forEach((element: any) => {
      const codAgencia = element.codagencia;  
      if (agencias[codAgencia]) {
        console.warn("Duplicado:", element);
        duplicados.push(element);
      } else {
        agencias[codAgencia] = 1;
        unicos.push(element);
      }
    });
  
    this.sumatoriaFilter = 0;
    unicos.filter((element:any)=>{
      this.sumatoriaFilter += element.maquinasmanuales
    })
    
  }
  
  
  

  listaLocalidades: any = [];
  obtenerLocalidades() {
    this.crono.obtenerLocalidades().subscribe(
      {
        next: (x) => {
          this.listaLocalidades = x;
          console.warn(this.listaLocalidades);
        }, error: (e) => {
          console.error(e);
        }
      }
    )
  }

  modelBack:any = [];
  tecnicoslista:any=[];
  _btn_action_dis:boolean = false;
  guardarCronograma() {

    const usercrono: any = sessionStorage.getItem('UserCod');
    
    if ( this.agenciaForm.controls['codcliente'].value == '' || 
         this.agenciaForm.controls['codcliente'].value == undefined || 
         this.agenciaForm.controls['codcliente'].value == null) Toast.fire({ icon: 'warning', title: 'Necesitas escoger un cliente' })
    else if ( this.agenciaForm.controls['codagencia'].value == null ||
              this.agenciaForm.controls['codagencia'].value.length == 0 ||
              this.agenciaForm.controls['codagencia'].value == undefined ) Toast.fire({ icon: 'warning', title: 'Necesitas escoger uan o varias agencias' })
    else if ( this.agenciaForm.controls['codusertecnico'].value.length == 0 ||
              this.agenciaForm.controls['codusertecnico'].value == null ||
              this.agenciaForm.controls['codusertecnico'].value == undefined  ) Toast.fire({ icon: 'warning', title: 'Necesitas escoger un técnico para cubrir esta agencia ' })
    else {
      // this._btn_action_dis = false;
      if( this.activateForm.controls['activateCheckAgencia'].value == null || 
      this.activateForm.controls['activateCheckAgencia'].value == false ) {
        this._show_spinner = true;
        this.modelBack = [];
        let anio = new Date().getFullYear();
        let mes = new Date().getMonth();
        let codUserTecnico = this.agenciaForm.controls['codusertecnico'].value.code;
        let agencias:any[] = this.agenciaForm.controls['codagencia'].value;
        for ( let i = 0; i < this.valoresSeleccionados.length; i++ ) {

            agencias.filter((eleback:any) => {
              let codigoCrono    = 'CRONO-'+this.DataMaster.generateRandomString(15)+'-'+(mes+1).toString()+anio.toString();
              let arr = {
                "codcrono":           codigoCrono,
                "codusertecnic":      codUserTecnico,
                "codagencia":         eleback.code,
                "observacion":        this.agenciaForm.controls['observacion'].value,
                "feccrea":            new Date(),
                "codusercreacrono":   usercrono,
                "semanainicio":       this.semanainicial,
                "dia":                Number(this.valoresSeleccionados[i]),
                "mes":                this.mes+1,
                "anio":               this.anio,
                "fechamantenimiento": (this.mes+1)+'-'+1+'-'+this.anio,
                "maquinasmanuales":   eleback.nmaquinas,
                "Codlocalidad":       this.idLocalidad,
                "Estado":             1
              }
            
              this.modelBack.push(arr);
            
            })
          }

          this.modelBack.filter((element:any) => {

            this.crono.guardarCronos(element).subscribe({
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
                this.obtenerCrono(this.anio, this.mes+1);
                this._bol_check = false;
                this._conf_crono = false;
                this._btn_action_dis = false;
                this.clean()
              }
            })
          })    
        } else if ( this.activateForm.controls['activateCheckAgencia'].value == true ) {
          let anio = new Date().getFullYear();
          let mes = new Date().getMonth();
          for ( let i = 0; i < this.valoresSeleccionados.length; i++ ) { 
            this.tecnicoslista = this.agenciaForm.controls['codusertecnico'].value;
            this.tecnicoslista.filter( (element:any) => {

              let codigoCrono    = 'CRONO-'+this.DataMaster.generateRandomString(15)+'-'+(mes+1).toString()+anio.toString();
              let arr = {
                "codcrono":           codigoCrono,
                "codusertecnic":      element.code,
                "codagencia":         this.agenciaForm.controls['codagencia'].value.code,
                "observacion":        this.agenciaForm.controls['observacion'].value,
                "feccrea":            new Date(),
                "codusercreacrono":   usercrono,
                "semanainicio":       this.semanainicial,
                "dia":                Number(this.valoresSeleccionados[i]),
                "mes":                this.mes+1,
                "anio":               this.anio,
                "fechamantenimiento": (this.mes+1)+'-'+1+'-'+this.anio,
                "maquinasmanuales":   this.agenciaForm.controls['codagencia'].value.nmaquinas,
                "Codlocalidad":       this.idLocalidad,
                "Estado":             1
              }

              this.modelBack.push(arr);

            })

        }

        this.modelBack.filter((back:any)=>{
          this.crono.guardarCronos(back).subscribe({
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
              this.obtenerCrono(this.anio, this.mes+1);
              this._conf_crono = false;
              this._btn_action_dis = false;
              this.clean();
            }
          })
        })

        }
      }    
  }

  maqsel:boolean = false;
  listaManetnimientoMaquinas: any = [];
  selectAll: boolean = false;
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

  
  addMaquinaManetenimiento(event: any, codmachine: any) {

    const xuser: any = sessionStorage.getItem('UserCod');
    if (event.target.checked) {
        const array = {
            codcrono: this.codCrono,
            codtecnico: this.tecnicoObtenido.codusertecnic,
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
            element.tecniconombre = this.tecnicoObtenido.tecnico;
            element.fotoperfil = this.tecnicoObtenido.imagenTecnico;
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

    // console.warn('Mantenimiento Agregado');
    // console.warn(this.listaManetnimientoMaquinas);
    this.manteniminetocount = this.listaManetnimientoMaquinas.length;

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

    this.listaManetnimientoMaquinas.filter((element:any) => {
    this.mantenimineto.guardarMantenimiento(element).subscribe ({
        next:(x) => {
          Toast.fire({ icon: 'success', title: 'Asignación ha sido completada' })
          console.log(x);
        }, error: (e) => {
          Toast.fire({ icon: 'error', title: 'No se ha podido completar la asignación' })
          console.log(e);
        }, complete: () => {
          this.obtenerMantenimiento();
          this.manteniminetocount = 0;
          setTimeout(() => {
            this.encontrarMaquinasFaltantes();
            // this.encontrarMaquinasRepetidas();
          }, 500);
        }
      }
    )
    }
    )

  }


  tecnicoObtenido:any = [];
  getTecnico(tecnico:any) {
    this.tecnicoObtenido = tecnico;
    console.warn(this.tecnicoObtenido);    
    setTimeout(() => {
      this.encontrarMaquinasFaltantes();
      // this.encontrarMaquinasRepetidas();
    }, 500);
  }

  _viewMantenim:boolean = false;
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

  filterMant:any;
  filterMantenimiento () {
    this.listaMantenimientoMaquinaGhost = this.listaMaquinaMantenimiento.filter((item:any) =>
    item.nombreTecnico.toLowerCase().includes(this.filterMant.toLowerCase()) ||
    item.marca.toLowerCase().includes(this.filterMant.toLowerCase()) ||
    item.modelo.toLowerCase().includes(this.filterMant.toLowerCase()) ||
    item.nserie.toLowerCase().includes(this.filterMant.toLowerCase()) ||
    item.nombretipomaquina.toLowerCase().includes(this.filterMant.toLowerCase())
  );
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
      //     this.listaMaquinaMantenimiento = mantenimiento; 
      //     this.listaMantenimientoMaquinaGhost = mantenimiento;
      //     console.warn('--------MANTENIMIENTO--------');
      //     console.warn(this.listaMaquinaMantenimiento);
      //   }
      // });
    }

  listadetalleCronoUnit: any = [];
  modelUnitCronoDetalle: any = [];
  resultadosFiltrados: any = [];
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
    this.listaMaquinariaAsignadaGhost = this.resmaquinas.filter((item:any) =>
      item.nombremarca.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      item.nombremodelo.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      item.nserie.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      item.tipomaquina.toLowerCase().includes(this.filtroTexto.toLowerCase())
    );
  }

  kal:boolean = true;
  catchData() {
    
  }
  



}
