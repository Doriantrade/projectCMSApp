import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FechasRealesService } from './services/fechas-reales.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalTecnicosComponent } from '../../modal-tecnicos/modal-tecnicos.component';
import { MantenimientoService } from '../mantenimiento/services/mantenimiento.service';
import Swal from 'sweetalert2'
import { FileMediaTicketsService } from '../../file-media-ticket/services/file-media-tickets.service';
import { EmailSettingsServiceX } from 'src/app/components/shared/configuraciones/services/email-settings.service';
import { Environments } from 'src/app/environments/environments';
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
  selector: 'app-fecha-real',
  templateUrl: './fecha-real.component.html',
  styleUrls: ['./fecha-real.component.scss']
})

export class FechaRealComponent implements OnInit, OnChanges {
  listaTecnicosRecibidos: any = [];
  modelDataRequer: any = [];
  idAgencia: string = '';
  _show_spinner: boolean = false;
  listConfmail: any = [];
  reporteTecnicoSettingsEmail: any = [];
  @Input() requerimiento: any;
  @Output() emitTecnicosMantenimiento: EventEmitter<any> = new EventEmitter();
  @Output() showFormFechaReal: EventEmitter<any> = new EventEmitter();

  constructor(private env: Environments, private eSet: EmailSettingsServiceX, private fecReal: FechasRealesService, private mantServ: MantenimientoService, public dialog: MatDialog, private nodeServer: FileMediaTicketsService) { }

  dateTimeRegisterForm = new FormGroup({
    fecreaRealIni: new FormControl(null),
    fecreaRealFin: new FormControl(null),
    horaInicialReal: new FormControl(null),
    horaFinalReal: new FormControl(null),
    observacion: new FormControl()
  })

