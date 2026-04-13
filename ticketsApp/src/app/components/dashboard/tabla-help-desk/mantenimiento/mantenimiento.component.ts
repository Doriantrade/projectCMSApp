import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MantenimientoService } from './services/mantenimiento.service';

import { MatDialog } from '@angular/material/dialog';
import { ModalRepuestosComponent } from '../resumen-mantenimiento/modal-repuestos/modal-repuestos.component';
import { ModalTecnicosComponent } from '../../modal-tecnicos/modal-tecnicos.component';
import { MasterTableService } from 'src/app/components/shared/master-table/master-table.service';

import Swal from 'sweetalert2'
import { EmailSettingsServiceX } from 'src/app/components/shared/configuraciones/services/email-settings.service';
import { DocumentoCotizacionService } from '../../documento-cotizacion/services/documento-cotizacion.service';
import { Environments } from 'src/app/environments/environments';
import { EncryptService } from 'src/app/components/shared/services/encrypt.service';
import { ImagecontrolService } from 'src/app/components/shared/imagen-control/imagecontrol.service';
import { CotizacionService } from '../../repuestos-asignados/modal-cotizacion/modal-cotizacion/services/cotizacion.service';
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
  selector: 'app-mantenimiento',
  templateUrl: './mantenimiento.component.html',
  styleUrls: ['./mantenimiento.component.scss']
})

export class MantenimientoComponent implements OnInit {

  xcli: any;
  _show_spinner: boolean = false;
  @Input() requerimiento: any;
  @Output() showFormFechaReal: EventEmitter<any> = new EventEmitter();
  @Output() newMantenimiento: EventEmitter<any> = new EventEmitter();
  // @Output() emitTecnicosMantenimiento: EventEmitter<any> = new EventEmitter();
  @Output() emitRepuestosMantenimiento: EventEmitter<any> = new EventEmitter();
  validateData: boolean = false;
  nomeclaturaTipoMantenimiento: any;
  sendCabCOtiza: any = [];
  totalPVP: number = 0;
  id: any;
  codrep: any;
  idRequer: any;
  estado: any;
  cantidad: any;
  valorFinal: any;
  nombreEmpresa: any;
  descripcionEmpresa: any;
  descripcionRepuesto: any;
  direccion: any;
  cargo: any;
  nombrePersCargo: any;
  logotipoUrl: any;
  textoCotizacion: any;
  replegal: any;
  replegalGhost: any;
  telf1: any;
  telf2: any;
  email: any;
  nombreMarcaEquipo: any;
  nombreModeloEquipo: any;
  nombreTipoDeEquipo: any;
  nombreRep: any;
  nserie: any;
  nombreCliente: any;
  nombreClienteGhost: any;
  nombreAgencia: any;
  contadorinicial: any;
  contadorfinal: any;
  ninventario: any;
  codigobp: any;
  fechaActual: any;
  firma: any;
  iva: any;

  listaResumenMantenimiento:any = [];
  listaEstadoEquipo:any = [];
  modelResumenMantenimiento: any = [];

  listaTecnicosRecibidos: any = [];
  listaEquiposRepuestos:  any = [];
  show_rep_menu: boolean = false;
  modelSend: any = [];

  // por ahora quemaremos el codigo del proceso en una variable publica
  codProcess = '003'; // Este proceso es el envio de cotizacion
  listEmailCLiSetts: any = [];

  /**VARIABLES PARA EL ENVIO DEL EMAIL */
  recipients: any;
  body: any;
  subject: any;
  fromAddress: any;
  replyTo: any;
  usercrea: any;
  fecrea: any;
  codcli: any;
  idconfig: any;
  codecProcess: any;

  resumenMantenimientoRegisterForm = new FormGroup ({
    codResuMante:         new FormControl(),
    solucionImplementada: new FormControl(),
    estadoEquip:          new FormControl(),
    observacion:          new FormControl(),
    valor:                new FormControl(0.0),
    contadorFinal:        new FormControl(0)
 })

