import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormularioRegistroProblemasService } from './services/formulario-registro-problemas.service';
import { Environments } from 'src/app/environments/environments';
import { ImagecontrolService } from '../../shared/imagen-control/imagecontrol.service';
import { jwtDecode } from "jwt-decode";
import { EncryptService } from '../../shared/services/encrypt.service';
import { TablaHelpDeskService } from '../tabla-help-desk/services/tabla-help-desk.service';

import Swal from 'sweetalert2'
import { MasterTableService } from '../../shared/master-table/master-table.service';
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
  selector: 'app-formulario-registro-problemas',
  templateUrl: './formulario-registro-problemas.component.html',
  styleUrls: ['./formulario-registro-problemas.component.scss']
})

export class FormularioRegistroProblemasComponent implements OnInit, OnChanges {

  @Input() GetDataTicketUpdate: any;
  @Output() showFormView: EventEmitter<any> = new EventEmitter();
  @Output() GetTickets: EventEmitter<any> = new EventEmitter();

  _show_form: boolean = true;
  _show_spinner: boolean = false;
  listaEquipos: any = [];
  listaEquiposGhost: any = [];
  modelSendRequerimiento: any = [];
  // Aquí se almacena el equipo seleccionado
  equipoSeleccionado: any = null;

  codProv: any;
  codCanton: any;
  _cli_view: boolean = false;
  maquinarias_show: boolean = false;
  listaAgencias: any = [];
  _dis_btn: boolean = false;
  _data_label: string = 'agencia';
  codcli: any;
  listaMaquinaria: any = [];
  modelTicket: any = [];
  horaValidar: number = 0;

  listaCantonesGhost: any = [];
  listaCantones: any = [];
  role: any;
  listaProvincias: any = [];

  nameFile: string = '';
  nameFileB: string = '';

  _IMGE: any;
  _IMGEB: any;

  public file!: File;
  public fileB!: File;
  public fileId: any;
  public fileIdB: any;

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  xcli: any;
  listaProvinciasGhost: any = [];
  action_button: string = 'Agregar';
  icon_buton: string = 'add';
  lstaTipoRequerimientos: any = [];
  lstaTipoRequerimientosGhost: any = [];
  modelSendFileMidaTicketDB: any = [];

  registerTroubleForm = new FormGroup({
    agencia: new FormControl(''),
    mensajeDelProblema: new FormControl(''),
    equipo: new FormControl(''),
    fileA: new FormControl(''),
    fileB: new FormControl(''),
    tipo: new FormControl(''),
    observacion: new FormControl(''),
    codprov: new FormControl(''),
    codcan: new FormControl(''),
    espacioSirve: new FormControl(''),
    fechainiPlanif: new FormControl(''),
    horaInicialPlanificada: new FormControl(''),
    fechafinPlanif: new FormControl(''),
    horaFinalPlanificada: new FormControl(''),
    fecreaRealIni: new FormControl(''),
    fecreaRealFin: new FormControl(''),
    horaInicialReal: new FormControl(''),
    horaFinalReal: new FormControl('')
  }
  )

  espacioSirveList: any = [
    {
      cod: "BOB",
      nombre: "BÓVEDA"
    }, {
      cod: "BOD",
      nombre: "BODEGA"
    }, {
      cod: "CAJ",
      nombre: "CAJA"
    }
  ]

  constructor(private maquinaria: FormularioRegistroProblemasService,
    private env: Environments,
    private ncrypt: EncryptService,
    private fileserv: ImagecontrolService,
    private mt: MasterTableService,
    private helpdeskExtServ: TablaHelpDeskService,
    private fileService: ImagecontrolService) { }

