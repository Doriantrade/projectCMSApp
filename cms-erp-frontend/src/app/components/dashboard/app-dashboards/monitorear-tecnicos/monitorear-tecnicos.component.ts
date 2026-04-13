import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import { SettingsGeolocationService } from 'src/app/services/settings-geolocation.service';

@Component({
  selector: 'app-monitorear-tecnicos',
  templateUrl: './monitorear-tecnicos.component.html',
  styleUrls: ['./monitorear-tecnicos.component.scss']
})
export class MonitorearTecnicosComponent implements OnInit, OnDestroy {
  pMod: number = 4;

  _show_spinner: boolean = false;
  @Input() modulo: any = [];

  // Settings Panel
  showSettingsPanel: boolean = false;
  activeTab: any = 'config';
  settingsData: any[] = [];
  tecnicosList: any[] = [];
  selectedSetting: any = null;

  // Filtros de Técnicos y Mapas
  searchTerm: string = '';
  selectedTecnicosMap: { [key: string]: boolean } = {};

  get filteredTecnicosList(): any[] {
    if (!this.searchTerm) return this.tecnicosList;
    const term = this.searchTerm.toLowerCase();
    return this.tecnicosList.filter(t => 
      (t.nombre && t.nombre.toLowerCase().includes(term)) || 
      (t.apellido && t.apellido.toLowerCase().includes(term))
    );
  }

  get visibleMarkers(): any[] {
    return this.markers.filter(m => this.selectedTecnicosMap[m.tag]);
  }

  get allSelected(): boolean {
    if (this.tecnicosList.length === 0) return false;
    return this.tecnicosList.every(t => this.selectedTecnicosMap[t.coduser]);
  }

  toggleAll(event: any) {
    const isChecked = event.target.checked;
    this.tecnicosList.forEach(t => {
      this.selectedTecnicosMap[t.coduser] = isChecked;
    });
  }

  // Google Maps Configuration
  center: google.maps.LatLngLiteral = { lat: -0.180653, lng: -78.467834 }; // Default Quito
  zoom = 12;
  mapOptions: google.maps.MapOptions = {
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    maxZoom: 20,
    minZoom: 4,
  };

  markers: any[] = [];

  // SignalR
  private locationHub: HubConnection;
  private urlHub = environment.hub;