 validateDatoSelect() {
    if ( this.resumenMantenimientoRegisterForm.controls['codResuMante'].value.toString().trim() == '005') {
      this.validateData = true;
      return;
    } 
    this.validateData = false;
  }

  constructor( private mt:    MasterTableService, 
               private fileControlServ: ImagecontrolService,
               private cotizaServ: CotizacionService,
               private eSet:   EmailSettingsServiceX,
               private env: Environments,
               private renderer: Renderer2, private el: ElementRef,
               private cotiza: DocumentoCotizacionService,
               private fechaService: EncryptService, 
               private mant:  MantenimientoService,
               public dialog: MatDialog ) {}
               ccia: any
  ngOnInit(): void {
    // console.log('Enviado al Resumen Mantenimiento')
    // console.log(this.requerimiento)
    this.xcli = sessionStorage.getItem('codcli');
    this.ccia = sessionStorage.getItem('ccia');
    this.obtenerResMantenimiento();
    this.obtenerEstadoEquipo();
    // quemamos por ahora el id de configuracion de los settings del envio de email para el cliente, ya
    // que este dato debe traerlo en el sp de obtener tickets requerimiento
    this.igualarcontadorFinal();
  }

  actualizarContadoresEquipo() {

    if ( this.resumenMantenimientoRegisterForm.controls['contadorFinal'].value == undefined || this.resumenMantenimientoRegisterForm.controls['contadorFinal'].value == null || this.resumenMantenimientoRegisterForm.controls['contadorFinal'].value == 0 ) {
    
      return;
    
    }

    this.mant.actualizarContadorEquipo( this.requerimiento.codmaquina, this.resumenMantenimientoRegisterForm.controls['contadorFinal'].value )
             .subscribe({
              next: (x) => {
                // console.warn("CONTADORES DEL EQUIPO ACTUALIZADO");
                Swal.fire({
                  text: "Contadores del equipo actualizado",
                  icon: "success"
                });
              }, error: (e) => {
                console.error(e);
              }
             })

  }

  enviarEmailProcess( ) {

    this.modelSend = {      
        "profileName": "NotificationDev",
        "recipients":  this.recipients,
        "body":        this.body,
        "subject":     this.subject,
        "excludeQueryOutput": true,
        "ccRecipients": [
          ""
        ],
        "bccRecipients": [
          ""
        ],
        "fromAddress": this.fromAddress,
        "replyTo":     this.replyTo,
        "isBodyHtml":  true
    }

    // console.warn(this.modelSend);

    this.eSet.enviarEmails( this.modelSend ).subscribe({
      next: (x) => {
        // console.warn('EMAIL ENVIADO');
      }
    })

  }