  ngOnInit(): void {
    this.inicializarHora();
    this.obtenerEmailCliSetts(1);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.catchData();
    }
  }

  catchData() {
    const x: any = this.requerimiento.fechainiPlanif.toString().split("T");
    const y: any = this.requerimiento.fechafinPlanif.toString().split("T");
    this.dateTimeRegisterForm.controls['fecreaRealIni']
      .setValue(x[0]);
    this.dateTimeRegisterForm.controls['fecreaRealFin']
      .setValue(y[0]);
    this.dateTimeRegisterForm.controls['horaInicialReal']
      .setValue(this.requerimiento.horaInicialReal);
    this.dateTimeRegisterForm.controls['horaFinalReal']
      .setValue(this.requerimiento.horaFinalReal);
    this.dateTimeRegisterForm.controls['observacion']
      .setValue(this.requerimiento.observacion);
  }

  onSubmit() {
    this.actualizarFechaReal();
  }

  validateFecha() {
    let xFecIni: any = this.dateTimeRegisterForm.controls['fecreaRealIni'].value;
    let xFecFin: any = this.dateTimeRegisterForm.controls['fecreaRealFin'].value;

    let currentDate: any = new Date();

    // Convertir xFecIni y xFecFin a objetos Date y sumar un día
    let fechaInicio = xFecIni ? new Date(xFecIni) : null;
    let fechaFinal = xFecFin ? new Date(xFecFin) : null;

    // Nueva validación: igualar fecha final a fecha inicial si se selecciona fecha inicial
    if (xFecIni && !xFecFin) {
      this.dateTimeRegisterForm.controls['fecreaRealFin'].setValue(xFecIni);
      // Actualizamos la variable fechaFinal para las validaciones posteriores
      fechaFinal = new Date(xFecIni);
    }

    if (fechaInicio) {
      fechaInicio.setDate(fechaInicio.getDate() + 1);

      // Verificar si la fecha inicial es menor a la fecha actual
      if (fechaInicio < currentDate) {
        Swal.fire({
          title: "Algo anda mal!",
          text: "La fecha inicial no puede ser menor a la fecha actual. Se ajustará a la fecha actual.",
          icon: "warning"
        });
        // Establecer el valor de fecreaRealIni a la fecha actual
        const currentDateStr = currentDate.toISOString().split('T')[0];
        this.dateTimeRegisterForm.controls['fecreaRealIni'].setValue(currentDateStr);
        // Actualizar fechaInicio para validaciones posteriores
        fechaInicio = new Date(currentDateStr);
        fechaInicio.setDate(fechaInicio.getDate() + 1);

        // Como cambiamos la fecha inicial, también debemos actualizar la final si eran iguales
        if (xFecIni === xFecFin) {
          this.dateTimeRegisterForm.controls['fecreaRealFin'].setValue(currentDateStr);
          fechaFinal = new Date(currentDateStr);
        }
      }
    }

    if (fechaFinal) {
      fechaFinal.setDate(fechaFinal.getDate() + 1);

      // Verificar si la fecha final es menor a la fecha actual
      if (fechaFinal < currentDate) {
        Swal.fire({
          title: "Algo anda mal!",
          text: "La fecha final no puede ser menor a la fecha actual. Se ajustará a la fecha actual.",
          icon: "warning"
        });
        // Establecer el valor de fecreaRealFin a la fecha actual
        const currentDateStr = currentDate.toISOString().split('T')[0];
        this.dateTimeRegisterForm.controls['fecreaRealFin'].setValue(currentDateStr);
        // Actualizar fechaFinal para validaciones posteriores
        fechaFinal = new Date(currentDateStr);
        fechaFinal.setDate(fechaFinal.getDate() + 1);
      }
    }

    // Validación adicional: asegurar que fecha final no sea anterior a fecha inicial
    if (fechaInicio && fechaFinal && fechaFinal < fechaInicio) {
      Swal.fire({
        title: "Algo anda mal!",
        text: "La fecha final no puede ser anterior a la fecha inicial. Se ajustará a la fecha inicial.",
        icon: "warning"
      });
      this.dateTimeRegisterForm.controls['fecreaRealFin'].setValue(
        this.dateTimeRegisterForm.controls['fecreaRealIni'].value
      );
    }
  }
  inicializarHora() {
    // Definir los límites de las horas laborales
    let horaInicioLaboral: any = new Date();
    let horaFinLaboral: any = new Date();

    // Establecer 8AM y 5PM
    horaInicioLaboral.setHours(8, 30, 0); // 8:30 AM
    // horaInicioLaboral.setHours(horaInicioLaboral.getHours() + 1); // Sumar una hora

    horaFinLaboral.setHours(17, 0, 0); // 5:00 PM
    // horaFinLaboral.setHours(horaFinLaboral.getHours() + 1); // Sumar una hora

    this.dateTimeRegisterForm.controls['horaInicialReal'].setValue(horaInicioLaboral.toTimeString().slice(0, 5));
    this.dateTimeRegisterForm.controls['horaFinalReal'].setValue(horaFinLaboral.toTimeString().slice(0, 5));
  }

  validateHora() {
    let xHoraIni: any = this.dateTimeRegisterForm.controls['horaInicialReal'].value;
    let xHoraFin: any = this.dateTimeRegisterForm.controls['horaFinalReal'].value;


    // Definir los límites de las horas laborales
    let horaInicioLaboral: any = new Date();
    let horaFinLaboral: any = new Date();

    // Establecer 8AM y 5PM
    horaInicioLaboral.setHours(8, 0, 0); // 8:00 AM
    // horaInicioLaboral.setHours(horaInicioLaboral.getHours() + 1); // Sumar una hora

    horaFinLaboral.setHours(17, 0, 0); // 5:00 PM
    // horaFinLaboral.setHours(horaFinLaboral.getHours() + 1); // Sumar una hora

    // Convertir xHoraIni y xHoraFin a objetos Date para comparar
    let horaInicial: any = new Date(`1970-01-01T${xHoraIni}:00`);
    let horaFinal: any = new Date(`1970-01-01T${xHoraFin}:00`);

    // Verificar si la hora inicial es menor a las 8AM
    if (horaInicial >= horaInicioLaboral || horaInicial <= horaFinLaboral) {

      // // console.warn(horaInicial)
      // // console.warn(horaInicioLaboral)
      // // console.warn(horaFinLaboral)

      Swal.fire({
        title: "Algo anda mal!",
        text: "La hora inicial no puede ser menor a las 8AM. Se ajustará a las 8AM.",
        icon: "warning"
      });
      // Establecer el valor de horaInicialReal a las 8AM
      this.dateTimeRegisterForm.controls['horaInicialReal'].setValue(horaInicioLaboral.toTimeString().slice(0, 5));
    }

    // Verificar si la hora inicial es mayor a las 5PM
    if (horaInicial > horaFinLaboral) {
      Swal.fire({
        title: "Algo anda mal!",
        text: "La hora inicial no puede ser mayor a las 5PM. Se ajustará a las 5PM.",
        icon: "warning"
      });
      // Establecer el valor de horaInicialReal a las 5PM
      this.dateTimeRegisterForm.controls['horaInicialReal'].setValue(horaFinLaboral.toTimeString().slice(0, 5));
    }

    // Verificar si la hora final es menor a las 8AM
    if (horaFinal < horaInicioLaboral) {
      Swal.fire({
        title: "Algo anda mal!",
        text: "La hora final no puede ser menor a las 8AM. Se ajustará a las 8AM.",
        icon: "warning"
      });
      // Establecer el valor de horaFinalReal a las 8AM
      this.dateTimeRegisterForm.controls['horaFinalReal'].setValue(horaInicioLaboral.toTimeString().slice(0, 5));
    }

    // Verificar si la hora final es mayor a las 5PM
    if (horaFinal > horaFinLaboral) {
      Swal.fire({
        title: "Algo anda mal!",
        text: "La hora final no puede ser mayor a las 5PM. Se ajustará a las 5PM.",
        icon: "warning"
      });
      // Establecer el valor de horaFinalReal a las 5PM
      this.dateTimeRegisterForm.controls['horaFinalReal'].setValue(horaFinLaboral.toTimeString().slice(0, 5));
    }
  }

  actualizarFechaReal() {
    // Validaciones básicas
    if (!this.dateTimeRegisterForm.controls['fecreaRealIni'].value) {
      Toast.fire({ icon: "warning", title: "Debes escoger una fecha real inicial" });
      return;
    }
    if (!this.dateTimeRegisterForm.controls['fecreaRealFin'].value) {
      Toast.fire({ icon: "warning", title: "Debes escoger una fecha real final" });
      return;
    }
    if (!this.dateTimeRegisterForm.controls['horaInicialReal'].value) {
      Toast.fire({ icon: "warning", title: "Debes escoger una hora real inicial" });
      return;
    }
    if (!this.dateTimeRegisterForm.controls['horaFinalReal'].value) {
      Toast.fire({ icon: "warning", title: "Debes escoger una hora real final" });
      return;
    }
    const xuser: any = sessionStorage.getItem('codcli');
    const xccia: any = sessionStorage.getItem('ccia');
    // Preparar el modelo
    let model = {
      idTicket: this.requerimiento.idTicket,
      idAgencia: this.requerimiento.idAgencia,
      url: this.requerimiento.url,
      estado: this.requerimiento.estado,
      codprov: this.requerimiento.codprov,
      ciudad: this.requerimiento.ciudad,
      fecrea: this.requerimiento.fecrea,
      fechainiPlanif: this.requerimiento.fechainiPlanif,
      fechafinPlanif: this.requerimiento.fechafinPlanif,
      area: this.requerimiento.area,
      motivoTrabajo: this.requerimiento.motivoTrabajo,
      espacioSirve: this.requerimiento.espacioSirve,
      descripcionProblema: this.requerimiento.descripcionProblema,
      nserieEquipo: this.requerimiento.nserieEquipo,
      beneficiario: this.requerimiento.beneficiario,
      telefono: this.requerimiento.telefono,
      email: this.requerimiento.email,
      fecreaRealIni: this.dateTimeRegisterForm.controls['fecreaRealIni'].value,
      fecreaRealFin: this.dateTimeRegisterForm.controls['fecreaRealFin'].value,
      codTipoEquipo: this.requerimiento.codTipoEquipo,
      codMarca: this.requerimiento.codMarca,
      codModelo: this.requerimiento.codModelo,
      tipo: this.requerimiento.tipo,
      horaInicialReal: this.dateTimeRegisterForm.controls['horaInicialReal'].value,
      horaFinalReal: this.dateTimeRegisterForm.controls['horaFinalReal'].value,
      horaInicialPlanificada: this.requerimiento.horaInicialPlanificada,
      horaFinalPlanificada: this.requerimiento.horaFinalPlanificada,
      usercrea: this.requerimiento.usercrea,
      valor: this.requerimiento.valor,
      observacion: this.dateTimeRegisterForm.controls['observacion'].value,
      ccia: xccia,
      codUserAtencionTicket: xuser
    }

    console.log('Modelo a enviar:', model);

    this._show_spinner = true;
    this.fecReal.actualizarFechaReal(this.requerimiento.idTicket, 2, model,).subscribe({
      next: (x) => {
        Toast.fire({ icon: "success", title: "Fecha actualizada correctamente" });
        // console.log('Respuesta:', x);
      },
      error: (e) => {
        this._show_spinner = false;
        console.error('Error:', e);
        Toast.fire({ icon: "error", title: "Error al actualizar la fecha" });
      },
      complete: () => {
        this._show_spinner = false;
        this.showFormFechaReal.emit(true);
        this.emitTecnicosMantenimiento.emit(this.listaTecnicosRecibidos);
        this.obtenerReportecnicoCorrectivo(this.requerimiento.idTicket);

        this.guardarProcedimientos();

      }
    });
  }

  fileUrl: any;
  obtenerReportecnicoCorrectivo(id: any) {
    let pathFile: string = 'C:/Users/Administrador/Desktop/NODE-SMTP/src/wwwroot/reptec/';
    // alert('local path asignada: ' + pathFile)
    this.nodeServer.getReporteTecnicoCorrectivo(id, 'CM').subscribe({
      next: (x: any) => {
        this.fileUrl = x.url_file;

        // alert(this.fileUrl)

      }, error: (e) => {
        console.error('Error al generar el reporte técnico correctivo:', e);
      }, complete: () => {
        // Obtener el nombre del archivo desde la URL
        const nombreArchivo = this.fileUrl.split('/').pop();
        // Concatenar con pathFile
        const rutaCompleta = pathFile + nombreArchivo;
        console.log('Ruta completa del archivo:', rutaCompleta);
        // ENVIO DE EMAIL
        this.sendMail(
          [rutaCompleta],
          this.tecnicosEmail,
          this.reporteTecnicoSettingsEmail.fromAddress,
          this.reporteTecnicoSettingsEmail.replyTo,
          this.reporteTecnicoSettingsEmail.body,
          this.reporteTecnicoSettingsEmail.subject
        )
      }
    })
  }

  // Función auxiliar para formatear fecha a ISO string
  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString();
  }

  // Función auxiliar para convertir tiempo HH:mm:ss a ticks
  private timeToTicks(timeStr: string): { ticks: number } {
    if (!timeStr) return { ticks: 0 };

    // Asegurar formato HH:mm:ss
    const timeParts = timeStr.split(':');
    if (timeParts.length < 3) timeStr += ':00';

    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    const ticks = totalSeconds * 10000000; // 1 segundo = 10,000,000 ticks

    return { ticks };
  }


  tecnicosEmail: any = [];
  openDataTecnicosDialog() {

    this.modelDataRequer = {
      idTicket: this.requerimiento.idTicket,
      idAgencia: this.requerimiento.idAgencia,
      horaInicialReal: this.dateTimeRegisterForm.controls['horaInicialReal'].value,
      horaFinalReal: this.dateTimeRegisterForm.controls['horaFinalReal'].value,
      fecreaRealIni: this.dateTimeRegisterForm.controls['fecreaRealIni'].value,
      codMarca: this.requerimiento.codMarca,
      fecreaRealFin: this.dateTimeRegisterForm.controls['fecreaRealFin'].value,
      codfrecuencia: this.requerimiento.codfrecuencia
    }

    const dialogRef = this.dialog.open(ModalTecnicosComponent, {
      height: '80vh',
      width: '80%',
      data: this.modelDataRequer
    });

    this.tecnicosEmail = [];
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.listaTecnicosRecibidos = [result];

        // console.table('this.listaTecnicosRecibidos RECIBIDOS DESDE EL MODAL');
        // console.table(this.listaTecnicosRecibidos);

        this.listaTecnicosRecibidos.filter((x: any) => {
          // console.warn(x);
          // console.warn(x.email);
          this.tecnicosEmail.push(x.email);
        })
        console.warn(this.tecnicosEmail);
      }
    });

  }

  deleteTecnicoAsign(tecnicos: any, index: number) {

    this.listaTecnicosRecibidos.splice(index, 1);
    // this.mantServ.eliminarTecnicoProcess( this.requerimiento.idTicket, tecnicos.coduser ).subscribe({
    //   next:(x) => {
    //     Toast.fire({
    //       icon: "success",
    //       title: "Eliminado correctamente."
    //     });
    //   }, error: (e) => console.error(e)
    // })

  }

  obtenerEmailCliSetts(idConfig: number) {
    this.eSet.obtenerEmailCliSetts(idConfig).subscribe({
      next: (x) => {
        this.listConfmail = x;
      },
      error: (err) => {
        console.error('Error al obtener configuración de email:', err);
      }, complete: () => {

        this.listConfmail.forEach((element: any) => {

          if (element.codecProcess == '007') {

            this.reporteTecnicoSettingsEmail = element;

          }


        });

      }
    });
  }

  // Envio de correo electronico
  sendMail(filePathServer: any, recipients: any, fromAddress: any, replyTo: any, contentHtml: any, subject: any) {

    let toRecipients = recipients.toString().split(',').map((email: string) => (
      {
        email: email.trim(),
        name: '---'
      }
    ));
    let headerColor = '#9C27B0';
    let headerText = 'REPORTE TÉCNICO ASIGNADO';
    let icon = '🔐';

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
              <p>
                <strong>
                  Ticket: 
                 </strong>
                ${this.requerimiento.idRequerimientoPad}
              </p>
              <p>
                <strong>
                  Cliente:
                </strong>
                ${this.requerimiento.nombreCliente}
              </p>
              <p>
                <strong>
                  Agencia:
                </strong>
                ${this.requerimiento.nombreAgencia}
              </p>
            </div>            
            <div class="email-content">
              ${contentHtml}
            </div>
          </div>
          
          <div class="email-footer">
            <h3 style="color: blue;" > <strong> CASHMACHINE SERVICES. </strong> </h3>
            <br>
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

    console.log('ESTO SE ESTA ENVIANDO A BREVO');
    console.log(brevoMail)

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
    // <img src="${this.env.logoCMS64bits}" alt="Cash Machine Systems" class="logo">
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

  //#region [GUARDAR PROCEDIMIENTOS DE MANTENIMIENTO Y ASIGNACION DE TECNICO]

  modelCrono: any = {};
  guardarProcedimientos() {
    let xuser: any = sessionStorage.getItem('codcli');

    // Primero eliminamos técnicos repetidos (basado en algún campo único como coduser)
    const tecnicosUnicos = this.eliminarTecnicosRepetidos(this.listaTecnicosRecibidos);

    if (tecnicosUnicos.length > 0) {
      tecnicosUnicos.filter((x: any) => {
        let aniox = new Date().getFullYear();
        let mesx = new Date().getMonth();
        let codigoCrono = 'CRONO-' + this.mantServ.generateRandomString(15) + '-' + mesx.toString() + aniox.toString();
        let fechaRealIni = this.requerimiento.fecreaRealIni;
        let dateRequerReal = new Date(fechaRealIni);
        let diaReal       = dateRequerReal.getDate();
        let mesReal       = dateRequerReal.getMonth();
        let anioReal      = dateRequerReal.getFullYear();
        let nombreTecnic  = x.nombre + ' ' + x.apellido;
        x.ImagenTecnico   = x.imagenPerfil;
        x.NombreTecnico   = x.nombre;
        x.ApellidoTecnico = x.apellido;

        // Convertir fecha a objeto Date
        let fechaMantenimientoStr = diaReal + '-' + (mesReal + 1) + '-' + anioReal;
        let [dia, mes, anio] = fechaMantenimientoStr.split('-').map(Number);
        let fechaMantenimiento = new Date(anio, mes - 1, dia);

        this.modelCrono = {
        
          "codcrono":           codigoCrono,
          "codusertecnic":      x.coduser,
          "codagencia":         this.requerimiento.idAgencia,
          "observacion":        '',
          "feccrea":            new Date(),
          "codusercreacrono":   xuser,
          "semanainicio":       0,
          "dia":                dia,
          "mes":                mes,
          "anio":               anio,
          "fechamantenimiento": fechaMantenimiento,
          "maquinasmanuales":   1,
          "Codlocalidad":       x.idlocalidad,
          "Estado":             0,
          "idRequer":           this.requerimiento.idTicket
        
        }

        x.IdTicket = this.requerimiento.idTicket;
        this._show_spinner = true;

        this.guardarCrono(this.modelCrono, nombreTecnic)
        this.guardarMantenimiento(
          codigoCrono,
          x.coduser,
          this.requerimiento.horaInicialReal,
          this.requerimiento.horaFinalReal,
          this.requerimiento.codmaquina,
          this.requerimiento.fecreaRealIni,
          this.requerimiento.fecreaRealFin
        );

        this.guardarAsignacionTecnicoTicket(x, this.requerimiento.horaInicialReal, this.requerimiento.horaFinalReal, this.requerimiento.fecreaRealIni, this.requerimiento.fecreaRealFin);
        this.mantServ.guardarCronoInteligente(this.requerimiento.codfrecuencia, codigoCrono).subscribe({
          next: (x) => {
            this._show_spinner = false;
          },
          error: (e) => {
            this._show_spinner = false;
            console.error(e);
          }
        })
      });
    }
  }

  // Función para eliminar técnicos repetidos
  eliminarTecnicosRepetidos(tecnicos: any[]): any[] {
    // Usamos un objeto para almacenar técnicos únicos (usando coduser como clave)
    const tecnicosUnicos: { [key: string]: any } = {};

    tecnicos.forEach(tecnico => {
      if (!tecnicosUnicos[tecnico.coduser]) {
        tecnicosUnicos[tecnico.coduser] = tecnico;
      }
    });

    // Convertimos el objeto de vuelta a array
    return Object.values(tecnicosUnicos);
  }

  guardarCrono(modelCrono: any, tecnico: string) {
    this._show_spinner = true;
    this.mantServ.guardarCronos(modelCrono).subscribe({
      next: (x) => {
        this._show_spinner = false;
        Toast.fire({
          icon: 'success',
          title: 'Trabajo asignado al técnico: ' + tecnico + '.',
          text: 'Esperando la confirmación del trabajo para cambiar de estado.',
          timer: 2500
        });
      }, error: (e) => {
        this._show_spinner = false;
        Toast.fire({
          icon: 'error',
          title: 'No se ha podido agregar este trabajo al ' + tecnico + '.'
        });
      }, complete: () => {
        // this.obtenerCrono(modelCrono.mes, 'void', 3)
        // this.actualizarEstadoAgencia(2, this.modelCrono.codagencia);
        this._show_spinner = false;
      }
    })
  }

  modelMantenimiento: any = [];
  modelSendAsignacionTecnicoTicket: any = [];
  guardarAsignacionTecnicoTicket(data: any, horaIni: any, horafin: any, fechaIni: any, fechaFin: any) {

    this.modelSendAsignacionTecnicoTicket = {
      idRequerimiento: this.requerimiento.idTicket,
      resTecnico: '',
      urlA: '',
      urlB: '',
      codTenicUser: data.coduser,
      fechacrea: new Date(),
      fechares: new Date(),
      horaIni: horaIni,
      horafin: horafin,
      fechaIni: fechaIni,
      fechaFin: fechaFin
    }

    this.mantServ.guardarAsignacionTecnicoTicket(
      this.modelSendAsignacionTecnicoTicket,
      data
    ).subscribe({
      next: (response) => {
        // console.log('Asignación completada', response);
        // Puedes acceder a response.tecnico si necesitas los datos del técnico
      },
      error: (e) => console.error('Error en asignación', e)
    });
  }

  guardarMantenimiento(codCrono: any, codusertecnic: any, hi: any, hf: any, codprod: any, feciniciomante: any, fecfinmant: any) {

    let xuser: any = sessionStorage.getItem('codcli');
    this.modelMantenimiento = {
      codcrono: codCrono,
      codtecnico: codusertecnic,
      feciniciomante: feciniciomante,
      fecfinmant: fecfinmant,
      feccrea: new Date(),
      horainit: hi,
      horafin: hf,
      usercrea: xuser,
      codprod: codprod,
      estado: 1,
      idRequer: this.requerimiento.idTicket
    }

    this.mantServ.guardarMantenimiento(this.modelMantenimiento).subscribe({
      next: (x) => {
        Toast.fire({
          icon: 'success',
          title: 'Asignación ha sido completada'
        })
        // // console.log(x);
      }, error: (e) => {
        // console.log(e);
        Toast.fire({
          icon: 'error',
          title: 'No se ha podido completar la asignación'
        })
      }, complete: () => { }
    })

  }
  //#endregion

}
