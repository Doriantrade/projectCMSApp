import { Component, OnInit, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RepuestosAsignadosComponent } from '../repuestos-asignados.component';
import { FormControl, FormGroup, Validators } from '@angular/forms'; // Añadido Validators
import { MantenimientoService } from '../../tabla-help-desk/mantenimiento/services/mantenimiento.service';
import { CotizacionService } from '../modal-cotizacion/modal-cotizacion/services/cotizacion.service';

import Swal from 'sweetalert2';
import { EmailSettingsServiceX } from 'src/app/components/shared/configuraciones/services/email-settings.service';
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
});

@Component({
  selector: 'app-modal-down-cotizacion',
  templateUrl: './modal-down-cotizacion.component.html',
  styleUrls: ['./modal-down-cotizacion.component.scss']
})
export class ModalDownCotizacionComponent implements OnInit {
 
  modelSend:                   any    = [];
  idRequer:                    number = 0;
  idResManten:                 number = 0;
  listConfmail:                any    = [];
  reporteSettingsEmail: any    = [];
  nombreCliente: string = '';
  idRequerimientoPad: string = '';
  nombreAgencia: string = '';
  correomantenimiento: string = '';
  @Output() delResMant: any;

  constructor(
    private eSet: EmailSettingsServiceX,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<RepuestosAsignadosComponent>,
    private rep: MantenimientoService,
    private cotServ: CotizacionService
  ) { }
  
  public modalForm = new FormGroup({
    observacion: new FormControl('', [Validators.required, Validators.minLength(5)])
  });

  ngOnInit(): void {
    console.log('Data recibida en ModalDownCotizacionComponent:');
    console.log(this.data);
    this.idRequer = this.data[0].idRequer;
    this.idResManten = this.data[0].idResManten;
    this.nombreCliente = this.data[0].nombreCliente;
    this.nombreAgencia = this.data[0].nombreAgencia;
    this.correomantenimiento = this.data[0].correomantenimiento;

    this.idRequerimientoPad = '#' + this.idRequer.toString().padStart(6, '0');

    this.obtenerEmailCliSetts( 1 );

  }

  darDeBajaItems() {
    
    if (this.modalForm.invalid) {
      Toast.fire({
        icon: 'error',
        title: 'Debe ingresar una observación válida (mínimo 5 caracteres)'
      });
      return;
    }



    this.data.forEach((item: any) => {
      this.rep.ActualizarStockRepuestosDarDeBaja(item.codRep, item.cantidad).subscribe({
        next: (x) => {
          item.icon = 'done';
        },
        error: (e) => {
          console.error(e);
        },
        complete: () => { }
      });
    });
  }


    obtenerEmailCliSetts( idConfig: number ) {
      this.eSet.obtenerEmailCliSetts( idConfig ).subscribe({
        next: (x) => {
          this.listConfmail = x;
        },
        error: (err) => { 
          console.error('Error al obtener configuración de email:', err);
        }, complete: () => {
          this.listConfmail.forEach((element: any) => {
            if ( element.codecProcess == '005' ) {
              this.reporteSettingsEmail = element;
            }
          });

          console.warn('Configuración de email para reporte de baja de cotización:');
          console.warn(this.reporteSettingsEmail);

        }
      });
    }

