import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NavsideComponent } from '../navside/navside.component';
import { MasterTableService } from '../master-table/master-table.service';
import { EmailSettingsServiceX } from './services/email-settings.service';
import { FormControl, FormGroup } from '@angular/forms';

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
  selector: 'app-configuraciones',
  templateUrl: './configuraciones.component.html',
  styleUrls: ['./configuraciones.component.scss']
})
export class ConfiguracionesComponent implements OnInit {
  receipts: any;
  modelSendEmailCliSetts: any = [];
  emailChips: string[] = [];
  listItemProcess: any = [];
  listaEmailSettings: any = [];
  usercrea: any;
  codConfig: any = '000';
  show_action_panel: boolean = false;
  listItemProcessSendByEmail: any = [];
  btn_action: string = 'Guardar';
  btn_ico: string = 'save';
  show_form_setts: boolean = false;
  idSettsEmailCLi: number = 0;
  listEmailCLiSetts: any = [];
  listEmailCLiSettsGhost: any = [];

  //visualizaciones
  dociess_show:         boolean = true;
  encargadoBodega_show: boolean = false;
  procesosMailing_show: boolean = false;

  public exportdataform = new FormGroup({
    filter:              new FormControl('')
  })


  /**
  * Función para mostrar solo el panel seleccionado y ocultar los demás.
  * @param panelName El nombre del panel a mostrar ('dociess', 'bodega', 'mailing').
  */
  public showPanel(panelName: 'dociess' | 'bodega' | 'mailing'): void {
    // Primero, ocultamos todos
    this.dociess_show = false;
    this.encargadoBodega_show = false;
    this.procesosMailing_show = false;

    // Luego, mostramos solo el seleccionado
    switch (panelName) {
      case 'dociess':
        this.dociess_show = true;
        break;
      case 'bodega':
        this.encargadoBodega_show = true;
        break;
      case 'mailing':
        this.procesosMailing_show = true;
        break;
      default:
        // Opcional: define un comportamiento por defecto
        this.dociess_show = true; 
        break;
    }
  }

  constructor(
    public dialog: MatDialog, 
    @Inject(MAT_DIALOG_DATA) public data: any, 
    public dialogRef: MatDialogRef<NavsideComponent>,
    private dataMaster: MasterTableService,
    private eSet:  EmailSettingsServiceX
  ) { }

  EmailSettsRegisterForm = new FormGroup ({
      profileName:     new FormControl(),
      recipients:      new FormControl(),
      body:            new FormControl(),
      subject:         new FormControl(),
      fromAddress:     new FormControl(),
      replyTo:         new FormControl(),
      usercrea:        new FormControl(),
      codcli:          new FormControl(),
      idconfig:        new FormControl(),
      codecProcess:    new FormControl()
  })

  ngOnInit(): void {
    this.usercrea = sessionStorage.getItem('codcli');
    this.obtenerDataItemsProcess();
    this.getCodecEmailSendByProcess();
    this.obtenerEmailCliSetts(1);
  }

  // Modifica el método para manejar el input de destinatarios
  onRecipientsInput(event: any) {
    const value = event.target.value;
    
    // Si se presiona coma (,) y hay texto
    if (value.includes(',') && value.trim().replace(',', '').length > 0) {
      
      const emails = value.split(',')
        .map((e: string) => e.trim())
        .filter((e: string) => e.length > 0);
      
      // Agregar solo el nuevo email (evitamos duplicados)
      const newEmail = emails[emails.length - 1];
      if (this.isValidEmail(newEmail) && !this.emailChips.includes(newEmail)) this.emailChips.push(newEmail);
      
      // Actualizar el control del formulario
      this.EmailSettsRegisterForm.get('recipients')?.setValue(this.emailChips.join(', '));
      event.target.value = '';

    }
  }

  // Método para validar email (simple)
  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Método para remover un chip
  removeChip(index: number) {
    this.emailChips.splice(index, 1);
    // this.EmailSettsRegisterForm.get('recipients')?.setValue(this.emailChips.join(', '));
  }

