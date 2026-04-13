import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//#region Angular Material
import { DragDropModule } from '@angular/cdk/drag-drop';

import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';

// import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClientModule } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { LoginComponent } from '../login/login.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { FormularioRegistroProblemasComponent } from '../dashboard/formulario-registro-problemas/formulario-registro-problemas.component';
import { NavsideComponent } from '../shared/navside/navside.component';
import { TablaHelpDeskComponent } from '../dashboard/tabla-help-desk/tabla-help-desk.component';
import { FilterComponent } from '../shared/filter/filter.component';
import { ClientesHelpDeskComponent } from '../dashboard/clientes-help-desk/clientes-help-desk.component';
import { MensajeriaTicketComponent } from '../dashboard/tabla-help-desk/mensajeria-ticket/mensajeria-ticket.component';
import { MantenimientoComponent } from '../dashboard/tabla-help-desk/mantenimiento/mantenimiento.component';
import { FechaRealComponent } from '../dashboard/tabla-help-desk/fecha-real/fecha-real.component';
import { ResumenMantenimientoComponent } from '../dashboard/tabla-help-desk/resumen-mantenimiento/resumen-mantenimiento.component';
import { ModalRepuestosComponent } from '../dashboard/tabla-help-desk/resumen-mantenimiento/modal-repuestos/modal-repuestos.component';
import { ModalTecnicosComponent } from '../dashboard/modal-tecnicos/modal-tecnicos.component';
import { TecnicosRegistradosComponent } from '../dashboard/tecnicos-registrados/tecnicos-registrados.component';
import { RepuestosAsignadosComponent } from '../dashboard/repuestos-asignados/repuestos-asignados.component';
import { FileMediaTicketComponent } from '../dashboard/file-media-ticket/file-media-ticket.component';
import { DocumentosReportesComponent } from '../dashboard/documentos-reportes/documentos-reportes.component';
import { TicketsListenComponent } from '../dashboard/tickets-listen/tickets-listen.component';
import { DocumentoCotizacionComponent } from '../dashboard/documento-cotizacion/documento-cotizacion.component';
import { NgxPrintModule } from 'ngx-print';
import { ModalCotizacionComponent } from '../dashboard/repuestos-asignados/modal-cotizacion/modal-cotizacion/modal-cotizacion.component';
import { ModalDownCotizacionComponent } from '../dashboard/repuestos-asignados/modal-down-cotizacion/modal-down-cotizacion.component';
import { ConfiguracionesComponent } from '../shared/configuraciones/configuraciones.component';
import { ModalEstadoColorComponent } from '../shared/modal-estado-color/modal-estado-color.component';
import { DocuIESSComponent } from '../dashboard/docu-iess/docu-iess.component';
import { PersonalEncargadoBodegaComponent } from '../dashboard/personal-encargado-bodega/personal-encargado-bodega.component';
import { ModalCrearTicketComponent } from '../dashboard/clientes-help-desk/modal-crear-ticket/modal-crear-ticket.component';
import { MaintenanceNotificationComponent } from '../dashboard/maintenance-notification/maintenance-notification.component';
import { ModalMantenimientosComponent } from '../dashboard/modal-mantenimientos/modal-mantenimientos.component';
import { PerfilComponent } from '../shared/navside/perfil/perfil.component';

@NgModule({
  declarations: [
    ModalEstadoColorComponent,
    LoginComponent,
    DashboardComponent,
    FormularioRegistroProblemasComponent,
    NavsideComponent,
    TablaHelpDeskComponent,
    FilterComponent,
    ClientesHelpDeskComponent,
    MensajeriaTicketComponent,
    MantenimientoComponent,
    FechaRealComponent,
    ResumenMantenimientoComponent,
    ModalRepuestosComponent,
    ModalTecnicosComponent,
    TecnicosRegistradosComponent,
    RepuestosAsignadosComponent,
    FileMediaTicketComponent,
    DocumentosReportesComponent,
    TicketsListenComponent,
    DocumentoCotizacionComponent,
    ModalCotizacionComponent,
    ModalDownCotizacionComponent,
    ConfiguracionesComponent,
    PersonalEncargadoBodegaComponent,
    DocuIESSComponent,
    ModalCrearTicketComponent,
    MaintenanceNotificationComponent,
    ModalMantenimientosComponent,
    PerfilComponent
  ],
  imports: [
    NgxPrintModule,
    // #angularMaterial
    DragDropModule,

    MatFormFieldModule,
    CommonModule,
    MatTabsModule,
    MatSidenavModule,
    MatSliderModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    DragDropModule
  ],
  exports: [
    FormularioRegistroProblemasComponent,
    NavsideComponent,
    TablaHelpDeskComponent,
    FilterComponent,
    ClientesHelpDeskComponent,
    MensajeriaTicketComponent,
    MantenimientoComponent,
    FechaRealComponent,
    ResumenMantenimientoComponent,
    TecnicosRegistradosComponent,
    RepuestosAsignadosComponent,
    FileMediaTicketComponent,
    DocumentosReportesComponent,
    TicketsListenComponent,
    DocumentoCotizacionComponent,
    ConfiguracionesComponent,
    DocuIESSComponent
  ]
})

export class ComponentsAppsModuModule { }