  idResumenMantenimiento: number = 0;
  guardarResumenMantenimiento( idRequerimiento: number ) {

    this.idResumenMantenimiento = 0;
    if ( this.resumenMantenimientoRegisterForm.controls['codResuMante'].value == undefined || this.resumenMantenimientoRegisterForm.controls['codResuMante'].value == null || this.resumenMantenimientoRegisterForm.controls['codResuMante'].value == '' ) {
      Swal.fire({
        text: "El campo Motivo de visita, no puede estar vacío",
        icon: "warning"
      });
    } else if ( this.resumenMantenimientoRegisterForm.controls['solucionImplementada'].value == undefined || this.resumenMantenimientoRegisterForm.controls['solucionImplementada'].value == null || this.resumenMantenimientoRegisterForm.controls['solucionImplementada'].value == '' ) {
      Swal.fire({
        text: "El campo Solución implementada, no puede estar vacío",
        icon: "warning"
      });
    } else if ( this.resumenMantenimientoRegisterForm.controls['estadoEquip'].value == undefined || this.resumenMantenimientoRegisterForm.controls['estadoEquip'].value == null || this.resumenMantenimientoRegisterForm.controls['estadoEquip'].value == '' ) {
      Swal.fire({
        text: "El campo Solución implementada, no puede estar vacío",
        icon: "warning"
      });
    } else {
      this._show_spinner = true;
      this.modelResumenMantenimiento = {
        idRequerimiento:      idRequerimiento,
        fecrea:               new Date(),
        codResuMante:         this.resumenMantenimientoRegisterForm.controls['codResuMante'].value,
        solucionImplementada: this.resumenMantenimientoRegisterForm.controls['solucionImplementada'].value,
        usercrea:             this.xcli,
        estadoEquip:          this.resumenMantenimientoRegisterForm.controls['estadoEquip'].value,
        valor:                this.resumenMantenimientoRegisterForm.controls['valor'].value,
        observacion:          this.resumenMantenimientoRegisterForm.controls['observacion'].value,
        estado:               1
      }

      this.mant.guardarResumenMantenimiento(this.modelResumenMantenimiento).subscribe({
          next: (x:any) => {
            this.idResumenMantenimiento = x.id;

            if ( this.modelSendAsignacionRepuestosRequerimientos.length > 0 ) { 

              this.guardarCabCotiza(1, this.idResumenMantenimiento);

            }

            this._show_spinner = false;
          }, error: (e) => {
            this._show_spinner = false;
            console.error(e);
          }, complete: () => {
            this.actualizarContadoresEquipo();
            setTimeout(() => {
              this.showFormFechaReal.emit(true);
              /** ========================================================================== */
              /** EMISION DE DATOS */
              this.newMantenimiento.emit(this.modelSendAsignacionRepuestosRequerimientos);
              this.emitRepuestosMantenimiento.emit(this.listaEquiposRepuestos);
              /** ========================================================================== */
              Swal.fire({
                text: "Resumen guardado",
                icon: "success"
              });
              this._show_spinner = false;
            }, 1000);
          }
      })
    }
  
  }

  quitZeroInput(tipoControl: keyof typeof this.resumenMantenimientoRegisterForm.controls) {
    this.resumenMantenimientoRegisterForm.controls[tipoControl].setValue(
      (this.resumenMantenimientoRegisterForm.controls[tipoControl].value || 0) * 1
    );
  }

  igualarcontadorFinal() {
    this.resumenMantenimientoRegisterForm.controls['contadorFinal'].setValue( this.requerimiento.contadorfinal );
  }

  validateRangoContadores() {
    
    // // console.log(this.requerimiento.contadorfinal);
    // // console.warn(this.resumenMantenimientoRegisterForm.controls['contadorFinal'].value)
    
    if ( this.resumenMantenimientoRegisterForm.controls['contadorFinal'].value == undefined || this.resumenMantenimientoRegisterForm.controls['contadorFinal'].value == null ) {
      this.resumenMantenimientoRegisterForm.controls['contadorFinal'].setValue(0);
    }

    let xvalue: number = this.resumenMantenimientoRegisterForm.controls['contadorFinal'].value || 0;
    
    if ( xvalue < this.requerimiento.contadorfinal ) {
      Swal.fire({
        text: "El contador final no puede ser menor al contador inicial",
        icon: "warning"
      });
      this.resumenMantenimientoRegisterForm.controls['contadorFinal'].setValue(0);
      return;
    }
  }

  guardarCabCotiza(estado: number, idResumenMantenimiento: number) {
    
    this._show_spinner = true;
    this.totalPVP = this.listaEquiposRepuestos.reduce( (sum: number, mm: any) => sum + mm.totalPVP, 0 );
  
    const date: any = new Date();
    const xcodcli: any = sessionStorage.getItem('codcli');
    this.sendCabCOtiza = {
      codcli:      this.requerimiento.codcliente,
      feccrea:     date,
      total:       this.totalPVP,
      idRepoTec:   this.requerimiento.idTicket,
      usercrea:    xcodcli,
      estado:      estado,
      idResManten: idResumenMantenimiento
    };

    this.cotizaServ.guardarCabCotiza(this.sendCabCOtiza).subscribe({
      next: (x) => {
        console.warn('CABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZA');
        console.warn('CABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZA');
        console.warn('Cabecera de cotización guardada');
        console.warn(x);
        console.warn('CABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZA');
        console.warn('CABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZACABCOTIZA');
        // alert('Datos de cab cotiza guardados!!!!')
        this._show_spinner = false;
      }, error: (e) => {
        this._show_spinner = false;
      }
    });

  }