  onSubmit() {
    switch( this.btn_action ) {
      case 'Guardar':
        this.guardarEmailCliSetts();
        break;
      case 'Actualizar':
        this.actualizarEmailCliSetts();
        break;
    }
  }

  guardarEmailCliSetts() {
    // this.codConfig.toString().trim()
    this.modelSendEmailCliSetts = {
      "profileName":  this.EmailSettsRegisterForm.controls['profileName'].value,
      "recipients":   this.EmailSettsRegisterForm.controls['recipients'].value,
      "body":         this.EmailSettsRegisterForm.controls['body'].value,
      "subject":      this.EmailSettsRegisterForm.controls['subject'].value,
      "fromAddress":  this.EmailSettsRegisterForm.controls['fromAddress'].value,
      "replyTo":      this.EmailSettsRegisterForm.controls['replyTo'].value,
      "usercrea":     this.usercrea,
      "codcli":       this.data,
      "idconfig":     1,
      "codecProcess": this.EmailSettsRegisterForm.controls['codecProcess'].value
    }

    // console.warn(this.modelSendEmailCliSetts);

    this.eSet.guardarSettingsEmailCli( this.modelSendEmailCliSetts ).subscribe({
      next: (x) => {
        // console.warn(x);
        Swal.fire ({
          icon:'success',
          title: 'Guardado!',
          text:'Configuración guardada exitosamente'
        })
      }, error: (e) => {
        console.error(e);
        Swal.fire ({
          icon:'error',
          title: 'Oops!',
          text:'Algo ha pasado'
        })
      }, complete: () => {
        this.obtenerEmailCliSetts(1);
        this.limpiar();
      }
    })
  }

  actualizarEmailCliSetts() {

    const xdate= new Date();
    this.modelSendEmailCliSetts = {
      "id":           this.idSettsEmailCLi,
      "profileName":  this.EmailSettsRegisterForm.controls['profileName'].value,
      "recipients":   this.emailChips.toString(),
      "body":         this.EmailSettsRegisterForm.controls['body'].value,
      "subject":      this.EmailSettsRegisterForm.controls['subject'].value,
      "fromAddress":  this.EmailSettsRegisterForm.controls['fromAddress'].value,
      "replyTo":      this.EmailSettsRegisterForm.controls['replyTo'].value,
      "usercrea":     this.usercrea,
      "codcli":       this.data,
      "idconfig":     1,
      "fecrea":       xdate,
      "codecProcess": this.EmailSettsRegisterForm.controls['codecProcess'].value
    }

    // console.warn(this.modelSendEmailCliSetts);
    this.eSet.actualizarSettingsEmailCli( this.modelSendEmailCliSetts, this.idSettsEmailCLi ).subscribe({
      next: (x) => {
        Swal.fire ({
          icon:'success',
          title: 'Actualizado!',
          text:'Configuración actualizada exitosamente'
        })
      }, error: (e) => {
        console.error(e);
        Swal.fire ({
          icon:'error',
          title: 'Oops!',
          text:'Algo ha pasado en la actualización'
        })
      }, complete: () => {
        this.obtenerEmailCliSetts(1);
        this.limpiar();
      }
      
    })

  }

  limpiar() {
    this.EmailSettsRegisterForm.controls['profileName'].setValue('');
    this.EmailSettsRegisterForm.controls['recipients'].setValue('');
    this.EmailSettsRegisterForm.controls['body'].setValue('');
    this.EmailSettsRegisterForm.controls['subject'].setValue('');
    this.EmailSettsRegisterForm.controls['fromAddress'].setValue('');
    this.EmailSettsRegisterForm.controls['replyTo'].setValue('');
    this.btn_action = 'Guardar';
    this.btn_ico = 'save';
    this.show_form_setts = false;
  }

