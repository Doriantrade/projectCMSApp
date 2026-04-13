import { Component, ElementRef, Inject, OnInit, Renderer2 } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Environments } from 'src/app/environments/environments';
import { RepuestosAsignadosComponent } from '../../repuestos-asignados.component';
import { DocumentoCotizacionService } from '../../../documento-cotizacion/services/documento-cotizacion.service';
import { EncryptService } from 'src/app/components/shared/services/encrypt.service';
import { FormControl, FormGroup } from '@angular/forms';
import { RepCorrectivoService } from '../../../documentos-reportes/services/rep-correctivo.service';

import { MantenimientoService } from '../../../tabla-help-desk/mantenimiento/services/mantenimiento.service';
import { MasterTableService } from 'src/app/components/shared/master-table/master-table.service';

import jsPDF from 'jspdf'; // <--- NUEVA IMPORTACIÓN
import html2canvas from 'html2canvas'; // <--- NUEVA IMPORTACIÓN

@Component({
  selector: 'app-modal-cotizacion',
  templateUrl: './modal-cotizacion.component.html',
  styleUrls: ['./modal-cotizacion.component.scss']
})
export class ModalCotizacionComponent implements OnInit {

  /** COTIZACIÓN VARIABLES INICIO */
  id: any;
  listaCotizacion: any;
  codrep: any;
  idRequer: any;
  estado: any;
  cantidad: any;
  valorFinal: any;
  nombreEmpresa: any;
  descripcionEmpresa: any;
  descripcionRepuesto: any;
  direccion: any;
  cargo: any;
  nombrePersCargo: any;
  logotipoUrl: any;
  textoCotizacion: any;
  replegal: any;
  replegalGhost: any;
  telf1: any;
  telf2: any;
  email: any;
  nombreMarcaEquipo: any;
  nombreModeloEquipo: any;
  nombreTipoDeEquipo: any;
  nombreRep: any;
  nserie: any;
  nombreCliente: any;
  nombreClienteGhost: any;
  nombreAgencia: any;
  nombreAgenciaGhost: any;
  contadorinicial: any;
  contadorfinal: any;
  ninventario: any;
  codigobp: any;
  fechaActual: any;
  firma: any;
  iva: any;
  subTotal: number = 0.0;
  totalIVA: number = 0.0;
  totalCotizacion: number = 0.0;
  ccia: any;

  tituloLlamar: string = '';
  tituloLlamarGhost: string = '';
  _show_spinner: boolean = false;
  fechaFormateada!: string;
  nomeclaturaTipoMantenimiento: any;
  tipoArchivo: string = '';
  mensajeSpinner: string = '';
  /** COTIZACIÓN VARIABLES FIN */

  /** REPORTE TECNICO VARIABLES INICIO */
  listaReporteTecnicoCorrectivo: any = [];
  serieTicket: any;
  idAgencia: any;
  nombreTecnico: any;
  cedulaTecnico: any;
  provinciaAgencia: any;
  tipoMantenimientoCorto: any;
  nSerieEquipo: any;
  tipoMaquina: any;
  capacidad: any;
  marca: any;
  modelo: any;
  estadoEquipo: any;
  /** REPORTE TECNICO VARIABLES FIN */

  /** INPUTS EDICIÓN COTIZACIÓN INICIO */
  dataNameForm = new FormGroup({
    repLegal: new FormControl(''),
    dirigido: new FormControl(''),
    tituloPres: new FormControl('')
  })
  /** INPUTS EDICIÓN COTIZACIÓN FIN */

  constructor(
    private mant: MantenimientoService,
    private repTec: RepCorrectivoService,
    private dataMater: MasterTableService,
    private cotiza: DocumentoCotizacionService,
    private fechaService: EncryptService,
    private renderer: Renderer2, private el: ElementRef,
    private env: Environments,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<RepuestosAsignadosComponent>) { }


  show_form: boolean = true;
  ngOnInit(): void {

    const fechaActual = new Date();
    this.fechaFormateada = this.fechaService.formatFecha(fechaActual);
    switch (this.data.type) {
      case 'COTIZACION':
        this.show_form = true;
        this.obtenerCotizacion(Number(this.data.idRequerimiento));
        break;
      case 'REPTEC':
        this.show_form = false;
        this.obtenerReptecCorr(Number(this.data.idRequerimiento));
        break;
      case 'NOTAENTREGA':
        this.obtenerNotaRepuestos(Number(this.data.idRequerimiento));
        this.show_form = false;
        break;
    }
  }

  getValidValue(value: any) {
    return (value !== null && value !== undefined && value.trim() !== '') ? value : null;
  }

  listaEstadoEquipo: any = [];
  obtenerDataEstadoEquipo() {
    this.dataMater.obtenerDatosMasterTable('EE').subscribe({
      next: (x) => {
        this.listaEstadoEquipo = x;
      }
    })
  }

  listaCheckListaMantenimiento: any = [];
  obtenerDataMasterCheckList() {
    this.dataMater.obtenerDatosMasterTable('CM').subscribe({
      next: (x) => {
        this.listaCheckListaMantenimiento = x;
      }
    })
  }

  listaRepuestoRequerimientos: any = [];
  obtenerRepuestosRequerimientos(id: number) {
    this.mant.obtenerRepuestosRequerimientos(id).subscribe({
      next: (x) => {
        this.listaRepuestoRequerimientos = x;
      }, error: (e) => {
        if (e.status != 200) console.error(e);
      }
    })
  }

  onSubmit() {

    // Usa la función de utilidad para validar y asignar valores
    const repLegalValue = this.getValidValue(this.dataNameForm.controls['repLegal'].value);
    const dirigidoValue = this.getValidValue(this.dataNameForm.controls['dirigido'].value);
    const tituloPresValue = this.getValidValue(this.dataNameForm.controls['tituloPres'].value);

    // Actualiza solo si el valor es válido
    if (repLegalValue !== null) {
      this.replegal = repLegalValue;
    } else {
      this.replegal = this.replegalGhost;
    }
    if (dirigidoValue !== null) {
      this.nombreCliente = dirigidoValue;
    } else {
      this.nombreCliente = this.nombreClienteGhost;
    }
    if (tituloPresValue !== null) {
      this.tituloLlamar = tituloPresValue;
    } else {
      this.tituloLlamar = '';
    }

    // Llama a generarCotizacion para actualizar la vista
    this.generarCotizacion();

  }

