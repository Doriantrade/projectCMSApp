import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MantenimientoService } from '../tabla-help-desk/mantenimiento/services/mantenimiento.service';

@Component({
  selector: 'app-tecnicos-registrados',
  templateUrl: './tecnicos-registrados.component.html',
  styleUrls: ['./tecnicos-registrados.component.scss']
})
export class TecnicosRegistradosComponent implements OnInit, OnChanges {

  listaTecnicosTickets: any = [];
  _show_spinner: boolean = false;
  @Input() idRequerimiento: any;
  @Input() tecnicosEscuchados: any;

  constructor(private mant: MantenimientoService) { }

  ngOnInit(): void {
    this.obtenerTecnicosTicket();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idRequerimiento']) {
      this.obtenerTecnicosTicket();
    }
  }

  obtenerTecnicosTicket() {
    this._show_spinner = true;
    this.listaTecnicosTickets = [];
    // const idTicket: any = localStorage.getItem('idRequerimientoShow');
    this.mant.obtenerTecnicosTicket(this.idRequerimiento).subscribe({
      next: (x) => {
        this.listaTecnicosTickets = x;
      }, error: (e) => {
        this._show_spinner = false;
        if (e.status != 200) console.error(e);
      }, complete: () => {
        this.listaTecnicosTickets.filter((x: any) => {
          if (x.reasignacion == 0) {
            x.nombreReasignacion = 'NORMAL';
            x.colorReasignacion = 'green';
          } else if (x.reasignacion == 1) {
            x.nombreReasignacion = 'REASIGNADO';
            x.colorReasignacion = 'orange';
          }
        })
        this._show_spinner = false;
      }
    })
  }

}