  catchData(data: any) {
    // console.warn(data);
    this.idSettsEmailCLi = data.id;
    this.EmailSettsRegisterForm.controls['codecProcess'].setValue(data.codecProcess.trim());
    this.EmailSettsRegisterForm.controls['profileName'].setValue(data.profileName);
    this.EmailSettsRegisterForm.controls['body'].setValue(data.body);
    this.EmailSettsRegisterForm.controls['subject'].setValue(data.subject);
    this.EmailSettsRegisterForm.controls['fromAddress'].setValue(data.fromAddress);
    this.EmailSettsRegisterForm.controls['replyTo'].setValue(data.replyTo);
    this.receipts = data.recipients;
    // 1. Limpiar chips existentes
    this.emailChips = [];
  
    // 2. Procesar los recipients (string separado por comas)
    const recipients = data.recipients || '';
    if (recipients) {
      const emails = recipients.split(',')
        .map((email: string) => email.trim())
        .filter((email: string) => this.isValidEmail(email));
  
      // 3. Agregar cada email válido a los chips
      this.emailChips = [...emails];
    }
  
    // 4. Actualizar el control del formulario (opcional, si necesitas el valor original)
    this.EmailSettsRegisterForm.controls['recipients'].setValue(data.recipients);
    
    this.btn_action = 'Actualizar';
    this.btn_ico = 'edit';
    this.show_form_setts = true;
    setTimeout(() => {
      this.EmailSettsRegisterForm.controls['recipients'].setValue('');
    }, 1000);
  }

  obtenerEmailCliSetts(idConfig: number) {
    this.eSet.obtenerEmailCliSetts( idConfig ).subscribe({
      next: (x) => {
        this.listEmailCLiSetts = x;
        this.listEmailCLiSettsGhost = x;
        // console.warn(this.listEmailCLiSetts);
      }
    })
  }

  eliminarSettingsEmailCli( id: number, index: number ) {
    
    Swal.fire({
      title: "Estás seguro?",
      text: "Esta acción es irreversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, elimínalo!"
    }).then((result) => {
      if (result.isConfirmed) {        
        this.eSet.eliminarSettingsEmailCli( id ).subscribe({
          next: (x) => {
            Swal.fire({
              title: "Eliminado!",
              text: "el registro ha sido eliminado.",
              icon: "success"
            });
          }, error: (e) => {
            console.error(e);
          }, complete: () => {
            this.listEmailCLiSetts.splice( index, 1 );
          }
        })
      }
    });
  
  }

  filterItemSettsEmail() {  
    let filter: any = this.exportdataform.controls['filter'].value;
    this.listEmailCLiSetts = this.listEmailCLiSettsGhost.filter((item:any) =>
      item.profileName.toLowerCase().includes(filter.toLowerCase()) ||
      item.subject.toLowerCase().includes(filter.toLowerCase())     ||
      item.fromAddress.toLowerCase().includes(filter.toLowerCase()) ||
      item.recipients.toLowerCase().includes(filter.toLowerCase())  ||
      item.replyTo.toLowerCase().includes(filter.toLowerCase())
    )
  }

  obtenerCodigoConfig(data: any) {
    this.codConfig = data;
    this.show_action_panel = true;
    this.obtenerEmailCliSetts(1);
  }

  obtenerDataItemsProcess() {

    this.dataMaster.obtenerDatosMasterTable( 'TIMO' ).subscribe({
      next: (x) => {
        this.listItemProcess = x;
        // console.warn('this.listItemProcess')
        // console.warn(this.listItemProcess)
      }, error: (e) => {
        console.error(e);
      }
    })

  }

  getCodecEmailSendByProcess() {
    this.dataMaster.obtenerDatosMasterTable( 'PROC' ).subscribe({
      next: (x:any) => {
        x.filter( (l:any) => l.codigo = l.codigo.toString().trim() );
        this.listItemProcessSendByEmail = x;        
      }, error: (e) => {
        console.error(e);
      }
    })
  }


}
