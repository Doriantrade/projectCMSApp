import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Environments } from 'src/app/environments/environments';
import { MensajeriaTicketComponent } from '../../dashboard/tabla-help-desk/mensajeria-ticket/mensajeria-ticket.component';
import { TablaHelpDeskComponent } from '../../dashboard/tabla-help-desk/tabla-help-desk.component';

import Swal from 'sweetalert2';
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
})

@Component({
  selector: 'app-modal-preview',
  templateUrl: './modal-preview.component.html',
  styleUrls: ['./modal-preview.component.scss']
})
export class ModalPreviewComponent implements OnInit {
  IMG: string = '';
  codecEstablecimiento: string = ''

  constructor( public dialog: MatDialog,
               @Inject(MAT_DIALOG_DATA) public data: any,
               private env: Environments,
               public dialogRef: MatDialogRef<TablaHelpDeskComponent>) {}


  ngOnInit(): void {
    this.IMG = this.env.apiUrlStorageMImage() + this.data.imagenRequerimiento;
    if ( this.data.imagenRequerimiento == 'storage//' ) {
      Swal.fire({
        title: "No hay imagen?",
        text: "El cliente no ha subido una imagen para este ticket",
        icon: "info"
      });
    }
  }


}