  constructor(private settingsService: SettingsGeolocationService) {
    // Remove trailing slash if present to avoid // in URL
    const baseUrl = this.urlHub.endsWith('/') ? this.urlHub.slice(0, -1) : this.urlHub;

    this.locationHub = new HubConnectionBuilder()
      .withUrl(baseUrl + '/hubs/geolocalizacionHub')
      .withAutomaticReconnect()
      .build();

    // Set timeout to 10 minutes to support sparse GPS updates (default is 30s)
    this.locationHub.serverTimeoutInMilliseconds = 10 * 60 * 1000;
    this.locationHub.keepAliveIntervalInMilliseconds = 30 * 1000; // 30s ping
  }

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    this.connectSignalR();
  }

  ngOnDestroy(): void {
    if (this.locationHub) {
      this.locationHub.stop();
    }
  }

  connectSignalR() {
    console.log('=> Intentando conectar a SignalR en:', this.urlHub + 'hubs/geolocalizacionHub');

    // Register listener BEFORE starting
    this.locationHub.on("SendGeolocalizacion", (data: any) => {
      console.log('=> EVENTO SIGNALR SendGeolocalizacion RECIBIDO EN FRONTEND:', JSON.stringify(data));
      this.updateTechnicianLocation(data);
    });

    // Increase message size limit on client side (approx 10MB)
    (this.locationHub as any).maximumReceiveMessageSize = 10 * 1024 * 1024;

    this.locationHub.start().then(() => {
      console.log('CONECTADO A HUB DE LOCALIZACION (CMS-SYSTEM)');
      console.log('Estado de conexión:', this.locationHub.state);
    }).catch(e => {
      console.error('Error conectando a SignalR:', e);
    });
  }

  updateTechnicianLocation(data: any) {
    console.log('Ubicación recibida:', data);

    const lat = parseFloat(data.latitud);
    const lng = parseFloat(data.longitud);

    // Buscar si ya existe un marcador para este técnico
    const existingMarkerIndex = this.markers.findIndex(m => m.tag === data.coduser);

    const titleStr = data.nombreUsuario || `Técnico ${data.coduser}`;
    let markerIcon: any = {
      url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      scaledSize: new google.maps.Size(30, 30),
      labelOrigin: new google.maps.Point(15, 35) // Centered horizontally (15), below icon vertically (35)
    };

    if (data.imagenUsuario && data.imagenUsuario.trim() !== '') {
      let iconUrl = data.imagenUsuario;
      // Si no es base64, concatenar la URL del servidor
      if (!iconUrl.startsWith('data:image')) {
        iconUrl = environment.image_url + iconUrl;
      }

      markerIcon = {
        url: iconUrl,
        scaledSize: new google.maps.Size(36, 36),
        labelOrigin: new google.maps.Point(18, 42) // Centered horizontally (18), below icon vertically (42)
      };
    } else if (existingMarkerIndex !== -1) {
      // SI NO VIENE IMAGEN EN ESTE BROADCAST, PERO YA TENÍAMOS UN MARCADOR,
      // MANTENER EL ICONO ANTERIOR (PROBABLEMENTE EL PROFILE PIC)
      const oldMarker = this.markers[existingMarkerIndex];
      if (oldMarker.options && oldMarker.options.icon) {
        markerIcon = oldMarker.options.icon;
      }
    }

    const newMarker = {
      position: { lat: lat, lng: lng },
      title: titleStr,
      tag: data.coduser,
      options: {
        animation: google.maps.Animation.DROP,
        icon: markerIcon,
        zIndex: 9999, // Asegurar que esté al frente
        label: {
          text: titleStr,
          color: '#1a73e8', // Blue text to match the standard pin
          fontWeight: 'bold',
          fontSize: '12px',
          className: 'marker-label-custom'
        }
      }
    };

    if (existingMarkerIndex !== -1) {
      // Actualizar posición
      this.markers[existingMarkerIndex] = newMarker;
    } else {
      // Crear nuevo marcador
      this.markers.push(newMarker);
    }

    // Trigger change detection for the map
    this.markers = [...this.markers];

    // Centrar mapa en la última ubicación recibida
    this.center = { lat: lat, lng: lng };
    this.zoom = 15;
  }

  // --- Setting Management Methods ---
  toggleSettingsPanel() {
    this.showSettingsPanel = !this.showSettingsPanel;
    if (this.showSettingsPanel) {
      this.activeTab = 'config';
      this.loadMonitorData();
    }
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.selectedSetting = null; // hide edit form when switching tab
    if (tab === 'tecnicos' && this.tecnicosList.length === 0) {
      this.loadTecnicos();
    }
  }

  toggleTecnico(coduser: string) {
    this.selectedTecnicosMap[coduser] = !this.selectedTecnicosMap[coduser];
  }

  loadTecnicos() {
    console.log('Iniciando fetch a ObtenerTecnicosAppMovil...');
    this._show_spinner = true;
    this.settingsService.getTecnicosAppMovil().subscribe({
      next: (data) => {
        console.log('Respuesta Exitosa de Técnicos:', data);
        this.tecnicosList = data;
        // Check all by default
        data.forEach(t => this.selectedTecnicosMap[t.coduser] = true);
        this._show_spinner = false;
      },
      error: (err) => {
        console.error('Error detallado cargando tecnicos:', err);
        this._show_spinner = false;
      }
    });
  }

  loadMonitorData() {
    this._show_spinner = true;
    this.settingsService.getMobileMonitorData().subscribe({
      next: (data) => {
        this.settingsData = data;
        this._show_spinner = false;
      },
      error: (err) => {
        console.error('Error loading monitor data:', err);
        this._show_spinner = false;
      }
    });
  }

  editSetting(item: any) {
    this.selectedSetting = { ...item };
  }

  saveSetting() {
    if (!this.selectedSetting) return;

    this._show_spinner = true;
    this.settingsService.updateSettings(this.selectedSetting.id, this.selectedSetting).subscribe({
      next: () => {
        this.loadMonitorData();
        this.selectedSetting = null;
      },
      error: (err) => {
        console.error('Error saving settings:', err);
        this._show_spinner = false;
      }
    });
  }

  cancelEdit() {
    this.selectedSetting = null;
  }
}
