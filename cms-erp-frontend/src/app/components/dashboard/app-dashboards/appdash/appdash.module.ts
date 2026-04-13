import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioComponent } from '../usuario/usuario.component';

//#region Angular Material
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PortalModule } from '@angular/cdk/portal';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HttpClientModule } from '@angular/common/http';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AsignacionProvinciasComponent } from '../asignacionprovincias/asignacion-provincias/asignacion-provincias.component';
import { ModalProvicComponent } from '../asignacionprovincias/modal/modal-provic/modal-provic.component';
import { ClientesComponent } from '../clientes/clientes.component';
import { AgenciasComponent } from '../agencias/agencias.component';
import { MaquinariaComponent } from '../maquinaria/maquinaria.component';
import { SharedModuleModule } from 'src/app/components/shared/shared-module/shared-module.module';
import { PerfilUsuarioComponent } from '../perfil-usuario/perfil-usuario.component';
import { BodegasComponent } from '../bodegas/bodegas.component';
import { CrearBodegasComponent } from '../bodegas/crear-bodegas/crear-bodegas.component';
import { ProductosBodegaComponent } from '../bodegas/productos-bodega/productos-bodega.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { KardexTransferenciaComponent } from '../bodegas/kardex-transferencia/kardex-transferencia.component';
import { EmpresaComponent } from '../empresa/empresa.component';
import { ConfiguracionComponent } from '../configuracion/configuracion.component';
import { AsignModUserComponent } from '../configuracion/asign-mod-user/asign-mod-user.component';
import { ImagenesProductosComponent } from '../imagenes-productos/imagenes-productos.component';
import { GarantiasComponent } from '../garantias/garantias.component';
import { ModalAsignacionProductosComponent } from '../agencias/modal-asignacion-productos/modal-asignacion-productos.component';
import { ModalClientesComponent } from '../bodegas/crear-bodegas/modal-clientes/modal-clientes.component';
import { ContratosComponent } from '../garantias/contratos/contratos.component';
import { MaquinariaContratoComponent } from '../garantias/maquinaria-contrato/maquinaria-contrato.component';
import { CronogramaComponent } from '../cronograma/cronograma.component';
import { ModalCronogramaComponent } from '../cronograma/modal-cronograma/modal-cronograma.component';
import { CronoGridComponent } from '../crono-grid/crono-grid.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { ListboxModule } from 'primeng/listbox';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InplaceModule } from 'primeng/inplace';
import { KnobModule } from 'primeng/knob';
import { ModalDetalleCronoComponent } from '../crono-grid/modal-detalle-crono/modal-detalle-crono.component';
import { CrononewdisComponent, FilterPipe } from '../crononewdis/crononewdis.component';
import { DragDropModule as dmod } from 'primeng/dragdrop';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SplitterModule } from 'primeng/splitter';
import { ScrollTopModule } from 'primeng/scrolltop';
import { SpeedDialModule } from 'primeng/speeddial';
import { ChipModule } from 'primeng/chip';
import { ChipsModule } from 'primeng/chips';
import { ChartModule } from 'primeng/chart';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ModalAsignMaqtecnicoComponent } from '../crono-grid/modal-asign-maqtecnico/modal-asign-maqtecnico.component';
import { RepuestosComponent } from '../repuestos/repuestos.component';
import { CreadorMarcaRepuestoComponent } from '../repuestos/creador-marca-repuesto/creador-marca-repuesto.component';
import { MonitorearTecnicosComponent } from '../monitorear-tecnicos/monitorear-tecnicos.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { MantenimientoTicketsComponent } from '../mantenimiento-tickets/mantenimiento-tickets.component';

@NgModule({
  declarations: [
    MonitorearTecnicosComponent,
    UsuarioComponent,
    AsignacionProvinciasComponent,
    ModalProvicComponent,
    ClientesComponent,
    AgenciasComponent,
    MaquinariaComponent,
    PerfilUsuarioComponent,
    BodegasComponent,
    CrearBodegasComponent,
    ProductosBodegaComponent,
    KardexTransferenciaComponent,
    EmpresaComponent,
    ConfiguracionComponent,
    AsignModUserComponent,
    ImagenesProductosComponent,
    GarantiasComponent,
    ModalAsignacionProductosComponent,
    ModalClientesComponent,
    ContratosComponent,
    MaquinariaContratoComponent,
    CronogramaComponent,
    ModalCronogramaComponent,
    CronoGridComponent,
    ModalDetalleCronoComponent,
    CrononewdisComponent,
    FilterPipe,
    ModalAsignMaqtecnicoComponent,
    RepuestosComponent,
    CreadorMarcaRepuestoComponent,
    MantenimientoTicketsComponent
  ],
  imports: [
    OverlayPanelModule,
    ChipModule,
    ChipsModule,
    dmod,
    ScrollTopModule,
    SpeedDialModule,
    KnobModule,
    CommonModule,
    CdkStepperModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
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
    ChartModule,
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
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    OverlayModule,
    PortalModule,
    ScrollingModule,
    SharedModuleModule,
    //#endregion
    FormsModule,
    AutoCompleteModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    InputNumberModule,
    ButtonModule,
    MultiSelectModule,
    ListboxModule,
    InplaceModule,
    SplitButtonModule,
    SplitterModule,
    GoogleMapsModule
  ],
  exports: [
    UsuarioComponent,
    AsignacionProvinciasComponent,
    ClientesComponent,
    AgenciasComponent,
    MaquinariaComponent,
    PerfilUsuarioComponent,
    BodegasComponent,
    ProductosBodegaComponent,
    KardexTransferenciaComponent,
    EmpresaComponent,
    ConfiguracionComponent,
    AsignModUserComponent,
    ImagenesProductosComponent,
    GarantiasComponent,
    ContratosComponent,
    CronogramaComponent,
    CronoGridComponent,
    CrononewdisComponent,
    RepuestosComponent,
    CreadorMarcaRepuestoComponent,
    MonitorearTecnicosComponent,
    MantenimientoTicketsComponent
  ]
})
export class AppdashModule { }
