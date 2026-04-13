import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TablaHelpDeskComponent } from '../../dashboard/tabla-help-desk/tabla-help-desk.component';

@Component({
  selector: 'app-modal-estado-color',
  templateUrl: './modal-estado-color.component.html',
  styleUrls: ['./modal-estado-color.component.scss']
})
export class ModalEstadoColorComponent implements OnInit {

  constructor( public dialog: MatDialog,
               @Inject(MAT_DIALOG_DATA) public data: any,
               public dialogRef: MatDialogRef<TablaHelpDeskComponent>) {}

  listaEstados: any = [
    {
      descripcion: 'Enviado pero no leído aún.',
      color: 'rgb(184, 222, 246)',
      estado: 1
    },
    {
      descripcion: 'Requerimiento asignado.',
      color: 'rgb(255, 236, 161)',
      estado: 2
    },
    {
      descripcion: 'En proceso.',
      color: 'rgb(101, 236, 195)',
      estado: 3
    },
    {
      descripcion: 'Ticket cerrado.',
      color: 'rgb(187, 187, 187)',
      estado: 4
    }
  ]

  ngOnInit(): void {

  }



}