  //#region [REPORTE NOTA DE ENTREGA]
  generarNotaDeEntrega() {
    this.tipoArchivo = 'NOTA DE ENTREGA';
    this.ccia = sessionStorage.getItem('ccia');
    let xareaRep: any = <HTMLDivElement>document.getElementById('area-rep');
    xareaRep.style.width = '100%';
    const cotizacionContainer = this.el.nativeElement.querySelector('#cotizacion');
    if (cotizacionContainer) {
      // Limpia el contenido anterior del contenedor
      cotizacionContainer.innerHTML = '';
      // Crea un nuevo elemento div
      const nuevoElemento = this.renderer.createElement('div');
      // Añade contenido HTML al nuevo elemento
      this.renderer.setProperty(nuevoElemento, 'innerHTML', `
        <style>
          * {
            font-family: arial;
            font-size: 10pt;
            color: black !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid black;
            padding: 5px;
            text-align: center;
          }
          th {
            background-color: black;
            color: white;
          }
        </style>
        <div style="width: 1180px; padding: 45px;">
          <div style="display: flex; justify-content: space-between;">
            <div style="padding: 15px; display: flex; justify-content: center; align-items: center; width: 50%;">
              <img src="../../../../assets/logotipo/descarga.png"
                   width="200px"
                   height="110px">
            </div>
            <div style="padding: 15px; display: flex; justify-content: center; align-items: center; width: 50%;">
              <div style="display: flex; flex-direction: column; text-align: center;">
                <h2 style="margin: 0px;">
                  <strong style="font-size: 13pt !important; color: black;">NOTA DE ENTREGA</strong>
                </h2>
                <hr style="margin: 0px; padding: 0px; border: solid 2px gray;">
                <h1 style="margin: 0px;">
                  <strong style="color: red !important; font-size: 22pt !important;"> ${this.serieTicket}</strong>
                </h1>
                <hr style="margin: 0px; padding: 0px; border: solid 2px gray;">                
                <h4 style="margin: 0px; "> <strong style="font-size: 11pt !important;">
                  CASH MACHINE SERVICE C. LTDA.</strong>
                </h4>
              </div>
            </div>
          </div>
  
          <div style="width: 100%; margin-top: 25px; margin-bottom: 25px; display: flex; justify-content: end;">
            <div style="padding: 15px;">
              <strong>${this.fechaFormateada}</strong>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; width: 100%;">
            <div style="display: block; width: 40%; padding: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: dashed  1px gray;">
                <div style="margin-right: 8px;"> Cliente: </div>
                <div> <strong> ${this.nombreCliente} </strong> </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: dashed  1px gray;">
                <div style="margin-right: 8px;"> Agencia: </div>
                <div> <strong> ${this.nombreAgencia} </strong> </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: dashed  1px gray;">
                <div style="margin-right: 8px;"> Técnico: </div>
                <div> <strong> ${this.nombreTecnico} </strong> </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: dashed  1px gray;">
                <div style="margin-right: 8px;"> Cédula: </div>
                <div> <strong> ${this.cedulaTecnico} </strong> </div>
              </div>
            </div>
            <div style="display: block; width: 40%; padding: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: dashed  1px gray;">
                <div style="margin-right: 8px;"> Marca: </div>
                <div> <strong> ${this.marca} </strong> </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: dashed  1px gray;">
                <div style="margin-right: 8px;"> Modelo: </div>
                <div> <strong> ${this.modelo} </strong> </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: dashed  1px gray;">
                <div style="margin-right: 8px;"> N. Serie: </div>
                <div> <strong> ${this.nSerieEquipo} </strong> </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: dashed  1px gray;">
                <div style="margin-right: 8px;"> Inventario: </div>
                <div> <strong> ${this.ninventario} </strong> </div>
              </div>
            </div>
          </div>
          <div style="display:flex; justify-content: center; width: 100%;">
            <table style=" width: 75%; ">
              <thead>
                
                  <th>ITEM</th>
                  <th>N. Parte</th>
                  <th>DESCRIPCIÓN</th>
                  <th>CANTIDAD</th>
                
              </thead>
              <tbody>
                ${this.listaRepuestoRequerimientos.map((x: any, index: number) => `
                  <tr>
                    <td style="font-size: 12pt !important; padding: 5px;">${index + 1}</td>
                    <td style="font-size: 12pt !important; padding: 5px;">${x.codrep.replace(/^REP-\d{3}-\d{3}-\d{3}-/, '')}</td>
                    <td style="font-size: 12pt !important; padding: 5px;">
                      <span> <strong> ${x.nombreRep} </strong> </span>
                    </td>
                    <td style="font-size: 12pt !important; padding: 5px;">${x.cantidad}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 50px; padding: 25px">
                  <div style="display: flex; flex-direction: column;">
                    <div>RECIBÍ CONFORME</div>
                    <img  src="${this.urlImagenFirma}"
                            alt="Firma del encargado"
                            style="max-width: 250px; height: 80px;">
                    <div style="border-top: solid 3px black;"> 
                      
                      <div>${this.usuarioAsignadoBodega}</div>s
                      <div><strong>(BODEGA)</strong></div>
                    </div>
                  </div>
                  <div style="display: flex; flex-direction: column;">
                    <div>RECIBÍ CONFORME</div>
                    <div style="margin-top: 70px; border-top: solid 3px black;">  
                      <div> ${this.nombreTecnico} </div>
                      <div><strong>(TÉCNICO)</strong></div>
                    </div>
                  </div>
                  <div style="display: flex; flex-direction: column;">
                    <div><span>RECIBÍ CONFORME</span><br><span>REPUESTOS INSTALADOS</span><br><span>Y CAMBIADOS</span></div>
                    <div style="margin-top: 70px; border-top: solid 3px black;"> 
                      <div>${this.nombreCliente}</div>
                      <div><strong>(CLIENTE)</strong></div>
                      <br>
                      <div><strong>Fecha:_________________________</strong></div>
                      <br>
                      <div><strong>Hora: _________________________</strong></div>
                    </div>
                  </div>
          </div>
          <div style="width: 100%; position: fixed; bottom: 5px;">
              <div style="width: 100%; height:7px; background: green;"></div>
              <div style="">
                  <span style="text-align: left; color: black; font-size: 7pt !important;">
                        GUAYAQUIL ${this.direccion} * ${this.telf1} - ${this.telf2} * ${this.email}
                  </span>
              </div>
          </div>
        </div>
      `);
      this.renderer.appendChild(cotizacionContainer, nuevoElemento);
    }
  }
  //#endregion

  //#region [REPORTE TECNICO INICIO]
  generarReporteTecnico() {
    this.tipoArchivo = 'REPORTE TECNICO';
    let xareaRep: any = <HTMLDivElement>document.getElementById('area-rep');
    xareaRep.style.width = '100%';
    // Obtén el contenedor usando ElementRef y Renderer2
    const cotizacionContainer = this.el.nativeElement.querySelector('#cotizacion');
    if (cotizacionContainer) {
      // Limpia el contenido anterior del contenedor
      cotizacionContainer.innerHTML = '';
      let repuestosUtilizadosHTML = '';
      if (this.listaRepuestoRequerimientos && this.listaRepuestoRequerimientos.length > 0) {
        repuestosUtilizadosHTML = `
              <div style="width: 100%;">
                  <div style="text-align: center;
                              border: solid 1px gray;
                              padding: 5px;
                              display: flex;
                              justify-content: center;
                              align-content: center;">
                              <span>
                                  <strong> REPUESTOS UTILIZADOS </strong>
                              </span>
                  </div>
              </div>`;
      }

      // Define la sección de la tabla condicionalmente
      let tablaRepuestosHTML = '';
      if (this.listaRepuestoRequerimientos && this.listaRepuestoRequerimientos.length > 0) {
        // Genera las filas de la tabla usando .map()
        const filasTabla = this.listaRepuestoRequerimientos.map((rep: any) => `
                      <tr>
                          <td style="border: solid 1px gray; padding: 3px;">${rep.cantidad}</td>
                          <td style="border: solid 1px gray; padding: 3px;">${rep.codrep}</td>
                          <td style="border: solid 1px gray; padding: 3px;">
                              Nombre: <strong>${rep.nombreRep}</strong> <strong> > </strong>
                              <span>Marca:</span> <strong>${rep.marcaRepuesto}</strong>
                          </td>
                          <td style="border: solid 1px gray; 3px;"">
                              <div style="display: flex; justify-content: center;">
                                  <div style="width: 10px; height: 10px; border: solid 2px #444;"></div>
                              </div>
                          </td>
                          <td style="border: solid 1px gray; 3px;"">
                              <div style="display: flex; justify-content: center;">
                                  <div style="width: 10px; height: 10px; border: solid 2px #444;"></div>
                              </div>
                          </td>
                      </tr>
                  `).join('');

        // HTML completo de la tabla
        tablaRepuestosHTML = `
                      <div style="width: 100%; margin-bottom: 15px;">
                          <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
                              <thead style="background-color: #333; color: white;">
                                  <tr>
                                      <th style="border: 1px solid black; padding: 5px;">CANT</th>
                                      <th style="border: 1px solid black; padding: 5px;">N. PARTE</th>
                                      <th style="border: 1px solid black; padding: 5px;">DESCRIPCIÓN</th>
                                      <th style="border: 1px solid black; padding: 5px;">SOLICITADO</th>
                                      <th style="border: 1px solid black; padding: 5px;">UTILIZADO</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  ${filasTabla}
                              </tbody>
                          </table>
                      </div>
                  `;
      }

      // Crea un nuevo elemento div
      const nuevoElemento = this.renderer.createElement('div');
      // Añade contenido HTML al nuevo elemento
      this.renderer.setProperty(nuevoElemento, 'innerHTML', `
            <style> * { font-family: arial; font-size: 8pt; color: black; } </style>
            <div style="width: 1180px; padding: 45px;">
                <div style="display: flex; justify-content: space-between;">
                    <div style="border: solid 1px gray; padding: 15px; display: flex; justify-content: center; align-items: center; width: 50%;">
                        <img src="../../../../assets/logotipo/descarga.png"
                             width="200px"
                             height="110px">
                    </div>
                    <div style="border: solid 1px gray; padding: 15px; display: flex; justify-content: center; align-items: center; width: 50%;">
                        <div style="display: flex; flex-direction: column; text-align: center;">
                            <h2 style="margin: 0px;">
                                <strong style="font-size: 13pt !important;">REPORTE TÉCNICO</strong>
                            </h2>
                            <hr style="margin: 0px; padding: 0px; border: solid 2px gray;">
                            <h1 style=" color: red !important; margin: 0px;">
                                <strong style="font-size: 21pt !important;"> #${this.tipoMantenimientoCorto}</strong>
                            </h1>
                            <hr style="margin: 0px; padding: 0px; border: solid 2px gray;">
                            <h4 style="margin: 0px; ">
                                <strong style="font-size: 11pt !important;">
                                  CASH MACHINE SERVICE C. LTDA.
                                </strong>
                            </h4>
                        </div>
                    </div>
                </div>
                <div style="display: flex; justify-content: center; align-content: center; width: 100%; margin-top: 15px;">
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <div style="display: flex; flex-direction: column; width: 50%; border: solid 1px gray; padding: 5px;">
                            <small style="color: black; font-size: 5pt !important;">INSTITUCIÓN / BANCO</small>
                            <span>
                                <strong> ${this.nombreCliente} </strong>
                            </span>
                        </div>
                        <div style="width: 25%; display: flex; flex-direction: column; border: solid 1px gray; padding: 5px;">
                            <small style="color: black; font-size: 5pt !important;">FECHA</small>
                            <strong>${this.fechaFormateada}</strong>
                        </div>
                        <div style="width: 25%; display: flex; flex-direction: column; border: solid 1px gray; padding: 5px;">
                            <small style="color: black; font-size: 5pt !important;">HORA DE INGRESO</small>
                            <span></span>
                        </div>
                    </div>
                </div>
                <div style="display: flex; justify-content: center; align-content: center; width: 100%;">
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <div style="display: flex; flex-direction: column; width: 25%; border: solid 1px gray; padding: 5px;">
                            <small style="color: black;font-size: 5pt !important;">CIUDAD/PROVINCIA</small>
                            <span>
                                <strong>${this.provinciaAgencia}</strong>
                            </span>
                        </div>
                        <div style="width: 50%; display: flex; flex-direction: column; border: solid 1px gray; padding: 5px;">
                            <small style="color: black;font-size: 5pt !important;">AGENCIA/OFICINA</small>
                            <span>
                                <strong>${this.nombreAgencia}</strong>
                            </span>
                        </div>
                        <div style="width: 25%; display: flex; flex-direction: column; border: solid 1px gray; padding: 5px;">
                            <small style="color: black;font-size: 5pt !important;">HORA DE SALIDA</small>
                            <span></span>
                        </div>
                    </div>
                </div>
                <div style=" display: flex; justify-content: center; align-content: center; width: 100%;">
                    <strong> DATOS DEL EQUIPO </strong>
                </div>
                <div style="margin-top: 5px; display: flex; justify-content: center; align-content: center; width: 100%;">
                    <div style="border: solid 1px gray; padding: 5px; display: flex; justify-content: center; align-content: center; flex-direction: column; width: 40%;">
                        <small style="color: black;font-size: 5pt !important;">DESCRIPCIÓN</small>
                        <span>
                            <strong> ${this.tipoMaquina} </strong>
                        </span>
                    </div>
                    <div style="border: solid 1px gray; padding: 5px; display: flex; justify-content: center; align-content: center; flex-direction: column; width: 30%;">
                        <small style="color: black;font-size: 5pt !important;">CONTADOR/INICIAL/FINAL</small>
                        <span>
                            <strong> ${this.contadorinicial} / _ _ _ _ _ _ _ _ _  </strong>
                        </span>
                    </div>
                    <div style="border: solid 1px gray; padding: 5px; display: flex; justify-content: center; align-content: center; flex-direction: column; width: 30%;">
                        <small style="color: black;font-size: 5pt !important;">COD. CE.</small>
                        <span> ${this.codigobp} </span>
                    </div>
                </div>
                <div style=" width: 100%; display: flex; justify-content: center; margin-bottom: 20px; ">
                    <div style="border: solid 1px gray; padding: 5px; display: flex; justify-content: center; align-content: center; flex-direction: column; width: 30%;">
                        <small style="color: black; font-size: 5pt !important;">MARCA</small>
                        <span>
                            <strong> ${this.marca} </strong>
                        </span>
                    </div>
                    <div style="border: solid 1px gray; padding: 5px; display: flex; justify-content: center; align-content: center; flex-direction: column; width: 30%;">
                        <small style="color: black; font-size: 5pt !important;">MODELO</small>
                        <span>
                            <strong> ${this.modelo} </strong>
                        </span>
                    </div>
                    <div style="border: solid 1px gray; padding: 5px; display: flex; justify-content: center; align-content: center; flex-direction: column; width: 20%;">
                        <small style="color: black; font-size: 5pt !important;">NO. SERIE</small>
                        <span>
                            <strong>
                                ${this.nSerieEquipo}
                            </strong>
                        </span>
                    </div>
                    <div style="border: solid 1px gray; padding: 5px; display: flex; justify-content: center; align-content: center; flex-direction: column; width: 20%;">
                        <small style="color: black; font-size: 5pt !important;">COD. INV</small>
                        <span> 
                            <strong> ${this.ninventario} </strong>
                        </span>
                    </div>
                </div>
                <div style="width: 100%; display: flex; justify-content: center;">
                    <div style="border: solid 1px gray; padding: 5px; display: flex; justify-content: center; align-content: center; flex-direction: column; width: 50%;">
                        <small style="color: black; font-size: 5pt !important;">DESCRIPCIÓN DEL SERVICIO:</small>
                        <span> 
                            <strong> ${this.serieTicket} </strong>
                        </span>
                    </div>
                    <div style="border: solid 1px gray; padding: 5px; display: flex; justify-content: center; align-content: center; flex-direction: column; width: 50%;">
                        <small style="color: black; font-size: 5pt !important;">ESTADO DEL EQUIPO:</small>
                        <span> 
                            
                        </span>
                    </div>
                </div>
                <div style="display: flex; width: 100%; justify-content: space-between; margin-top: 15px;">
                    <div style="border: solid 1px gray; padding: 5px; display: flex; justify-content: center; align-content: center; flex-direction: column; width: 50%;">
                        <span> 
                            <strong> OBSERVACIONES </strong>
                        </span>
                    </div>
                    <div style="border: solid 1px gray; padding: 5px; display: flex; justify-content: center; align-content: center; flex-direction: column; width: 50%;">
                        <span> 
                            <strong> CHECKLIST MANTENIMIENTO </strong>
                        </span>
                    </div>
                </div>
                <div style="display: flex; width: 100%; justify-content: space-between; margin-bottom: 15px;">
                    <div style="border: solid 1px gray; padding: 5px; display: flex; justify-content: center; align-content: center; flex-direction: column; width: 50%;">
                        <div style="border-bottom: solid 2px gray;
                                    border-bottom: dashed 1px gray;
                                    
                                    height: 15px;
                                    width: 100%;"></div>
                        <div style="border-bottom: solid 2px gray;
                                    border-bottom: dashed 1px gray;                                    
                                    height: 15px;
                                    width: 100%;"></div>
                        <div style="border-bottom: solid 2px gray;
                                    border-bottom: dashed 1px gray;
                                    height: 15px;                                    
                                    width: 100%;"></div>
                        <div style="border-bottom: solid 2px gray;
                                    border-bottom: dashed 1px gray;
                                    height: 15px;                                    
                                    width: 100%;"></div>
                        <div style="border-bottom: solid 2px gray;
                                    border-bottom: dashed 1px gray;
                                    height: 15px;                                    
                                    width: 100%;"></div>
                        <div style="border-bottom: solid 2px gray;
                                    border-bottom: dashed 1px gray;
                                    height: 15px;                                    
                                    width: 100%;"></div>
                        <div style="border-bottom: solid 2px gray;
                                    border-bottom: dashed 1px gray;
                                    height: 15px;                                    
                                    width: 100%;"></div>
                        <div style="border-bottom: solid 2px gray;
                                    border-bottom: dashed 1px gray;
                                    height: 15px; 
                                    
                                    width: 100%;"></div>
                    </div>
                    <div style="border: solid 1px gray; padding: 5px; display: flex; justify-content: center; align-content: center; flex-direction: column; width: 50%;">
                        ${this.listaCheckListaMantenimiento.map((checkList: any) =>
        `<small style="display: flex; justify-content: space-between; margin: 3px;"> 
                                <span>${checkList.nombre}</span>
                                <span>
                                    <div style="width: 10px; height: 10px; border: solid 2px #444;"></div>
                                </span>
                            </small>`
      ).join('')}
                    </div>
                </div>
                ${repuestosUtilizadosHTML}

                ${tablaRepuestosHTML}

                <div style="width: 100%; display: flex; justify-content: space-between; margin-top: 20px;">
                    <div style="border: solid 1px gray;
                                padding: 10px;
                                display: flex;
                                justify-content: center;
                                align-content: center;
                                flex-direction: column;
                                width: 50%;">
                        <span> 
                            <strong> TÉCNICO EN SERVICIO C.M.S. </strong>
                        </span>
                    </div>
                    <div style="border: solid 1px gray;
                                padding: 10px;
                                display: flex;
                                justify-content: center;
                                align-content: center;
                                flex-direction: column;
                                width: 50%;">
                        <span> 
                            <strong> FIRMA AUTORIZADA DE LA AGENCIA </strong>
                        </span>
                    </div>
                </div>
                <div style="width: 100%; display: flex; justify-content: space-between;">
                    <div style="border: solid 1px gray;
                                padding: 5px;
                                display: flex;
                                justify-content: center;
                                align-content: center;
                                flex-direction: column;
                                width: 50%;">
                        <div style="height: 100px;"></div>
                    </div>
                    <div style="border: solid 1px gray;
                                padding: 5px;
                                display: flex;
                                justify-content: center;
                                align-content: center;
                                flex-direction: column;
                                width: 50%;">
                        <div style="height: 100px;"></div>
                        <small style="font-size: 8pt; color: black;">
                            Previo a la firma de conformidad se llenan la
                            <strong>
                              HORA DE INGRESO Y DE SALIDA
                            </strong>
                        </small>
                    </div>
                </div>
                <div style="width: 100%; display: flex; justify-content: space-between;">
                    <div style="border: solid 1px gray; padding: 5px; display: flex; justify-content: center; align-content: center; flex-direction: column; width: 50%;">
                        <small> 
                            Nombre: <strong> ${this.nombreTecnico} / ${this.cedulaTecnico} </strong>
                        </small>
                    </div>
                    <div style="border: solid 1px gray; padding: 5px; display: flex; justify-content: center; align-content: center; flex-direction: column; width: 50%;">
                        <small> 
                            Nombre:
                        </small>
                    </div>
                </div>
                <div style="width: 100%; position: fixed; bottom: 5px;">
                    <div style="border-top: solid 10px green;  width: 100%;"></div>
                    <div style="display: flex; justify-content: center; width: 100%; margint-top: 10px;">
                        <span style="text-align: center; color: black; font-size: 7pt !important;">
                              GUAYAQUIL ${this.direccion} * ${this.telf1} - ${this.telf2} * ${this.email}
                        </span>
                    </div>
                </div>
            </div>
            `);
      this.renderer.appendChild(cotizacionContainer, nuevoElemento);
    }
  }
  //#endregion

  // #region [COTIZACION]
  generarCotizacion() {
    this.tipoArchivo = 'COTIZACION';
    let xareaRep: any = <HTMLDivElement>document.getElementById('area-rep');
    xareaRep.style.width = '100%';
    // Obtén el contenedor usando ElementRef y Renderer2
    const cotizacionContainer = this.el.nativeElement.querySelector('#cotizacion');
    if (cotizacionContainer) {
      // Limpia el contenido anterior del contenedor
      cotizacionContainer.innerHTML = '';
      // Crea un nuevo elemento div
      const nuevoElemento = this.renderer.createElement('div');
      // Añade contenido HTML al nuevo elemento
      this.renderer.setProperty(nuevoElemento, 'innerHTML', `
        <style> * { font-family: arial; color: black !important; font-size: 14pt; }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid black;
            padding: 5px;
            text-align: center;
          }
          th {
            background-color: black;
            color: white;
          }
        </style>
        <div style="width: 1180px; padding: 60px; margin-top: 25px;">
        <div style="display: flex; justify-content: space-between;">
            <div style="width: 50%; display: flex; justify-content: center; align-items: center;">
              <img src="../../../../assets/logotipo/descarga.png" width="250px" height="110px">
            </div>
            <div style="width: 50%; display: flex; justify-content: center; align-items: center; flex-direction: column;">
              <div style=" height: 35px; display: flex; justify-content: center; align-items: center;">
                <span><strong style="font-size: 15pt; color: black;">COTIZACIÓN</strong></span>
              </div>
              <div style=" border-bottom: solid 4px gray; border-top: solid 4px gray; display: flex; justify-content: center; align-items: center; height: 35px; ">
                <strong style="font-size: 25pt !important; color: red !important;">#${this.nomeclaturaTipoMantenimiento}-${this.idRequer.toString().padStart(10, '0')}</strong>
              </div>
              <div style="font-size: 12pt; display: flex; justify-content: center; align-items: center; height: 35px;">
                <span style="color: black !important;">CASH MACHINE SERVICE C. LTDA.</span>
              </div>
            </div>
          </div>
          <div style="margin-top: 45px; display: flex; justify-content: space-between; padding: 25px">
            <div style="display: flex; flex-direction: column; align-items: start;">
              <span style="font-size: 12pt">
                <strong>${this.tituloLlamar}</strong>
              </span>
              <span style="font-size: 12pt">
                ${this.replegal}
              </span>
              <span style="font-size: 14pt">
                <strong>${this.nombreCliente}</strong>
              </span>
            </div>
            <div style="display: flex; justify-content: end; align-items: center;">
              <span style="font-size: 12pt">
                <strong>Guayaquil, ${this.fechaFormateada}</strong>
              </span>
            </div>
          </div>
          <div style="margin-top: 12px; padding: 25px;">
            <span style="font-size: 12pt;">
              ${this.textoCotizacion}:
            </span>
          </div>
          <div style="margin-top: 5px; padding: 15px;">
            <div style="width: 100%;  ">
              <table style="width: 100%;"> 
                <thead style="background: black;">
                  <th style="font-size: 12pt !important; color: white;">SUCURSAL/AGENCIA</th>
                  <th style="font-size: 12pt !important; color: white;">MARCA</th>
                  <th style="font-size: 12pt !important; color: white;">MODELO</th>
                  <th style="font-size: 12pt !important; color: white;">N. SERIE</th>
                  <th style="font-size: 12pt !important; color: white;">INVENTARIO</th>
                  <th style="font-size: 12pt !important; color: white;">N. BILLETES / <br>MONEDAS CONTADAS</th>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: 5px; font-size: 12pt;">${this.nombreAgencia}</td>
                    <td style="padding: 5px; font-size: 12pt;">${this.nombreMarcaEquipo}</td>
                    <td style="padding: 5px; font-size: 12pt;">${this.nombreModeloEquipo}</td>
                    <td style="padding: 5px; font-size: 12pt;">${this.nserie}</td>
                    <td style="padding: 5px; font-size: 12pt;">${this.ninventario}</td>
                    <td style="padding: 5px; font-size: 12pt; text-align: right;">${this.contadorfinal}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div style="padding: 15px;">
            <div style="width: 100%;">
              <table style="width: 100%;">
                <thead style="background: black;">
                  <th style="font-size: 12pt !important; color: white;">CANT.</th>
                  <th style="font-size: 12pt !important; color: white;">N. PARTE</th>
                  <th style="font-size: 12pt !important; color: white;">DESCRIPCIÓN</th>
                  <th style="font-size: 12pt !important; color: white;">P. U.</th>
                  <th style="font-size: 12pt !important; color: white;">TOTAL</th>
                </thead>
                <tbody>
                    ${this.listaCotizacion.map((x: any) => `
                      <tr>
                        <td style="font-size: 12pt !important; padding: 5px;">${x.cantidad}</td>
                        <td style="font-size: 12pt !important; padding: 5px;">${x.codrep.replace(/^REP-\d{3}-\d{3}-\d{3}-/, '')}</td>
                        <td style="font-size: 12pt !important; padding: 5px;">
                          <div style="display: flex; flex-direction: column;">
                            <span> <strong> ${x.nombreRep} </strong> </span>
                          </div>
                        </td>
                        <td style=" font-size: 12pt !important; padding: 5px; text-align: right;">
                          <strong>$ ${x.preUnitarioSinIva.toFixed(2)}</strong>
                        </td>
                        <td style=" font-size: 12pt !important; padding: 5px; text-align: right;">
                          <strong>$ ${x.totalSinIva.toFixed(2)}</strong>
                        </td>
                      </tr>
                    `).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 20px;">
              <div>
                  <span style="font-size: 14pt !important;">
                      Esperamos su vuestra grata orden,
                  </span>
                  <br>
                  <strong Style="font-size: 14pt !important;">
                      Atentamente,
                  </strong>
              </div>
              <div style=" display: flex; flex-direction: column; font-size: 15pt; width: 270px;">
              <div style="display: flex; justify-content: space-between; padding: 5px; border-bottom: dashed 1px gray;">
                  <div>SUBTOTAL</div>
                  &nbsp;
                  <div>
                      <strong>${this.subTotal.toFixed(2)}</strong>
                  </div>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px; border-bottom: dashed 1px gray;">
                  <div>I.V.A. <strong>(${this.iva}%)</strong> : </div>
                  &nbsp;
                  <div>
                      <strong>${this.totalIVA.toFixed(2)}</strong>
                  </div>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px; border-bottom: dashed 1px gray;">
                  <div>TOTAL:</div>
                  &nbsp;
                  <div>
                      <strong>${this.totalCotizacion.toFixed(2)}</strong>
                  </div>
              </div>
          </div>
        </div>
        <div style="width: 100%; display: flex; justify-content: center; margin-top: 5px;">
          <div style="width: 100%; display: flex; justify-content: space-between;">
               <div style="display: flex; flex-direction: column; font-size: 7pt; text-align: left;">
                    <div>
                      <img src="../../../../assets/firmas/Firma-Daniel-Davila.png" width="250px" height="100px">
                    </div>
                    <div style="display: flex; flex-direction: column;">
                      <span>
                        <strong>&nbsp;&nbsp; DANIEL E. DÁVILA</strong>
                      </span>
                      <span>
                        <small>&nbsp;&nbsp; Presidente</small>
                      </span>
                    </div>
               </div>
               <div style="display: flex; justify-content: end; align-items: end; font-size: 7pt; text-align: right;">
                    <span style="display: flex; flex-direction: column;">
                      <hr style="width: 100%; border: solid 2px gray !important;">
                      <strong>FIRMA O SELLO DE APROBACIÓN</strong>
                    </span>
               </div>
          </div>
        </div>
        <div style="width: 100%; position: fixed; bottom: 1px;">
            <div style="border-top: solid 5px green;  width: 100%;"></div>
            <div style="">
                <span style="text-align: left; color: black; font-size: 7pt !important;">
                      GUAYAQUIL ${this.direccion} * ${this.telf1} - ${this.telf2} * ${this.email}
                </span>
            </div>
        </div>
        </div>
      `);
      // Agrega el nuevo elemento al contenedor
      this.renderer.appendChild(cotizacionContainer, nuevoElemento);
    } else {
      console.error('No se encontró el elemento con id "cotizacion"');
    }
  }
  // #endregion

  async descargarPDF() {
    this.mensajeSpinner = 'GENERANDO PDF UN MOMENTO POR FAVOR...';
    this._show_spinner = true;
    // 1. Determinar qué HTML generar y generarlo, asegurando que el contenido esté en el DOM.
    // La variable `this.data.type` determina si es COTIZACION, REPTEC o NOTAENTREGA.
    switch (this.data.type) {
      case 'COTIZACION':
        this.generarCotizacion();
        break;
      case 'REPTEC':
        this.generarReporteTecnico();
        break;
      case 'NOTAENTREGA':
      default:
        this.generarNotaDeEntrega();
        break;
    }

    const data = document.getElementById('cotizacion'); // Elemento a capturar

    if (data) {
      // --- PREPARACIÓN DEL DOM ANTES DE LA CAPTURA ---
      // 1.1 Ocultar el footer fijo de la Nota/Cotización para que no se duplique en cada página
      const footerElement = data.querySelector('div[style*="position: fixed"]');
      if (footerElement) {
        (footerElement as HTMLElement).style.display = 'none';
      }

      // 1.2 Ocultar el botón fijo de descarga (que está en el HTML fuera de #cotizacion)
      const fixedButton = document.querySelector('button[style*="position: fixed; bottom: 10px"]');
      if (fixedButton) {
        (fixedButton as HTMLElement).style.display = 'none';
      }

      // Se usa un pequeño timeout para asegurar que Angular haya actualizado el DOM
      setTimeout(async () => {
        // 2. CAPTURA DEL HTML A CANVAS
        const canvas = await html2canvas(data, {
          scale: 0.7, // Mejora la calidad
          logging: false,
          allowTaint: true,
          useCORS: true // Importante para cargar la imagen del logo y la firma
        });

        // 3. CONVERSIÓN DE CANVAS A PDF (con lógica de paginación)
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const imgWidth = 210; // Ancho A4 en mm
        const pageHeight = 297; // Alto A4 en mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {

          position = position - pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;

        }

        // 4. GENERACIÓN DEL NOMBRE DE ARCHIVO DINÁMICO
        const now = new Date();
        // Formato solicitado: MC-YYYYMMDDHHmmss (sin guiones ni slashes)
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const xidrequer = localStorage.getItem('idRequerimientoShow');
        const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
        const fileName = `MC-${xidrequer}-${this.tipoArchivo}-${timestamp}.pdf`;

        // 5. DESCARGA DEL ARCHIVO
        pdf.save(fileName);

        // --- RESTAURACIÓN DEL DOM ---
        // Vuelve a mostrar el footer y el botón fijo para la vista en pantalla
        if (footerElement) {
          (footerElement as HTMLElement).style.display = 'block';
        }
        if (fixedButton) {
          (fixedButton as HTMLElement).style.display = 'block';
        }

        this._show_spinner = false;
        this.mensajeSpinner = '';

      }, 50); // Pequeño retraso para asegurar el renderizado
    }
  }

  obtenerReptecCorr(id: number) {
    this.repTec.obtenerReporteTecnicoCorrectivo(id).subscribe({
      next: (x) => {
        this.listaReporteTecnicoCorrectivo = x;
        // console.warn('<<<<<<<<<<<<<<<<<<<<<<this.listaReporteTecnicoCorrectivo>>>>>>>>>>>>>>>>>>>>>>');
        // console.warn(this.listaReporteTecnicoCorrectivo);
      }, error: (e) => {
        console.error(e);
      }, complete: () => {

        this.serieTicket = this.listaReporteTecnicoCorrectivo[0]
          .serieTicket;
        this.idAgencia = this.listaReporteTecnicoCorrectivo[0]
          .idAgencia;
        this.nombreCliente = this.listaReporteTecnicoCorrectivo[0]
          .nombreCliente;
        this.nombreAgencia = this.listaReporteTecnicoCorrectivo[0]
          .nombreAgencia;
        this.nombreTecnico = this.listaReporteTecnicoCorrectivo[0]
          .nombreTecnico || 'No hay técnico asignado';
        this.cedulaTecnico = this.listaReporteTecnicoCorrectivo[0]
          .cedulaTecnico;
        this.provinciaAgencia = this.listaReporteTecnicoCorrectivo[0]
          .provinciaAgencia;
        this.tipoMantenimientoCorto = this.listaReporteTecnicoCorrectivo[0]
          .tipoMantenimientoCorto;
        this.nSerieEquipo = this.listaReporteTecnicoCorrectivo[0]
          .nSerieEquipo;
        this.tipoMaquina = this.listaReporteTecnicoCorrectivo[0]
          .tipoMaquina;
        this.capacidad = this.listaReporteTecnicoCorrectivo[0]
          .capacidad;
        this.marca = this.listaReporteTecnicoCorrectivo[0]
          .marca;
        this.modelo = this.listaReporteTecnicoCorrectivo[0]
          .modelo;
        this.contadorinicial = this.listaReporteTecnicoCorrectivo[0]
          .contadorfinal || 0;
        this.codigobp = this.listaReporteTecnicoCorrectivo[0]
          .codigobp;
        this.ninventario = this.listaReporteTecnicoCorrectivo[0]
          .ninventario;
        this.estadoEquipo = this.listaReporteTecnicoCorrectivo[0]
          .estadoEquipo;
        this.direccion = this.listaReporteTecnicoCorrectivo[0]
          .direccion;
        this.telf1 = this.listaReporteTecnicoCorrectivo[0]
          .telf1;
        this.telf2 = this.listaReporteTecnicoCorrectivo[0]
          .telf2;
        this.email = this.listaReporteTecnicoCorrectivo[0]
          .email;

        /** =============================================
         *  ========================================= */
        //CHECKLIST ACTIVIDADES MANTENIMIENTOS
        this.obtenerDataMasterCheckList();
        /** =============================================
         *  ========================================= */
        // REPUESTOS
        this.obtenerRepuestosRequerimientos(id);
        /** =============================================
         *  ========================================= */

        this._show_spinner = true;
        setTimeout(() => {
          this.generarReporteTecnico()
          this._show_spinner = false;
        }, 2000);

      }
    })
  }
  usuarioAsignadoBodega: string = '';
  urlImagenFirma: string = '';
  listaNotaRepuestos: any = [];
  obtenerNotaRepuestos(idTicket: number) {
    // alert('Obteniendo nota repuestos')
    this._show_spinner = true;
    this.ccia = sessionStorage.getItem('ccia');
    this.cotiza.obtenerNotaReporteRepuestos(idTicket, this.ccia).subscribe({
      next: (x) => {
        this.listaNotaRepuestos = x;
        this.listaNotaRepuestos.filter((listaNotaRepuestos: any) => {
          this.serieTicket = 'CMS-' + listaNotaRepuestos.idTicket.toString().padStart(9, 0);
          this.idAgencia = listaNotaRepuestos.idAgencia;
          this.nombreCliente = listaNotaRepuestos.nombreCliente;
          this.nombreAgencia = listaNotaRepuestos.nombreAgencia;
          this.nombreTecnico = listaNotaRepuestos.nombreTecnico || 'No hay técnico asignado';
          this.cedulaTecnico = listaNotaRepuestos.cedulaTecnico;
          this.provinciaAgencia = listaNotaRepuestos.provinciaAgencia;
          this.tipoMantenimientoCorto = listaNotaRepuestos.tipoMantenimientoCorto;
          this.nSerieEquipo = listaNotaRepuestos.nSerieEquipo;
          this.tipoMaquina = listaNotaRepuestos.tipoMaquina;
          this.capacidad = listaNotaRepuestos.capacidad;
          this.marca = listaNotaRepuestos.marca;
          this.modelo = listaNotaRepuestos.modelo;
          this.contadorinicial = listaNotaRepuestos.contadorinicial;
          this.codigobp = listaNotaRepuestos.codigobp;
          this.ninventario = listaNotaRepuestos.ninventario;
          this.estadoEquipo = listaNotaRepuestos.estadoEquipo;
          this.direccion = listaNotaRepuestos.direccion;
          this.telf1 = listaNotaRepuestos.telf1;
          this.telf2 = listaNotaRepuestos.telf2;
          this.email = listaNotaRepuestos.email;
          this.usuarioAsignadoBodega = listaNotaRepuestos.usuarioAsignadoBodega;
          this.urlImagenFirma = listaNotaRepuestos.urlImagenFirma;
        })


        this._show_spinner = false;
      }, error: (e) => {
        console.error(e);
        this._show_spinner = false;
      },
      complete: () => {
        this._show_spinner = true;
        this.obtenerRepuestosRequerimientos(idTicket);
        setTimeout(() => {
          this.generarNotaDeEntrega();
          this._show_spinner = false;
        }, 2000);
      }
    })
  }

  obtenerCotizacion(idTicket: number) {
    this._show_spinner = true;
    this.ccia = sessionStorage.getItem('ccia');
    this.cotiza.obtenerCotizacion(idTicket, this.ccia).subscribe({
      next: (x: any) => {
        this.listaCotizacion = x;
        // console.warn('COTIZACION')
        // console.warn(this.listaCotizacion)
        this.nomeclaturaTipoMantenimiento = x[0].nomeclaturaTipoMantenimiento;
        this.id = x[0].id;
        this.codrep = x[0].codrep;
        this.idRequer = x[0].idRequer;
        this.estado = x[0].estado;
        this.cantidad = x[0].cantidad || 0;
        this.valorFinal = x[0].valorFinal || 0.0;
        this.nombreEmpresa = x[0].nombreEmpresa;
        this.descripcionEmpresa = x[0].descripcionEmpresa || '';
        this.descripcionRepuesto = x[0].descripcionRepuesto || '';
        this.direccion = x[0].direccion || '';
        this.cargo = x[0].cargo;
        this.nombrePersCargo = x[0].nombrePersCargo;
        this.logotipoUrl = x[0].logotipoUrl;
        this.textoCotizacion = x[0].textoCotizacion;
        this.replegal = x[0].replegal;
        this.replegalGhost = x[0].replegal;
        this.telf1 = x[0].telf1;
        this.telf2 = x[0].telf2;
        this.email = x[0].email;
        this.nombreMarcaEquipo = x[0].nombreMarcaEquipo;
        this.nombreModeloEquipo = x[0].nombreModeloEquipo;
        this.nombreTipoDeEquipo = x[0].nombreTipoDeEquipo;
        this.nombreRep = x[0].nombreRep || '--';
        this.nserie = x[0].nserie || '--';
        this.nombreCliente = x[0].nombreCliente || '--';
        this.nombreClienteGhost = x[0].nombreCliente || '--';
        this.nombreAgencia = x[0].nombreAgencia || '--';
        this.contadorinicial = x[0].contadorinicial || 0;
        this.contadorfinal = x[0].contadorfinal || 0;
        this.ninventario = x[0].ninventario || '--';
        this.codigobp = x[0].codigobp || '--';
        this.fechaActual = new Date();
        this.firma = this.env.apiCMSfile + x[0].firmaRepLegal;
        this.iva = x[0].iva;
        this._show_spinner = false;
      }, complete: () => {
        let ivaDeduc: any = ((this.iva / 100) + 1);
        this.listaCotizacion.forEach((cotiza: any) => {
          cotiza.preUnitarioSinIva = (cotiza.valorFinal / cotiza.cantidad) / ivaDeduc;
          cotiza.totalSinIva = cotiza.valorFinal / ivaDeduc;
        });
        // Calculamos el subTotal sumando todos los valores de totalSinIva
        this.subTotal = this.listaCotizacion.reduce((sum: number, cotiza: any) => sum + cotiza.totalSinIva, 0);
        // Calculamos el IVA
        this.totalIVA = this.subTotal * 0.15;
        // Calculamos el total de la cotización
        this.totalCotizacion = this.subTotal + this.totalIVA;
        this._show_spinner = true;
        setTimeout(() => {
          this.generarCotizacion();
          this._show_spinner = false;
        }, 2000);
      }, error: (e) => {
        console.error(e);
        this._show_spinner = false;
      }
    })
  }

}
