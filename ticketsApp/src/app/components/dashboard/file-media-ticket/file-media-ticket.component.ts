import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ImagecontrolService } from '../../shared/imagen-control/imagecontrol.service';
import Swal from 'sweetalert2'
import { jwtDecode } from 'jwt-decode';
import { EncryptService } from '../../shared/services/encrypt.service';
import { Environments } from 'src/app/environments/environments';
import { EmailConfig } from '../../shared/configuraciones/services/models/email-config.interface';
import { filter, map, Observable, tap } from 'rxjs';
import { EmailSettingsServiceX } from '../../shared/configuraciones/services/email-settings.service';
import { MantenimientoService } from '../tabla-help-desk/mantenimiento/services/mantenimiento.service';
import { CotizacionService } from '../repuestos-asignados/modal-cotizacion/modal-cotizacion/services/cotizacion.service';
import { FileMediaTicketsService } from './services/file-media-tickets.service';
import { ModalDownCotizacionComponent } from '../repuestos-asignados/modal-down-cotizacion/modal-down-cotizacion.component';
import { MatDialog } from '@angular/material/dialog';

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
  selector: 'app-file-media-ticket',
  templateUrl: './file-media-ticket.component.html',
  styleUrls: ['./file-media-ticket.component.scss']
})

export class FileMediaTicketComponent implements OnInit, OnChanges {
  modelSendFileMidaTicketDBHub: any = [];
  @Input() requerimiento: any;
  _show_spinner: boolean = false;
  public fileonReporteTecnico!: File;
  public fileonReporteCotizacion!: File;
  public fileonReporteNotaEntrega!: File;
  modelSendFileMidaTicketDB: any = [];
  _cli_view: boolean = false;
  file_ep: boolean = true;
  role: any;
  listTecnicosEmails: any = [];
  correoMantenimiento: string = '';
  processChoicex: any;
  body: any;
  subject: any;
  recipients: any;
  fromAddress: any;
  replyTo: any;
  enviarEmail: number = 0;
  serverPathFile: any;

  listaReporteTecnico: any = [];
  listaReporteCotizacion: any = [];
  listaReporteNotaEntrega: any = [];

  analisisCodRep: any = [];
  listaRepuestoRequerimientos: any = [];

  fileMediaRegisterForm = new FormGroup({
    fileMediaReporteTecnico: new FormControl(null),
    fileMediaCotizacionRep: new FormControl(null),
    fileMediaNotaEntregaRep: new FormControl(null),
  });

  doculistAutorizacion: any = [];
  adjuntos: any = [];

