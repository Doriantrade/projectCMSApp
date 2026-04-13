import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-modal-mantenimientos',
    templateUrl: './modal-mantenimientos.component.html',
    styleUrls: ['./modal-mantenimientos.component.scss']
})
export class ModalMantenimientosComponent implements OnInit {

    // Mock data for UI development while API is being built
    technicians: any[] = [
        {
            idMantenimiento: 1,
            nombreTecnico: 'Juan Perez',
            imagenPerfil: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            nserie: '0001',
            nombreMarca: 'HP',
            nombreModelo: 'LaserJet',
            nombreTipoMaquina: 'Impresora',
            nombreEstado: 'En revisión',
            estado: 2
        },
        {
            idMantenimiento: 2,
            nombreTecnico: 'Maria Lopez',
            imagenPerfil: 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png',
            nserie: '0002',
            nombreMarca: 'Dell',
            nombreModelo: 'Latitude',
            nombreTipoMaquina: 'Laptop',
            nombreEstado: 'Limpieza',
            estado: 3
        },
        {
            idMantenimiento: 3,
            nombreTecnico: 'Carlos Diaz',
            imagenPerfil: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            nserie: '0003',
            nombreMarca: 'Epson',
            nombreModelo: 'L3150',
            nombreTipoMaquina: 'Multifuncional',
            nombreEstado: 'Finalizado',
            estado: 4
        }
    ];

    constructor() { }

    ngOnInit(): void {
    }

    getBadgeColor(estado: number): string {
        switch (estado) {
            case 2: return 'orange';
            case 3: return '#FFD700';
            case 4: return 'blue';
            default: return 'yellowgreen';
        }
    }
}