    // Envio de correo electronico
    sendMail(filePathServer: any, recipients: any, fromAddress: any, replyTo: any, contentHtml: any, subject: any) {  
    
      let toRecipients = recipients.toString().split(',').map( (email: string) => (
        {
          email: email.trim(),
          name: '---'
        }
      ));
      let headerColor = '#ea3f1dff';
      let headerText = 'COTIZACIÓN DADA DE BAJA';
      let icon = '📉';
    
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
                  ${this.idRequerimientoPad}
                </p>
                <p>
                  <strong>
                    Cliente:
                  </strong>
                  ${this.nombreCliente}
                </p>
                <p>
                  <strong>
                    Agencia:
                  </strong>
                  ${this.nombreAgencia}
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
        subject: `${headerText}: ${this.idRequerimientoPad} - ${this.nombreCliente}`,
        htmlContent: htmlContent,
        sender: {
          email: "notificaciones@cashmachserv.com",
          name: "Sistema de Notificaciones CMS"
        },
        replyTo: {
          email: replyTo || fromAddress || "notificaciones@cashmachserv.com"
        },
        params: {
          nombreCliente: this.nombreCliente,
          agencia: this.nombreAgencia
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
    
  


  // this.guardarAuditoriaCotizacionDeBaja(this.idRequer);
  guardarAuditoriaCotizacionDeBaja() {

    const xuser: any = sessionStorage.getItem('codcli');
    this.modelSend = {
      nombre:      '---',
      idRequer:    this.idRequer,
      usercrea:    xuser,
      observacion: this.modalForm.controls['observacion'].value
    };

    this.rep.GuardarAuditoriaCotizacionDeBaja(this.modelSend).subscribe({
      next: (x) => {
        Swal.fire({
          title: "Cotización dada de baja",
          text: "Proceso de cotización de repuestos se ha dado de baja, los items regresaron al stock",
          icon: "success"
        });
        this.closeDialog({ idRequer: this.idRequer, idResManten: this.idResManten });
      },
      error: (e) => {
        if ( e.status == 200 ) this.closeDialog({ idRequer: this.idRequer, idResManten: this.idResManten });
        else {
          Swal.fire({
            title: "Error",
            text: "Ocurrió un error al guardar la auditoría",
            icon: "error"
          });
          console.error(e);
          this.closeDialog({ idRequer: this.idRequer, idResManten: this.idResManten });
        }
      }
    });
  }
  
 
  eliminarCabCotiza() {
    
    // Asumiendo que 'this.cotServ.eliminarCotizacion' llama a la API DELETE
    // con el idRequer (que es el IdRepoTec)
    this.cotServ.eliminarCotizacion( this.idRequer, this.idResManten ).subscribe({
        next: (x) => {
            // Este bloque se ejecuta ÚNICAMENTE si el servidor devuelve 200 OK.
            // Esto significa: La cotización estaba en Estado=1, se eliminó el resumen/repuestos, y CabCotiza pasó a Estado=0.

            // 1. Ejecutar las acciones dependientes (Auditoría y devolución de ítems)
            this.guardarAuditoriaCotizacionDeBaja();
            this.darDeBajaItems();
            this.sendMail(
                  [],
                  this.correomantenimiento,
                  this.reporteSettingsEmail.fromAddress,
                  this.reporteSettingsEmail.replyTo,
                  'Cotización número ' + this.idRequerimientoPad + ' ' + this.reporteSettingsEmail.body + ' en la fecha ' + 
                  new Date().toLocaleDateString() + '.<br><br>Observación: ' + this.modalForm.controls['observacion'].value,
                  this.reporteSettingsEmail.subject
                )
            // NOTA: El Swal.fire de éxito se mostrará dentro de 'guardarAuditoriaCotizacionDeBaja()'
        }, 
        error: (e) => {
            // Este bloque maneja TODOS los errores (409 Conflict, 404 Not Found, 500 Internal Server Error, etc.)

            let title: string = "Error en la operación";
            let text: string = "Ocurrió un error inesperado al intentar dar de baja la cotización.";
            let icon: any = "error";
            
            // ----------------------------------------------------
            // Manejo del error 409 (Conflicto de Estado)
            // ----------------------------------------------------
            if (e.status === 409) {
              // El servidor nos dijo que ya estaba en Estado = 0
              title = "Atención: Ya fue dada de baja";
              // Usamos el mensaje del backend si está disponible, si no, uno genérico.
              text = e.error?.detail || e.error || "Esta cotización ya se encuentra en estado de baja (Estado = 0)."; 
              icon = "warning"; // Usamos 'warning' para diferenciarlo de un error de sistema.
              
            } else if (e.status === 404) {
                 // Manejo del error 404 (No Encontrado)
                 title = "Cotización no encontrada";
                 text = e.error?.detail || e.error || "No se pudo encontrar la cotización con el ID proporcionado.";
                 icon = "error";

            } else if ( e.status === 200 ) {
                this.guardarAuditoriaCotizacionDeBaja();
                this.darDeBajaItems();
                title = "";                
                text = "Se ha dado de baja la cotización.";
                icon = "success";
                this.sendMail(
                  [],
                  this.correomantenimiento,
                  this.reporteSettingsEmail.fromAddress,
                  this.reporteSettingsEmail.replyTo,
                  'Cotización número ' + this.idRequerimientoPad + ' ' + this.reporteSettingsEmail.body + ' en la fecha ' + 
                  new Date().toLocaleDateString() + '.<br><br>Observación: ' + this.modalForm.controls['observacion'].value,
                  this.reporteSettingsEmail.subject
                )
                return; // Salimos para evitar mostrar otro Swal.fire
            }            
            else {
                // Manejo de otros errores (ej: 500 Internal Server Error)
                console.error("Error al dar de baja la cotización:", e);
                // Mantenemos los valores de 'title' e 'icon' definidos al inicio.
            }
            
            // Mostrar el SweetAlert con el resultado del error/conflicto
            Swal.fire({
                title: title,
                text: text,
                icon: icon
            });

            // Cerrar el modal o componente, ya que el proceso de "eliminación" ha terminado
            // (falle o se encuentre ya dado de baja).
            this.closeDialog({ idRequer: this.idRequer, idResManten: this.idResManten });
        }, 
        complete: () => {
            // Se recomienda dejar 'complete' vacío. La lógica de auditoría/devolución de ítems 
            // solo debe ir en 'next' para garantizar que se ejecute solo al terminar con éxito.
        }
    });
}
  
  get f() {
    return this.modalForm.controls;
  }

  closeDialog( type:any ) {
    this.dialogRef.close( type );
  }

}