  onSubmit() {
    // // console.warn(this.action_button)
    switch (this.action_button) {
      case 'Agregar':
        // this.guardarTicket();
        // // console.warn('agregando')
        this.guardarRequerimiento();
        break;
      case 'Actualizar':
        // this.actualizarTicket();
        break;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      if (this.GetDataTicketUpdate == null ||
        this.GetDataTicketUpdate == 0 ||
        this.GetDataTicketUpdate == undefined) {
        return
      }
      else {
        this.catchData(this.GetDataTicketUpdate);
      }
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Mostrar la vista previa de la imagen
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onUpload(idTicket: number): void {
    if (this.selectedFile) {
      this.fileService.uploadFile(this.selectedFile, this.selectedFile!.name).subscribe({
        next: (x) => {
          this.guardarArchivosDB('CTICK', this.selectedFile!.name, idTicket);
        }, error: (e) => {
          console.error('Error al subir la imagen', e);
        }
      });
    } else {
      // console.log('No has subido ninguna imagen referente al problema');
    }
  }

  guardarArchivosDB(type: string, fileName: string, idTicket: any) {

    const xcodcli: any = sessionStorage.getItem('codcli');
    this.modelSendFileMidaTicketDB = {
      usercrea: xcodcli,
      fileUrl: fileName,
      idTicketRequerimiento: idTicket,
      observacion: "",
      estado: 1,
      permisos: 1,
      type: type
    }

    this.fileService
      .guardarFileMidaTicketDBUnit(this.modelSendFileMidaTicketDB)
      .subscribe({
        next: (x) => {
          // // console.warn('Guardado en base de datos');
        }, error: (e) => {
          console.error(e);
        }
      })

  }

  @Input() codClienteAdmin: any;

  ngOnInit(): void {
    this.getToken();

    // Si viene codClienteAdmin (desde el modal creado por admin), usamos ese.
    // Si no, usamos el del sessionStorage (cliente/gerente logueado).
    if (this.codClienteAdmin) {
      this.xcli = this.codClienteAdmin;
    } else {
      this.xcli = sessionStorage.getItem('codcli');
    }

    this.obtenerAgenciaCliente(this.env.codcia, this.xcli);
    this.obtenerMasterTable();
    this.obtenerProvincias();
  }


  obtenerProvincias() {
    this.mt.obtenerDatosMasterTable('PRV00').subscribe({
      next: (x) => {
        this.listaProvinciasGhost = x;
      }, complete: () => {
        this.listaProvinciasGhost.filter((p: any) => {
          p.codigo = p.codigo.toString().trim();
          this.listaProvincias.push(p);
        })
      }
    }
    )
  }

  getToken() {

    let xtoken: any = sessionStorage.getItem('token');
    const xtokenDecript: any = this.ncrypt.decryptWithAsciiSeed(xtoken, this.env.es, this.env.hash);
    if (xtokenDecript != null || xtokenDecript != undefined) {
      var decoded: any = jwtDecode(xtokenDecript);
      this.role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      this.codcli = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/country"];
    }

  }

  obtenerCantones(codProv: any) {
    this.mt.obtenerDatosMasterTable(codProv).subscribe({
      next: (x) => {
        this.listaCantonesGhost = x;
        // // console.warn(this.listaCantonesGhost);
      }, complete: () => {
        this.listaCantonesGhost.filter((c: any) => {
          c.codigo = c.codigo.toString().trim();
          c.master = c.master.toString().trim();
          this.listaCantones.push(c);
        })
        // // console.warn('this.listaCantones');
        // console.table(this.listaCantones);
        if (this.codCanton != null || this.codCanton == undefined) this.registerTroubleForm.controls['codcan'].setValue(this.codCanton);
      }
    })
  }

  selectedTipoRequerimiento: any;
  selectTipoRequerimiento(tipoRequerimiento: any) {
    this.selectedTipoRequerimiento = tipoRequerimiento.codigo.toString().trim();
    // // console.warn(this.selectedTipoRequerimiento);
  }


  validarTiempo() {

    this.horaValidar = (this.env.contratoBPTiempoMantenimiento / 60) / 60;
    let dateINI: any = new Date(this.registerTroubleForm.controls['fechainiPlanif'].value!);
    let horaInicialPlanificada: any = this.registerTroubleForm.controls['horaInicialPlanificada'].value;

    // Formatear la fecha en 'día-mes-año'
    let fechaFormateadaINI = this.formatearFecha(dateINI);
    // // console.log('Fecha inicial planificada:', fechaFormateadaINI);
    // // console.log('Hora Inicial:', horaInicialPlanificada);

    // Validar que la fecha sea laboral y que la hora esté en el horario permitido
    if (!this.esDiaLaboral(dateINI)) {
      dateINI.setDate(dateINI.getDate());
      return false;
    }

    if (!this.esHoraValida(horaInicialPlanificada)) {
      // // // console.log('Las horas deben estar entre 8 AM y 5 PM.');
      return false;
    }

    // Convertir hora inicial planificada a minutos totales
    const [horaInicial, minutosIniciales] = horaInicialPlanificada.split(':').map(Number);
    let minutosTotalesInicial = horaInicial * 60 + minutosIniciales;

    // Si la hora inicial es mayor a 1:00 PM (13:00), ajustar la fecha y hora
    if (horaInicial > 13) {
      // Sumar un día a la fecha de inicio
      dateINI.setDate(dateINI.getDate() + 1);
      const yy: any = this.esDiaLaboral(dateINI);
      if (!yy) {
        dateINI.setDate(dateINI.getDate() + 3);
      }
      // Establecer la hora inicial a las 8:00 AM
      minutosTotalesInicial = 8 * 60;  // 8:00 AM en minutos
    }

    // Sumar `this.horaValidar` (en horas) a la hora inicial en minutos
    let minutosAdicionales = this.horaValidar * 60;
    let minutosTotalesFinal = minutosTotalesInicial + minutosAdicionales;

    // Calcular la hora y los minutos finales
    const horaFinal = Math.floor(minutosTotalesFinal / 60);
    const minutosFinales = minutosTotalesFinal % 60;

    // Formatear la hora final en 'HH:mm' y establecer el valor en `horaFinalPlanificada`
    const horaFinalFormateada = `${horaFinal.toString().padStart(2, '0')}:${minutosFinales.toString().padStart(2, '0')}`;
    this.registerTroubleForm.controls['horaFinalPlanificada'].setValue(horaFinalFormateada);

    // Ajuste de fecha final sumando un día adicional
    let fechaFinal = new Date(dateINI);
    fechaFinal.setDate(fechaFinal.getDate() + 1);  // Sumamos un día adicional a la fecha final

    // Formatear `fechaFinal` en 'yyyy-MM-dd' y asignarla a `fechafinPlanif` y `fechainiPlanif`
    const fechaFinalFormateada = `${fechaFinal.getFullYear()}-${(fechaFinal.getMonth() + 1).toString().padStart(2, '0')}-${fechaFinal.getDate().toString().padStart(2, '0')}`;
    // Asignar fecha final a fecha inicial también
    this.registerTroubleForm.controls['fechafinPlanif'].setValue(fechaFinalFormateada);
    this.registerTroubleForm.controls['fechainiPlanif'].setValue(fechaFinalFormateada);

    // Setear la hora inicial a las 8:00 AM
    this.registerTroubleForm.controls['horaInicialPlanificada'].setValue('08:00');

    return true;

  }


  formatearFecha(fecha: any): string {
    // // // console.log( 'Fecha antes de formatear:', fecha );
    let dia = fecha.getDate();
    let mes = fecha.getMonth() + 1;
    let año = fecha.getFullYear();
    // // // console.log( 'Día:', dia, 'Mes:', mes, 'Año:', año );
    return `${dia}-${mes}-${año}`;
  }

  esDiaLaboral(fecha: Date): boolean {
    const dia = new Date(fecha.setHours(0, 0, 0, 0)).getDay();
    // Validación para fines de semana
    if (dia === 5) {
      // Sumar 2 días para pasar al lunes
      let nuevaFecha = new Date(fecha);
      nuevaFecha.setDate(fecha.getDate() + 3);

      // Formatear y asignar nueva fecha
      const nuevaFechaFormateada = `${nuevaFecha.getFullYear()}-${(nuevaFecha.getMonth() + 1).toString().padStart(2, '0')}-${nuevaFecha.getDate().toString().padStart(2, '0')}`;
      this.registerTroubleForm.controls['fechafinPlanif'].setValue(nuevaFechaFormateada);
      this.registerTroubleForm.controls['fechainiPlanif'].setValue(nuevaFechaFormateada);

      return false;
    } else if (dia === 6) {
      // Sumar 1 día para pasar al lunes
      let nuevaFecha = new Date(fecha);
      nuevaFecha.setDate(fecha.getDate() + 2);
      // Formatear y asignar nueva fecha
      const nuevaFechaFormateada = `${nuevaFecha.getFullYear()}-${(nuevaFecha.getMonth() + 1).toString().padStart(2, '0')}-${nuevaFecha.getDate().toString().padStart(2, '0')}`;
      this.registerTroubleForm.controls['fechafinPlanif'].setValue(nuevaFechaFormateada);
      this.registerTroubleForm.controls['fechainiPlanif'].setValue(nuevaFechaFormateada);
      return false;
    }

    // Si es un día laboral (lunes a viernes), retornar verdadero
    return true;

  }

  esHoraValida(hora: string): boolean {
    const [horas, minutos] = hora.split(':').map(Number);
    const horaEnMinutos = horas * 60 + minutos;
    // 8:00 AM en minutos
    const inicioDiaLaboral = 8 * 60;
    // 5:00 PM en minutos
    const finDiaLaboral = 17 * 60;
    return horaEnMinutos >= inicioDiaLaboral && horaEnMinutos <= finDiaLaboral;
  }

  convertirFechaFormato(fecha: string): string {
    let [dia, mes, año] = fecha.split('-');
    return `${año}-${mes}-${dia}`;
  }

  obtenerAgenciaCliente(cci: string, filter: string) {
    this.maquinaria.obtenerAgencias(cci, filter, 777).subscribe({
      next: (x) => {
        this.listaAgencias = x;
      }, error: (e) => {
        console.error(e);
      }, complete: () => { }
    }
    )
  }

  obtenerMasterTable() {
    this.lstaTipoRequerimientos = [];
    this.lstaTipoRequerimientosGhost = [];
    this.mt.obtenerDatosMasterTable('TM').subscribe({
      next: (x) => {
        this.lstaTipoRequerimientosGhost = x;
      }, complete: () => {
        this.lstaTipoRequerimientosGhost.filter((x: any) => {
          x.gestion = x.gestion.trim();
          if (x.gestion == '1') {
            this.lstaTipoRequerimientos.push(x)
          }
        })

        // // console.warn(this.lstaTipoRequerimientos);

      }
    })
  }

  validateTipoData() {
    if (this.registerTroubleForm.controls['tipo'].value == undefined ||
      this.registerTroubleForm.controls['tipo'].value == null ||
      this.registerTroubleForm.controls['tipo'].value == '') {
      this.registerTroubleForm.controls['agencia']
        .disable();
      this.registerTroubleForm.controls['mensajeDelProblema']
        .disable();
      this.registerTroubleForm.controls['equipo']
        .disable();
      this.registerTroubleForm.controls['fileA']
        .disable();
      this.registerTroubleForm.controls['fileB']
        .disable();
      this.registerTroubleForm.controls['observacion']
        .disable();
      this._dis_btn = true;
    } else if (this.registerTroubleForm.controls['tipo'].value != undefined ||
      this.registerTroubleForm.controls['tipo'].value != null ||
      this.registerTroubleForm.controls['tipo'].value != '') {
      this.registerTroubleForm.controls['agencia'].enable();
      this._dis_btn = false;
    }

    this.tipoRequerimiento();

  }

  // Función para manejar la selección del equipo
  seleccionarEquipo(equipo: any) {
    this.equipoSeleccionado = equipo;
    // console.table(this.equipoSeleccionado); // Muestra el equipo seleccionado en la consola
    // console.table(this.equipoSeleccionado.nserie); // Muestra el equipo seleccionado en la consola
  }

  // Función para obtener las máquinas (la que ya tienes)
  obtenerAsignacionMaquinariaAgencia() {
    const codAgencia: any = this.registerTroubleForm.controls['agencia'].value;
    this.maquinaria.obtenerAsignacionMaquinAgencia(codAgencia, this.env.codcia).subscribe({
      next: (x) => {
        this.listaEquipos = x;
        this.listaEquiposGhost = x;
      },
      error: (e) => {
        console.error(e);
      },
      complete: () => {
        this.listaAgencias.filter((x: any) => {
          if (x.codagencia == codAgencia.toString().trim()) {
            this.codProv = x.codProv.toString().trim();
            this.codCanton = x.codCanton.toString().trim();
            if (this.codProv != null || this.codProv == undefined) this.registerTroubleForm.controls['codprov'].setValue(this.codProv);
            if (this.codCanton != null || this.codCanton == undefined) this.registerTroubleForm.controls['codcan'].setValue(this.codCanton);
          }
        });
        this.obtenerCantones(this.codProv);
      }
    });
  }

  applyFilter(event: Event) {
    const filter = (event.target as HTMLInputElement).value;
    this.listaEquipos = this.listaEquiposGhost.filter((item: any) =>
      item.nserie.toLowerCase().includes(filter.toLowerCase()) ||
      item.tipomaquina.toLowerCase().includes(filter.toLowerCase()) ||
      item.nombremarca.toLowerCase().includes(filter.toLowerCase()) ||
      item.nombremodelo.toLowerCase().includes(filter.toLowerCase())
    );
  }

  nModelo: string = '';
  nTipomaquina: string = '';
  nSerie: string = '';
  choiceMachine() {

    let equipoChoice: any = this.registerTroubleForm.controls['equipo'].value;
    this.listaEquipos.filter((x: any) => {

      if (equipoChoice == x.codmaquina) {
        this.nModelo = x.nombremodelo;
        this.nTipomaquina = x.tipomaquina;
        this.nSerie = x.nserie;
      }

    })

  }

  listaTipos: any = [
    {
      nombre: 'Bugs en el software CFI',
      codigo: 'BS'
    }, {
      nombre: 'Mantenimiento o daño en los equipos CFI',
      codigo: 'EM'
    }
  ]

  cancelBtn() {
    this.showFormView.emit(false);
  }

  idRequerimiento: number = 0;
  estadoTicket: any;
  catchData(data: any) {
    /** ----------------------------------------------------------------------------------------- */
    this.registerTroubleForm.controls['agencia'].enable();
    this.registerTroubleForm.controls['mensajeDelProblema'].enable();
    this.registerTroubleForm.controls['observacion'].enable();
    this.registerTroubleForm.controls['equipo'].enable();
    this.registerTroubleForm.controls['tipo'].enable();
    /** ----------------------------------------------------------------------------------------- */
    this.idRequerimiento = data.idRequerimiento;
    this.action_button = 'Actualizar';
    this.icon_buton = 'sync';
    this.estadoTicket = data.estado;
    this.registerTroubleForm.controls['agencia'].setValue(data.idAgencia);
    this.obtenerAsignacionMaquinariaAgencia();
    this.registerTroubleForm.controls['mensajeDelProblema'].setValue(data.mensajeDelProblema);
    this.registerTroubleForm.controls['observacion'].setValue(data.obervacion);
    this.registerTroubleForm.controls['equipo'].setValue(data.codMaquina);
    this.registerTroubleForm.controls['tipo'].setValue(data.tipo);
    /** ----------------------------------------------------------------------------------------- */
  }


  validarLenghtMsjProblema() {
    let xmsj: any = this.registerTroubleForm.controls['mensajeDelProblema'].value;
    if (xmsj.length > 1000) {
      Swal.fire({
        title: "Límite alcanzado",
        text: "Límite de caracteres alcanzado para el mensaje",
        icon: "warning"
      });
      this.registerTroubleForm.controls['mensajeDelProblema'].setValue(xmsj.toString().slice(0, 1000));
    }
  }

  validarLenghtObservacion() {
    let xobs: any = this.registerTroubleForm.controls['observacion'].value;
    if (xobs.length > 300) {
      Swal.fire({
        title: "Límite alcanzado",
        text: "Límite de caracteres alcanzado para la observación",
        icon: "warning"
      });
      this.registerTroubleForm.controls['observacion'].setValue(xobs.toString().slice(0, 300));
    }
  }

  getProgressBarStyle() {
    let xmsj: any = this.registerTroubleForm.controls['mensajeDelProblema'].value;
    let percentage = (xmsj.length / 1000) * 100;

    let bgColor = 'green';
    if (percentage > 85) {
      bgColor = 'red';
    } else if (percentage > 45) {
      bgColor = 'orange';
    }

    return {
      width: percentage + '%',
      backgroundColor: bgColor
    };
  }

  getProgressBarStyleObs() {

    let xobs: any = this.registerTroubleForm.controls['observacion'].value;
    let percentage = (xobs.length / 300) * 100;
    let bgColor = 'green';
    if (percentage > 85) {
      bgColor = 'red';
    } else if (percentage > 45) {
      bgColor = 'orange';
    }

    return {
      width: percentage + '%',
      backgroundColor: bgColor
    };

  }


  tipoRequerimiento() {
    if (this.registerTroubleForm.controls['tipo'].value == 'BS') {
      this.maquinarias_show = false;
    } else if (this.registerTroubleForm.controls['tipo'].value == 'EM') {
      this.maquinarias_show = true;
    }
  }

  limpiar(type: any) {
    if (type == 'ALL') {
      this.registerTroubleForm.controls['agencia'].setValue('');
      this.registerTroubleForm.controls['fileA'].setValue('');
      this.registerTroubleForm.controls['fileB'].setValue('');
      this.registerTroubleForm.controls['mensajeDelProblema'].setValue('');
      this.registerTroubleForm.controls['observacion'].setValue('');
      this.registerTroubleForm.controls['equipo'].setValue('');
      this.registerTroubleForm.controls['tipo'].setValue('');
      this.registerTroubleForm.controls['tipo'].enable();
      this.registerTroubleForm.controls['agencia'].disable();
      this.registerTroubleForm.controls['fileA'].disable();
      this.registerTroubleForm.controls['fileB'].disable();
      this.registerTroubleForm.controls['mensajeDelProblema'].disable();
      this.registerTroubleForm.controls['observacion'].disable();
      this.registerTroubleForm.controls['tipo'].enable();
      this.maquinarias_show = false;
    } else {
      this.registerTroubleForm.controls['agencia'].setValue('');
      this.registerTroubleForm.controls['fileA'].setValue('');
      this.registerTroubleForm.controls['fileB'].setValue('');
      this.registerTroubleForm.controls['equipo'].setValue('');
      this.registerTroubleForm.controls['tipo'].setValue('');
      this.registerTroubleForm.controls['tipo'].enable();
      this.registerTroubleForm.controls['agencia'].disable();
      this.registerTroubleForm.controls['fileA'].disable();
      this.registerTroubleForm.controls['fileB'].disable();
      this.registerTroubleForm.controls['mensajeDelProblema'].enable();
      this.registerTroubleForm.controls['observacion'].enable();
      this.registerTroubleForm.controls['tipo'].enable();
    }

  }

  obtenerFechaYHora() {
    let fecha: Date = new Date();

    let dia: string = String(fecha.getDate()).padStart(2, '0');
    let mes: string = String(fecha.getMonth() + 1).padStart(2, '0');
    let año: string = String(fecha.getFullYear());
    let hora: string = String(fecha.getHours()).padStart(2, '0');
    let minutos: string = String(fecha.getMinutes()).padStart(2, '0');
    let segundos: string = String(fecha.getSeconds()).padStart(2, '0');

    let fechaFormateada: string = `${dia}-${mes}-${año}`;
    let horaFormateada: string = `${hora}:${minutos}:${segundos}`;

    return {
      fechaFormateada: fechaFormateada,
      horaFormateada: horaFormateada,
      dia: dia,
      mes: mes,
      año: año,
      hora: hora,
      minutos: minutos,
      segundos: segundos
    };
  }

  validateInputFill(): boolean {
    if (this.registerTroubleForm.controls['agencia'].value == null ||
      this.registerTroubleForm.controls['agencia'].value == undefined ||
      this.registerTroubleForm.controls['agencia'].value == ''
    ) {
      Toast.fire({
        icon: "warning",
        title: "No puedes enviar el campo agencia vacío"
      });
      return false;
    } else if (this.registerTroubleForm.controls['codprov'].value == null ||
      this.registerTroubleForm.controls['codprov'].value == undefined ||
      this.registerTroubleForm.controls['codprov'].value == '') {
      Toast.fire({
        icon: "warning",
        title: "No puedes enviar el campo provincia vacío"
      });
      return false;
    } else if (this.registerTroubleForm.controls['codcan'].value == null ||
      this.registerTroubleForm.controls['codcan'].value == undefined ||
      this.registerTroubleForm.controls['codcan'].value == '') {
      Toast.fire({
        icon: "warning",
        title: "No puedes enviar el campo cantón vacío"
      });
      return false;
    }

    else if (this.registerTroubleForm.controls['mensajeDelProblema'].value == null ||
      this.registerTroubleForm.controls['mensajeDelProblema'].value == undefined ||
      this.registerTroubleForm.controls['mensajeDelProblema'].value == '') {
      Toast.fire({
        icon: "warning",
        title: "No puedes enviar el campo descripción del problema vacío"
      });
      return false;
    } else {
      return true;
    }
  }

  guardarRequerimiento() {
    let resultado = this.obtenerFechaYHora();
    let xcia: any = sessionStorage.getItem('ccia');

    if (this.validateInputFill()) {
      this._show_spinner = true;
      this.modelSendRequerimiento = {
        idAgencia: this.registerTroubleForm.controls['agencia'].value,
        url: "",
        estado: 1,
        codprov: this.registerTroubleForm.controls['codprov'].value,
        ciudad: this.registerTroubleForm.controls['codcan'].value,
        fecrea: new Date(),
        fechainiPlanif: new Date(),
        fechafinPlanif: new Date(),
        area: this.registerTroubleForm.controls['espacioSirve'].value,
        motivoTrabajo: this.registerTroubleForm.controls['observacion'].value,
        espacioSirve: this.registerTroubleForm.controls['espacioSirve'].value,
        descripcionProblema: this.registerTroubleForm.controls['mensajeDelProblema'].value,
        nserieEquipo: this.equipoSeleccionado.nserie,
        beneficiario: "",
        telefono: "",
        email: "",
        fecreaRealIni: new Date(),
        fecreaRealFin: new Date(),
        codTipoEquipo: this.equipoSeleccionado.tipomaquina,
        codMarca: this.equipoSeleccionado.codmaquina,
        codModelo: this.equipoSeleccionado.nombremodelo,
        tipo: '002',
        horaInicialReal: '00:00:00',
        horaFinalReal: '00:00:00',
        horaInicialPlanificada: resultado.horaFormateada,
        horaFinalPlanificada: resultado.horaFormateada,
        usercrea: this.xcli,
        ccia: xcia,
        codUserAtencionTicket: 'Usuario sin asignar'
      }


      this.maquinaria.guardarTicketRequerimiento(this.modelSendRequerimiento).subscribe({
        next: (x: any) => {
          this.onUpload(x.id);
          this.modelSendRequerimiento.idTicket = x.id;
          this.GetTickets.emit(this.modelSendRequerimiento);
          this.helpdeskExtServ.notificarActualizacionTicket();
          Toast.fire({
            icon: "success",
            title: "Ticket creado con éxito!"
          });
        }, error: (e) => {
          Toast.fire({
            icon: "error",
            title: "Algo ha pasado"
          });
          console.error(e);
          this._show_spinner = false;
        }, complete: () => {
          this._show_spinner = false;
          this.cancelBtn();
        }
      });
    }
  }


  encodeImageFileAsURL(id: any) {

    this._show_spinner = true;
    const filesSelected: any = document.getElementById(id) as HTMLInputElement;
    this.fileId = filesSelected.files;
    let s = this.fileId[0].name.split('.');
    this.nameFile = s[0].toString().replace(' ', '_');

    let base;
    if (this.fileId.length > 0) {
      const fileToLoad: any = filesSelected[0];
      const fileReader: any = new FileReader();
      fileReader.onload = () => {
        base = fileReader.result;
      };

      fileReader.onloadend = () => {
        this._IMGE = fileReader.result;
        // this.validacionHayImagen();
      };

      fileReader.readAsDataURL(this.fileId[0]);
      this._show_spinner = false;

    }

  }





}