  constructor(
    private env: Environments,
    private fillemedServ: FileMediaTicketsService,
    private mserv: MantenimientoService,
    private ncrypt: EncryptService,
    private ctz: CotizacionService,
    private eSet: EmailSettingsServiceX,
    private fileControlServ: ImagecontrolService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    console.warn('requerimiento en file media ticket:', this.requerimiento);
    // this.correoMantenimiento = ''
    this.correoMantenimiento = this.requerimiento.correomantenimiento;
    // console.warn(this.correoMantenimiento)
    this.getToken();
    this.listaReporteTecnico = [];
    this.listaReporteCotizacion = [];
    this.listaReporteNotaEntrega = [];
    this.obtenerFileMediaTicket('REPTEC');
    this.obtenerFileMediaTicket('COTIZA');
    this.obtenerFileMediaTicket('NOTENT');
    this.obtenerEmailCliSetts(1);
    this.obtenerRepuestosRequerimientos();
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['requerimiento'] && changes['requerimiento'].currentValue) {

      this.listaReporteTecnico = [];
      this.listaReporteCotizacion = [];
      this.listaReporteNotaEntrega = [];
      this.obtenerTecnicosRequer();

    }

  }

  obtenerTecnicosRequer() {
    this.mserv.obtenerTecnicosTicket(this.requerimiento.idTicket).subscribe({
      next: (X: any) => {
        X.filter((j: any) => {
          this.listTecnicosEmails.push(j.email);
        })
      }, error: (e) => {
        console.error(e)
      }
    })
  }

  actualizarEstadoCabCotiza() {
    const xuser: any = sessionStorage.getItem('usuario');
    if (this.codUserLog) {
      this.ctz.actualizarCabCotiza(this.requerimiento.idTicket, this.codUserLog, 2).subscribe({
        next: (x: any) => {
          const fecha = new Date(x.fechaAprueba);
          const opcionesFecha = { day: 'numeric', month: 'long', year: 'numeric' } as const;
          const fechaFormateada = fecha.toLocaleDateString('es-ES', opcionesFecha);

          let horas = fecha.getHours();
          const minutos = fecha.getMinutes().toString().padStart(2, '0');
          const ampm = horas >= 12 ? 'PM' : 'AM';
          horas = horas % 12 || 12;

          const horaFormateada = `${horas}:${minutos} ${ampm}`;
          const mensaje = `Cotización ${this.requerimiento.idRequerimientoPad}, ha sido aprobada por el usuario ${xuser}. el ${fechaFormateada} a las ${horaFormateada}`;

          // console.warn(mensaje);

          this.sendMail(
            [''],
            this.recipients,
            this.fromAddress,
            this.replyTo,
            mensaje,
            'Cotización, '
          );

        },
        error: (e) => console.error(e),
      });
    }
  }


  openDataProcessDownCotizModal(idfilemedia: number, index: number) {
    this.darDeBajaCotizacion();
    // console.log('this.analisisCodRep')
    // console.log(this.analisisCodRep)
    const dialogRef = this.dialog.open(ModalDownCotizacionComponent, {
      height: '95%',
      width: '70%',
      data: this.analisisCodRep
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.listaRepuestoRequerimientos = [];
        // this.refreshListData.emit( { idReuqer: result.idRequer, idResMant: result.idResManten });
        if (result != null) {
          // alert('Tratando de eliminar archivo de cotización asociado al ticket...');
          this.fileControlServ.eliminarArchivosMedia(idfilemedia, 'COTIZA').subscribe({
            next: () => {
              Swal.fire({
                title: "Eliminado!",
                text: "Tu archivo ha sido eliminado.",
                icon: "success"
              });
              this.eliminarArchivoLocal(index, 'COTIZA');
            },
            error: (e) => {
              console.error(e);
              Swal.fire({
                title: "Error",
                text: "Hubo un problema al eliminar el archivo.",
                icon: "error"
              });
            }
          });
          this.elimianarAsignRepuTicket(result.idRequer);
          return;
        }
      }
    });
  }

  obtenerRepuestosRequerimientos() {
    this.mserv.obtenerRepuestosRequerimientos(Number(this.requerimiento.idRequerimientoPad.split('#MC-')[1])).subscribe({
      next: (x: any) => this.listaRepuestoRequerimientos = x
    })
  }

  darDeBajaCotizacion() {
    this.analisisCodRep = [];
    this.listaRepuestoRequerimientos.forEach((x: any) => {
      this.analisisCodRep.push({
        cantidad: x.cantidad,
        codRep: x.codrep,
        name: x.nombreRep,
        icon: 'hourglass_top',
        colorState: 'orange',
        idRequer: x.idRequer,
        idResManten: x.idResManten,
        nombreAgencia: x.nombreAgencia,
        nombreCliente: x.nombreCliente,
        correomantenimiento: x.correomantenimiento
      });
    })
  }

  elimianarAsignRepuTicket(idRequerimiento: any) {
    this.mserv.eliminarAsignacionRepuTicket(idRequerimiento).subscribe({
      next: (x) => {
        // // console.log('ASIGNACIONES ELIMINADAS');
        this.listaRepuestoRequerimientos = [];
      }, error: (e) => {
        console.error(e);
      }
    })
  }






  codUserLog: any;
  show_file_form: boolean = false;
  getToken() {
    let xtoken: any = sessionStorage.getItem('token');
    const xtokenDecript: any = this.ncrypt.decryptWithAsciiSeed(xtoken, this.env.es, this.env.hash);

    if (xtokenDecript != null || xtokenDecript != undefined) {

      var decoded: any = jwtDecode(xtokenDecript);
      // console.table(decoded)
      this.role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      this.codUserLog = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/country"];

      // R003 = ADMINISTRADOR
      // R002 = CLIENTE NORMAL
      // R004 = CLIENTE GERENTE

      if (this.role == 'R004') this._cli_view = false; this.show_file_form = false;
      if (this.role == 'R003' || this.role == 'R002') this._cli_view = true;
      if (this.role == 'R003') this.show_file_form = true;

    }
  }

  envioAutorizacion: boolean = true;
  onFileSelectedReporteTecnico(event: any): void {
    if (!this.correoMantenimiento) {
      // alert('Cliente sin correo de mantenimiento asignado!, el correo de autorización deberá ser enviado manualmente, \n si no asignas uno antes de terminar el proceso de subir el archivo de REPORTE TÉCNICO.')
      this.envioAutorizacion = false;
    } else {
      this.envioAutorizacion = true;
    }
    event.target.files.length > 0 ? this.parametrizarArchivo(event, 'REPTEC') : null;
  }

  onFileSelectedReporteCotizaciones(event: any): void {
    event.target.files.length > 0 ? this.parametrizarArchivo(event, 'COTIZA') : null;
  }

  onFileSelectedNotaEntrega(event: any): void {
    event.target.files.length > 0 ? this.parametrizarArchivo(event, 'NOTENT') : null;
  }

  parametrizarArchivo(event: any, tipo: string) {
    const file = event.target.files[0];
    if (!file) return;
    let now = new Date();
    let fechaActual = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
      + `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
    let ticketId = this.requerimiento.idRequerimientoPad.split('#')[1];

    // Obtener la extensión original del archivo
    const extension = file.name.split('.').pop() || 'pdf';
    let nuevoNombre = `${ticketId}-${fechaActual}.${extension}`;

    const renamedFile = new File([file], nuevoNombre, { type: file.type });
    if (tipo === 'REPTEC') this.fileonReporteTecnico = renamedFile;
    if (tipo === 'COTIZA') this.fileonReporteCotizacion = renamedFile;
    if (tipo === 'NOTENT') this.fileonReporteNotaEntrega = renamedFile;
    Swal.fire({
      title: "Archivo preparado",
      text: `El archivo ha sido renombrado a: ${nuevoNombre}. Ahora puedes subirlo.`,
      icon: "info"
    });
  }

  generarDocuAutorizacion(tecnicos: any[], nAutorizacion: string) {

    let htmlPDFautorizacion = `
    
    <html>
      <head>
      </head>
      <body>        
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h1> <span>AUTORIZACIÓN DE INGRESO <span>  <span> ${nAutorizacion} </span> </h1>
        </div>
        <div>
          <p>Fecha de autorización: ${new Date().toLocaleDateString()}</p>
          <p>Por la presente se autoriza el ingreso de los siguientes técnicos al sistema de CMS, para realizar el mantenimiento preventivo y correctivo de los equipos asignados al cliente.</p> 
        </div>
        <div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #000; text-align: left;">Nombre</th>
                <th style="border: 1px solid #000; text-align: left;">Cédula</th>
                <th style="border: 1px solid #000; text-align: left;">Email</th>
                <th style="border: 1px solid #000; text-align: left;">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${tecnicos.map((tecnico: any) => `
                <tr>
                  <td style="border: 1px solid #000; padding: 8px;">${tecnico.nombreTecnico || ''} ${tecnico.apellidoTecnico || ''}</td>
                  <td style="border: 1px solid #000; padding: 8px;">${tecnico.cedula || 'No registrada'}</td>
                  <td style="border: 1px solid #000; padding: 8px;">${tecnico.email || 'No disponible'}</td>
                  <td style="border: 1px solid #000; padding: 8px;">${tecnico.estado || 'Activo'}</td>
                </tr>
              `).join('')}
            </tbody>
        </div>
          <div class="email-footer">
          <img src="${this.env.logoCMS64bits}" alt="Cash Machine Systems" class="logo">
          <p>Victor Manuel Rendón y Pedro Carbo<br>
          Guayaquil, Ecuador<br>
          Telf.: (+593) 9999985552<br>
          <a href="http://www.cashmachinesserv.com" style="color: #444;">www.cashmachinesserv.com</a></p>
        </div>
      </body>
    </html>
    `;

  }



  submitFileReporteTecnico() {

    if (this.fileonReporteTecnico) {

      const fileType = this.fileonReporteTecnico.type;
      if (fileType === 'application/pdf' || fileType === 'image/jpeg' || fileType === 'image/png') {
        let x: any = this.requerimiento.idRequerimientoPad.toString().split('#');
        // 1. Primero subimos el archivo
        this.uploadFile(
          this.fileonReporteTecnico,
          'ReporteTecnico',
          x[1],
          this.listTecnicosEmails,
          this.fromAddress,
          this.replyTo,
          this.body,
          this.subject
          , 'REPTEC'
        );

        // 2. Guardamos en BASE DE DATOS
        this.guardarArchivosDB('REPTEC', this.fileonReporteTecnico.name);

        // 3. Envío de DOS correos diferentes
        if (this.envioAutorizacion) {
          // --- CORREO DE AUTORIZACIÓN (PARA CLIENTE) ---
          // OBTENCION DE LA URL DEL ARCHIVO DE AUTORIZACION - POR MEDIO DE NODE JS
          this._show_spinner = true;
          this.fillemedServ.getAuthorizationFileMediaTicket(this.requerimiento.idTicket).subscribe({
            next: (x: any) => {
              this.doculistAutorizacion = x;
              // console.log('this.doculistAutorizacion');
              // console.log(this.doculistAutorizacion);
              this._show_spinner = false;
            }, complete: () => {
              const fileurl = this.doculistAutorizacion.url_file;
              const fileName = fileurl.match(/\/([^\/]+\.pdf)$/i)[1];
              // PATH LOCAL
              // this.adjuntos.push(`C:\\Users\\Administrador\\Desktop\\DEPLOY-CMS\\NODE-SMTP\\src\\wwwroot\\autorizacion\\${fileName}`);
              // PATH SERVIDOR
              this.adjuntos.push(`C:\\Users\\Administrador\\Desktop\\build-node-server-mail\\dist\\wwwroot\\autorizacion\\${fileName}`);
              //C:\Users\Administrador\Desktop\build-node-server-mail\dist\wwwroot
              let confCliCodProcess = ['010'];
              const authConfig = this.listConfmail.find((x: any) => confCliCodProcess.includes(x.codecProcess));

              if (authConfig) {
                this.processChoicex = 'AUTORIZACION-INGRESO-TECNICO'
                // Generar tabla de técnicos para la autorización
                let tecnicosHtmlAuth = this.generarTablaTecnicos();
                let fechaActual = new Date();
                let anioActual = fechaActual.getFullYear();
                let mesActual = fechaActual.getMonth() + 1;
                let diaActual = fechaActual.getDate();

                // Verificar si es el día 1 del mes
                if (diaActual === 1) {
                  let docuAutorizacion_IESS = `C:\\inetpub\\wwwroot\\back-apptickets\\wwwroot\\storage\\IESS_ingreso_tecnicos_${anioActual}_${mesActual}\\IESS_ingreso_tecnicos_${anioActual}_${mesActual}.pdf`
                  this.adjuntos.push(docuAutorizacion_IESS);
                }

              }

            }, error: (e) => {
              console.error('Error al obtener la autorización:', e);
              Swal.fire({
                title: "Error",
                text: "No se pudo obtener la autorización. Inténtalo de nuevo más tarde.",
                icon: "error"
              });
              this._show_spinner = false;
            }
          })
        }
      } else {
        Swal.fire({
          title: "¿No es PDF?",
          text: "Solo aceptamos archivos con extensión .pdf, .jpg, .jpeg o .png",
          icon: "warning"
        });
      }
    }
  }

  // Método auxiliar para generar la tabla de técnicos
  generarTablaTecnicos(): string {
    let tecnicosHtml = `
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr>          
          <th style="border: 1px solid #fff; text-align: left; background-color:rgb(32, 34, 45); color: white;">Nombre</th>
          <th style="border: 1px solid #fff; text-align: left; background-color: rgb(32, 34, 45);color: white;">Cédula</th>
          <th style="border: 1px solid #fff; text-align: left; background-color: rgb(32, 34, 45);color: white;">Email</th>
          <th style="border: 1px solid #fff; text-align: left; background-color: rgb(32, 34, 45);color: white;">Estado</th>
        </tr>
      </thead>
      <tbody>`;

    this.requerimiento.tecnicos.forEach((tecnico: any) => {
      tecnicosHtml += `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${tecnico.nombreTecnico || ''} ${tecnico.apellidoTecnico || ''}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${tecnico.cedula || 'No registrada'}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${tecnico.email || 'No disponible'}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${tecnico.estado || 'Activo'}</td>
      </tr>`;
    });

    tecnicosHtml += `</tbody></table>`;
    return tecnicosHtml;

  }

  submitFilereporteCotizaciones() {
    if (this.fileonReporteCotizacion) {
      const fileType = this.fileonReporteCotizacion.type;
      if (fileType === 'application/pdf' || fileType === 'image/jpeg' || fileType === 'image/png') {
        let x: any = this.requerimiento.idRequerimientoPad.toString().split('#');
        this.uploadFile(this.fileonReporteCotizacion,
          'Cotizaciones',
          x[1],
          this.recipients,
          this.fromAddress,
          this.replyTo,
          this.body,
          this.subject
          , 'COTIZA'
        );
        this.guardarArchivosDB('COTIZA', this.fileonReporteCotizacion.name);
      } else {
        Swal.fire({
          title: "¿No es PDF?",
          text: "Solo aceptamos archivos con extensión .pdf, .jpg, .jpeg o .png",
          icon: "warning"
        });
      }
    }
  }

  submitFileNotaEntrega() {
    if (this.fileonReporteNotaEntrega) {
      const fileType = this.fileonReporteNotaEntrega.type;
      if (fileType === 'application/pdf' || fileType === 'image/jpeg' || fileType === 'image/png') {
        let x: any = this.requerimiento.idRequerimientoPad.toString().split('#');
        this.uploadFile(this.fileonReporteNotaEntrega,
          'Nota de Entrega',
          x[1],
          this.listTecnicosEmails,
          'gabriel.gallegos@doriantrade.com',
          'andre.rivera@cashmachserv.com',
          'Se adjunta la siguente nota de entrega',
          this.subject,
          'NOTENT');
        this.guardarArchivosDB('NOTENT', this.fileonReporteNotaEntrega.name);
      } else {
        Swal.fire({
          title: "Tipo de archivo no válido",
          text: "Solo aceptamos archivos con extensión .pdf, .jpg, .jpeg o .png",
          icon: "warning"
        });
      }
    }
  }

  obtenerFileMediaTicket(type: string) {
    this.listaReporteTecnico = [];
    this.listaReporteCotizacion = [];
    this.listaReporteNotaEntrega = [];

    if (type == 'REPTEC') {
      this.fileControlServ.obtenerFileMediaTicket(this.requerimiento.idTicket, type).subscribe({
        next: (x) => {
          this.listaReporteTecnico = x;
        }, error: (e) => {
          if (e.status === 400) {
            this.listaReporteTecnico = [];
            console.log('No hay archivos de reporte técnico asociados a este ticket.');
            return;
          } else if (e.status === 404) {
            this.listaReporteTecnico = [];
            console.error('Peticion, incorrecta:', e);
            return;
          } else if (e.status === 500) {
            this.listaReporteTecnico = [];
            console.error('Conexion a servidor inestable, revisar servidor:', e);
            return;
          }
        }, complete: () => {
          this.listaReporteTecnico.forEach((x: any) => {
            let typeFile: any = x.fileUrl.toLowerCase();
            if (typeFile.endsWith('.pdf')) x.typeFile = '../../../../assets/pdf-icons/pdf-logotipo.png';
            else if (typeFile.endsWith('.jpg') || typeFile.endsWith('.jpeg') || typeFile.endsWith('.png')) x.typeFile = '../../../../assets/jpg-icons/img.png';
          });
        }
      });
    }

    else if (type == 'COTIZA') {
      this.fileControlServ.obtenerFileMediaTicket(this.requerimiento.idTicket, type).subscribe({
        next: (x) => {
          this.listaReporteCotizacion = x;
          console.log('this.listaReporteCotizacion');
          console.log(this.listaReporteCotizacion)
          if (this.role == 'R002') {
            if (this.listaReporteCotizacion.length > 1) {
              const primerElemento = this.listaReporteCotizacion.splice(0, 1)[0];
            }
          }
        },
        error: (e) => {
          if (e.status === 400) {
            this.listaReporteCotizacion = [];
            console.log('No hay archivos de cotización asociados a este ticket.');
            return;
          } else if (e.status === 404) {
            this.listaReporteCotizacion = [];
            console.error('Peticion, incorrecta:', e);
            return;
          } else if (e.status === 500) {
            this.listaReporteCotizacion = [];
            console.error('Conexion a servidor inestable, revisar servidor:', e);
            return;
          }
        },
        complete: () => {
          this.listaReporteCotizacion.forEach((x: any, index: number) => {
            // Asignar el tipo de archivo según la extensión
            let typeFile: any = x.fileUrl.toLowerCase();
            if (typeFile.endsWith('.pdf')) {
              x.typeFile = '../../../../assets/pdf-icons/pdf-logotipo.png';
            } else if (typeFile.endsWith('.jpg') || typeFile.endsWith('.jpeg') || typeFile.endsWith('.png')) {
              x.typeFile = '../../../../assets/jpg-icons/img.png';
            }

            // Validar si el índice es 0 para asignar show_multiply_options
            if (index === 0) {
              if (this.role == 'R002') {
                x.show_multiply_options = false; // Solo el primer elemento será false
              }
              else if (this.role == 'R003') {
                x.show_multiply_options = true; // Solo el primer elemento será false
              }
            } else if (index >= 1) {
              x.show_multiply_options = true;
            }
          });
        }
      });
    }

    else if (type == 'NOTENT') {
      this.fileControlServ.obtenerFileMediaTicket(this.requerimiento.idTicket, type).subscribe({
        next: (x) => {
          this.listaReporteNotaEntrega = x;
          console.log('this.listaReporteNotaEntrega');
          console.log(this.listaReporteNotaEntrega);
        }, error: (e) => {
          if (e.status === 400) {
            this.listaReporteNotaEntrega = [];
            console.log('No hay archivos de nota de entrega asociados a este ticket.');
            return;
          }
          else if (e.status === 404) {
            this.listaReporteNotaEntrega = [];
            console.error('Peticion, incorrecta:', e);
            return;
          }
          else if (e.status === 500) {
            this.listaReporteNotaEntrega = [];
            console.error('Conexion a servidor inestable, revisar servidor:', e);
            return;
          }
        }, complete: () => {
          this.listaReporteNotaEntrega.forEach((x: any) => {
            let typeFile: any = x.fileUrl.toLowerCase();
            if (typeFile.endsWith('.pdf')) {
              x.typeFile = '../../../../assets/pdf-icons/pdf-logotipo.png';
            } else if (typeFile.endsWith('.jpg') || typeFile.endsWith('.jpeg') || typeFile.endsWith('.png')) {
              x.typeFile = '../../../../assets/jpg-icons/img.png';
            }
          });
        }
      })
    }
  }

  guardarArchivosDB(type: string, fileName: string) {

    const xcodcli: any = sessionStorage.getItem('codcli');
    let typeCOuntFileCotiza = 0;
    let typeCOuntFileNotEnt = 0;
    let typeCOuntFileRepTec = 0;
    this.modelSendFileMidaTicketDB = {
      "usercrea": xcodcli,
      "fileUrl": fileName.toString().replace(' ', ''),
      "idTicketRequerimiento": this.requerimiento.idTicket,
      "observacion": "",
      "estado": 1,
      "permisos": 1,
      "type": type
    }

    switch (type) {
      case 'COTIZA':
        typeCOuntFileCotiza = 1;
        typeCOuntFileNotEnt = 0;
        typeCOuntFileRepTec = 0;
        break;
      case 'NOTENT':
        typeCOuntFileCotiza = 0;
        typeCOuntFileNotEnt = 1;
        typeCOuntFileRepTec = 0;
        break;
      case 'REPTEC':
        typeCOuntFileCotiza = 0;
        typeCOuntFileNotEnt = 0;
        typeCOuntFileRepTec = 1;
        break;
    }

    this.modelSendFileMidaTicketDBHub = {
      "idTicket": this.requerimiento.idTicket,
      "fileCotiza": typeCOuntFileCotiza,
      "fileNotEnt": typeCOuntFileNotEnt,
      "ffileRepTec": typeCOuntFileRepTec,
      "type": type
    }

    this.fileControlServ.guardarFileMidaTicketDB(this.modelSendFileMidaTicketDB, this.modelSendFileMidaTicketDBHub).subscribe({
      next: (x) => {
        // // console.log("🔄 Actualizando lista de archivos después de guardar...");
        this.obtenerFileMediaTicket('REPTEC');
        this.obtenerFileMediaTicket('COTIZA');
        this.obtenerFileMediaTicket('NOTENT');
      }, error: (e) => {
        console.error('❌ Error al guardar en BD:', e);
      }
    });
  }

  processChoice(data: any) {

    // proceso de perfil escogido
    this.processChoicex = data;
    let confCliCodProcess: string[] = [];
    switch (this.processChoicex) {
      case 'COTIZAFILE':
        confCliCodProcess = ['003', '004', '005'];
        break;
      case 'NENTREGAFILE':
        confCliCodProcess = ['009'];
        break;
      case 'REPTECFILE':
        confCliCodProcess = ['007', '008'];
        break;
      case 'AUTORIZACION-INGRESO-TECNICO':
        confCliCodProcess = ['010'];
        break;
    }

    // Filtrar los elementos cuyo codecProcess esté en el array confCliCodProcess
    const filteredList = this.listConfmail.filter((x: any) => confCliCodProcess.includes(x.codecProcess));
    // console.log(filteredList)
    if (!filteredList.length) {
      // variable para enviar si el correo se envia a o no
      this.enviarEmail = 0;
    } else {
      // variable para enviar si el correo se envia a o no
      this.enviarEmail = 1;
      // cuerpo del correo
      this.body = filteredList[0].body;
      // a quien envia el correo
      this.subject = filteredList[0].subject;
      this.recipients = filteredList[0].recipients;
      // de donde envia el correo
      this.fromAddress = filteredList[0].fromAddress;
      // a quien replica el envio del correo
      this.replyTo = filteredList[0].replyTo;
    }

  }

  listConfmail: any = [];
  //#region ENVIO DE EMAILS
  modelMail: any = [];
  obtenerEmailCliSetts(idConfig: number) {
    this.eSet.obtenerEmailCliSetts(idConfig).subscribe({
      next: (x) => {
        this.listConfmail = x;
      },
      error: (err) => {
        console.error('Error al obtener configuración de email:', err);
      }
    });

  }

  uploadFile(file: File, nombre: string,
    idRequerimiento: string,
    recipients: any,
    fromAddress: any,
    replyTo: any,
    body: any,
    subject: any,
    type: string): void {

    // alert(nombre);

    if (file) {
      this.fileControlServ.uploadFilePDF(file, nombre, idRequerimiento).subscribe({
        next: (response) => {
          this.serverPathFile = response.filePath;
          Swal.fire({
            title: "Archivo",
            text: "Se ha subido exitosamente",
            icon: "success"
          });
        },
        error: (error) => {
          Swal.fire({
            title: "Archivo",
            text: "Error al subir el archivo",
            icon: "error"
          });
          console.error('Error al subir el archivo', error);
        },
        complete: () => {
          // // Verificar si tenemos datos de email válidos antes de enviar
          if (this.enviarEmail) {
            if (type !== 'REPTEC') {
              this.sendMail(
                ['C:\\inetpub\\wwwroot\\back-apptickets\\wwwroot\\' + this.serverPathFile],
                recipients,
                fromAddress,
                replyTo,
                body,
                subject
              );
            }
          } else {
            Swal.fire({
              title: "Hey!",
              text: "No hay un perfil que gestione el envio de correos en este proceso",
              footer: "Consulta con el administrador del software",
              icon: "info"
            });
          }
        }
      });

    }

  }

  sendMail(filePathServer: any, recipients: any, fromAddress: any, replyTo: any, contentHtml: any, subject: any) {

    let toRecipients = recipients.toString().split(',').map((email: string) => ({
      email: email.trim(),
      name: '---'
    }));

    // Determinar el tipo de proceso para personalizar el diseño
    const processType = this.processChoicex || '';
    let headerColor = '#304999'; // Color por defecto (azul corporativo)
    let headerText = 'Notificación CMS';
    let icon = '📄';

    switch (processType) {
      case 'COTIZAFILE':
        headerColor = '#4CAF50'; // Verde para cotizaciones
        headerText = 'Cotización Enviada';
        icon = '💰';
        break;
      case 'NENTREGAFILE':
        headerColor = '#FF9800'; // Naranja para notas de entrega
        headerText = 'Nota de Entrega';
        icon = '📦';
        break;
      case 'REPTECFILE':
        headerColor = '#2196F3'; // Azul claro para reportes técnicos
        headerText = 'Reporte Técnico';
        icon = '🔧';
        break;
      case 'AUTORIZACION-INGRESO-TECNICO':
        headerColor = '#9C27B0'; // Morado para autorizaciones
        headerText = 'Autorización Requerida';
        icon = '🔐';
        break;
    }

    // Plantilla HTML mejorada
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${headerText} - CMS</title>
      <style>
        /* Estilos base */
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        
        /* Contenedor principal */
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        /* Encabezado */
        .email-header {
          background-color: ${headerColor};
          color: white;
          padding: 20px;
          text-align: center;
          position: relative;
        }
        
        .email-header h1 {
          margin: 0;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        /* Cuerpo del email */
        .email-body {
          padding: 25px;
        }
        
        /* Detalles del ticket */
        .ticket-info {
          background: #f9f9f9;
          border-left: 4px solid ${headerColor};
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 0 4px 4px 0;
        }
        
        .ticket-info p {
          margin: 5px 0;
        }
        
        .ticket-info strong {
          color: ${headerColor};
        }
        
        /* Contenido específico */
        .email-content {
          margin-bottom: 20px;
        }
        
        /* Footer */
        .email-footer {
          background: #f1f1f1;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        
        .logo {
          max-width: 180px;
          height: auto;
          margin-bottom: 15px;
        }
        
        /* Tablas (para técnicos) */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        
        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        th {
          background-color: ${headerColor};
          color: white;
        }
        
        tr:hover {
          background-color: #f5f5f5;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>${icon} ${headerText}</h1>
        </div>
        
        <div class="email-body">
          <div class="ticket-info">
            <p><strong>Ticket:</strong> ${this.requerimiento.idRequerimientoPad}</p>
            <p><strong>Cliente:</strong> ${this.requerimiento.nombreCliente}</p>
            <p><strong>Agencia:</strong> ${this.requerimiento.nombreAgencia}</p>
          </div>
          
          <div class="email-content">
            ${contentHtml}
          </div>
        </div>
        
        <div class="email-footer">
          <img src="${this.env.logoCMS64bits}" alt="Cash Machine Systems" class="logo">
          <p>Victor Manuel Rendón y Pedro Carbo<br>
          Guayaquil, Ecuador<br>
          Telf.: (+593) 9999985552<br>
          <a href="http://www.cashmachinesserv.com" style="color: ${headerColor};">www.cashmachinesserv.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

    // Crear el modelo para Brevo manteniendo el manejo original de adjuntos
    const brevoMail: any = {
      to: toRecipients,
      subject: `${headerText}: ${this.requerimiento.idRequerimientoPad} - ${this.requerimiento.nombreCliente}`,
      htmlContent: htmlContent,
      sender: {
        email: "notificaciones@cashmachserv.com",
        name: "Sistema de Notificaciones CMS"
      },
      replyTo: {
        email: replyTo || fromAddress || "notificaciones@cashmachserv.com"
      },
      params: {
        nombreCliente: this.requerimiento.nombreCliente,
        agencia: this.requerimiento.nombreAgencia
      }
    };

    // Validación y agregado de adjuntos (manteniendo tu lógica original)
    if (filePathServer && filePathServer.length > 0) {
      // Filtrar rutas válidas
      const validAttachments = filePathServer
        .filter((file: string) => file && file.trim() !== '')
        .map((file: string) => ({
          filePath: file,
          name: file.split('\\').pop() || file.split('/').pop() || 'documento.pdf'
        }));

      if (validAttachments.length > 0) {
        brevoMail.attachments = validAttachments;
      }
    }

    this.eSet.enviarEmails(brevoMail).subscribe({
      next: (x) => {
        Swal.fire({
          title: filePathServer?.length > 0 ? "Archivo enviado" : "Correo enviado",
          html: `Email enviado a: ${recipients}`,
          icon: "success"
        });
      },
      error: (e) => {
        Swal.fire({
          title: "Error en envío",
          text: "Ocurrió un error al enviar el correo",
          icon: "error"
        });
        console.error('Error al enviar:', e);
      }
    });
  }


  eliminarArchivoMedia(id: number | null, index: number, type: string) {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción es irreversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar!"
    }).then((result) => {

      if (result.isConfirmed) {
        // Si el archivo no tiene un ID, significa que es un archivo recién subido y solo está en la UI
        if (!id || id === 0) {
          this.eliminarArchivoLocal(index, type);
          Swal.fire({
            title: "Eliminado!",
            text: "El archivo fue eliminado",
            icon: "success"
          });
          return;
        }

        // Si el archivo tiene un ID, se envía la petición al servidor
        this.fileControlServ.eliminarArchivosMedia(id, type).subscribe({
          next: () => {
            Swal.fire({
              title: "Eliminado!",
              text: "Tu archivo ha sido eliminado.",
              icon: "success"
            });
            // Eliminamos de la lista local después de la confirmación del servidor
            this.eliminarArchivoLocal(index, type);
          },
          error: (e) => {
            console.error(e);
            Swal.fire({
              title: "Error",
              text: "Hubo un problema al eliminar el archivo.",
              icon: "error"
            });
          }
        });
      }
    });

  }

  // 🔥 Nueva función para eliminar archivos solo de la UI
  eliminarArchivoLocal(index: number, type: string) {
    if (type === 'REPTEC') {
      this.listaReporteTecnico.splice(index, 1);
    } else if (type === 'COTIZA') {
      this.listaReporteCotizacion.splice(index, 1);
    } else if (type === 'NOTENT') {
      this.listaReporteNotaEntrega.splice(index, 1);
    }
  }

  actualizarEstadoArchivosMedia(id: number, estado: number) {

    this.fileControlServ.actualizarArchivosMedia(id, estado, this.requerimiento.idTicket).subscribe({
      next: (x) => {
        Swal.fire({
          title: "Aprobado!",
          text: "Cotización aprobada.",
          icon: "success"
        })
      }, error: (e) => {
        if (e.status === 404) {
          const errorMessage = e.error || "No se encontraron repuestos asociados al requerimiento y a esta cotización.\n Por eso no puede aprobarse";
          Swal.fire({
            title: "Oops!",
            text: `⚠️ Error: ${errorMessage}`,
            icon: "warning"
          });
        }
        else {
          console.error(e);
        }
      },
      complete: () => {
        this.obtenerFileMediaTicket('COTIZA');
        //'C:\\inetpub\\wwwroot\\deploy-back-ticket\\wwwroot\\' + this.serverPathFile,
        this.actualizarEstadoCabCotiza();
      }
    })

  }

  descargarArchivoMediaRTecnico = (nombreArchivo: any, type: any) => {
    let idReq = nombreArchivo.split('-')[0] + '-' + nombreArchivo.split('-')[1];
    this.fileControlServ.descargarArchivoMediaRTecnico(idReq, nombreArchivo, type).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        Toast.fire({
          title: nombreArchivo + ', descargado.',
          icon: "success"
        });
      },
      error: (e) => {
        Toast.fire({
          title: nombreArchivo + ', problemas con la descarga.',
          icon: "error"
        });
      }
    });
  }
}
