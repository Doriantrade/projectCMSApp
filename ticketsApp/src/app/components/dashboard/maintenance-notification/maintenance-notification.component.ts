import { Component, Input, OnInit } from '@angular/core';
import { MaintenanceNotification, MaintenanceNotificationService } from '../services/maintenance-notification.service';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ModalMantenimientosComponent } from '../modal-mantenimientos/modal-mantenimientos.component';

@Component({
    selector: 'app-maintenance-notification',
    templateUrl: './maintenance-notification.component.html',
    styleUrls: ['./maintenance-notification.component.scss']
})
export class MaintenanceNotificationComponent implements OnInit {

    @Input() notification!: MaintenanceNotification;

    constructor(private service: MaintenanceNotificationService, private dialog: MatDialog) { }

    ngOnInit(): void {
    }

    getBorderColor(): string {
        switch (this.notification.estado) {
            case 2: return 'orange';
            case 3: return '#FFD700'; // Yellow
            case 4: return 'blue';
            default: return 'yellowgreen';
        }
    }

    getTextColor(): string {
        switch (this.notification.estado) {
            case 2: return 'white'; // Orange bg -> White text
            case 3: return 'black'; // Yellow bg -> Black text
            case 4: return 'white'; // Blue bg -> White text
            default: return 'black'; // Yellowgreen bg -> Black text
        }
    }

    onVerify() {
        this.dialog.open(ModalMantenimientosComponent, {
            width: '80%',
            maxWidth: '900px',
            panelClass: 'custom-dialog-container'
        });
    }

    onClose() {
        this.service.removeNotification(this.notification);
    }
}
