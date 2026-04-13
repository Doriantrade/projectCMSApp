import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-modal-crear-ticket',
    templateUrl: './modal-crear-ticket.component.html',
    styleUrls: ['./modal-crear-ticket.component.scss']
})
export class ModalCrearTicketComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<ModalCrearTicketComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit(): void {
    }

    closeModal() {
        this.dialogRef.close();
    }

    onTicketCreated(event: any) {
        this.dialogRef.close(event);
    }
}
