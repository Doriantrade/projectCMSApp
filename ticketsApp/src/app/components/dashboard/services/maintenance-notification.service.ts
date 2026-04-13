import { Injectable } from '@angular/core';

export interface MaintenanceNotification {
    idMantenimiento: number; // Used as unique global ID
    estado: number;
    nombreEstado: string;
    usuario: string; // ID
    imagenPerfil: string;
    nserie: string;
    nombreMarca: string;
    nombreModelo: string;
    nombreTipoMaquina: string;
    segundosAcumulados: number;
    fechaCambio: string;
    idTecnico: string;
    nombreTecnico: string;
    // UI helpers
    timestamp: number;
}

@Injectable({
    providedIn: 'root'
})
export class MaintenanceNotificationService {

    private readonly STORAGE_KEY = 'maintenance_notifications';
    notifications: MaintenanceNotification[] = [];

    constructor() {
        this.loadNotifications();
    }

    addNotification(data: any) {
        // Map API data to interface slightly if needed, or stick to structure
        // Ensure we don't duplicate by idMantenimiento if that's the intent, 
        // OR just push as new if every update is significant.
        // User said "notifications must accumulate", suggesting a list.
        // However, if it's the SAME maintenance updating status, maybe update existing?
        // Request says "acumularse verticalmente", implying a stack of alerts.
        // I will treat each signal as a new alert for now, unless duplicate ID logic is needed.
        // But logically, if status changes for same ticket, it might be better to show the new one.
        // Let's just push for now.

        const newNotification: MaintenanceNotification = {
            ...data,
            timestamp: Date.now()
        };

        this.notifications.push(newNotification);
        this.saveNotifications();
    }

    removeNotification(notification: MaintenanceNotification) {
        this.notifications = this.notifications.filter(n => n.timestamp !== notification.timestamp);
        this.saveNotifications();
    }

    private saveNotifications() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.notifications));
    }

    private loadNotifications() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            try {
                this.notifications = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading maintenance notifications', e);
                this.notifications = [];
            }
        }
    }

    clearAll() {
        this.notifications = [];
        this.saveNotifications();
    }
}