  obtenerResMantenimiento() {
    this._show_spinner = true;
    this.mt.obtenerDatosMasterTable( 'RM' ).subscribe({
      next: (x) => {
        this.listaResumenMantenimiento = x;
      },  complete: () => {
        this._show_spinner = false;
      }, error: (e) => {
        this._show_spinner = false;
        console.error(e);
      }}
    )
  }

  validacionRep(codResuMante: any) {
    let cresman: any = codResuMante.toString().trim();
    if ( cresman == '005' ) {
      this.show_rep_menu = true;
    }
    else this.show_rep_menu = false; 
  }

  eliminarRepuAsign(index:number) {
    this.listaEquiposRepuestos.splice(index, 1);
  }


  openDataRepuestosDialog() {

    const dialogRef = this.dialog.open( ModalRepuestosComponent, {
      maxHeight: '90vh',
      width: '80%',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.listaEquiposRepuestos = result;
        // console.warn(this.listaEquiposRepuestos);
      }
    });
  }

modelSendAsignacionRepuestosRequerimientos: any = [];

  guardarAsignacionRepuestosRequerimientos() {
    let xdata: any = [];
    this.modelSendAsignacionRepuestosRequerimientos = [];
    // console.log('antes', this.listaEquiposRepuestos);
    this.listaEquiposRepuestos.forEach( (x:any) => {
      xdata = {
        "codrep":      x.codrep,
        "idRequer":    this.requerimiento.idTicket,
        "estado":      1,
        "usercrea":    this.xcli,
        "codcia":      "CMS-001-2023",
        "cantidad":    Number(x.cantDespacho),
        "valorFinal":  Number(x.totalPVP)
      }
      this.modelSendAsignacionRepuestosRequerimientos.push(xdata);
    });
    this._show_spinner = true;
    console.warn('MODELO LISTO PARA GUARDAR REPUESTOS');
    console.warn(this.modelSendAsignacionRepuestosRequerimientos);
    // AQUI ELIMINAR LOS REPETIDOS ANTES DE GUARDAR
    this.modelSendAsignacionRepuestosRequerimientos = 
      this.modelSendAsignacionRepuestosRequerimientos.filter((item: any, index: number, self: any[]) =>
        index === self.findIndex((t: any) => (
            t.codrep === item.codrep
        ))
    );
    
    console.warn('MODELO SIN DUPLICADOS')
    console.warn(this.modelSendAsignacionRepuestosRequerimientos)

    if ( this.modelSendAsignacionRepuestosRequerimientos.length > 0 ) { 

    this.mant.guardarAsignacionRepuestosRequerimientos( this.modelSendAsignacionRepuestosRequerimientos )
            .subscribe({
               next: (x) => {
                console.warn('REPUESTOS ASIGNADOS GUARDADOS');
                console.warn(x);
              },error: (e) => {
                this._show_spinner = false;
                console.error(e);
              }, complete: () => {
                this._show_spinner = false
              }              
            })
     }
  }

  openDataTecnicosDialog() {

    const dialogRef = this.dialog.open( ModalTecnicosComponent, {
      height: '80vh',
      width: '80%',
      data: this.requerimiento
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        // // console.log('result:')
        this.listaTecnicosRecibidos = result;
        // // console.log(this.listaTecnicosRecibidos);
      }
    });
  }

  // deleteTecnicoAsign(tecnicos:any, i:number) {
  //   this.listaTecnicosRecibidos.splice( i, 1 );
  // }

  obtenerEstadoEquipo() {
    this._show_spinner = true;
    this.mt.obtenerDatosMasterTable( 'EF' ).subscribe({
      next: (x) => {
        this.listaEstadoEquipo = x;
      },  complete: () => {
        this._show_spinner = false;
      }, error: (e) => {
        this._show_spinner = false;
      }}
    )
  }


  onSubmit() {
    this.guardarResumenMantenimiento( this.requerimiento.idTicket );
    this.guardarAsignacionRepuestosRequerimientos();
  }

}
