import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MantenimientoService } from '../mantenimiento/services/mantenimiento.service';

@Component({
  selector: 'app-resumen-mantenimiento',
  templateUrl: './resumen-mantenimiento.component.html',
  styleUrls: ['./resumen-mantenimiento.component.scss']
})
export class ResumenMantenimientoComponent implements OnInit, OnChanges {

  _show_spinner: boolean = false;
  @Input() idRequerimiento: any;
  @Input() manetenimientoEsuchado: any;
  @Input() refreshList: any;


  listaMantenimientosAgregados: any = [];
  constructor(private mant: MantenimientoService) { }

  ngOnInit(): void {
    this.obtenerMantenimientosAgregados();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idRequerimiento']) {
      this.obtenerMantenimientosAgregados();
    }

    if (this.refreshList) {
      this.eliminarMantenimiento()
    }

  }


  eliminarMantenimiento() {

    this.listaMantenimientosAgregados.filter((x: any) => {
      console.table(x);
      if (x.id == this.refreshList.idResMant) {
        const index = this.listaMantenimientosAgregados.indexOf(x);
        if (index > -1) this.listaMantenimientosAgregados.splice(index, 1);
      }
    });

  }

  obtenerMantenimientosAgregados() {
    this._show_spinner = true;
    // const idTicket: any = localStorage.getItem('idRequerimientoShow');
    this.mant.obtenerResumenMantenimiento(this.idRequerimiento).subscribe({
      next: (x) => {
        this.listaMantenimientosAgregados = x;
      },
      error: (e) => {
        this._show_spinner = false;
        console.error(e);
      },
      complete: () => {
        this._show_spinner = false;
      }
    })
  }

}
