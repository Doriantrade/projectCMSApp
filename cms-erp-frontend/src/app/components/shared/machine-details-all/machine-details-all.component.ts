import { Component, Input, OnInit } from '@angular/core';
import { MachineAllDetailsService } from './services/machine-all-details.service';

@Component({
  selector: 'app-machine-details-all',
  templateUrl: './machine-details-all.component.html',
  styleUrls: ['./machine-details-all.component.scss']
})
export class MachineDetailsAllComponent implements OnInit {
  @Input() codprod!: string;
  constructor( private mHistory: MachineAllDetailsService ) { }

  ngOnInit(): void {
    // 'MAQ-002-JZKoJRBenGi50Vo'
    this.obtenerHistoricoMaquinaria(this.codprod);
  
  }

  ngAfterViewInit(): void {
    this.obtenerHistoricoMaquinaria(this.codprod);
  }


  listahistoricomaquinaria:any = [];
  listahistoricomaquinariaGhost:any = [];

  nserie:string = '';
  marca:string = '';
  modelo:string = '';
  imagenCliente:any;
  nombreAgencia:string = '';
  nombreCLiente:string = '';
  obtenerHistoricoMaquinaria(codprod:string) {

    this.mHistory.obtenerMaquinaHistorico(codprod).subscribe({

      next: (x) => {
        this.listahistoricomaquinaria = x;
        this.listahistoricomaquinariaGhost = x;
        console.warn('listahistoricomaquinaria');
        console.warn(this.listahistoricomaquinaria);
      }, error: (e) => {
        console.error(e);
      }, complete: () => {
        this.nserie = this.listahistoricomaquinaria[0].nserie;
        this.marca = this.listahistoricomaquinaria[0].marca;
        this.modelo = this.listahistoricomaquinaria[0].modelo;
        this.imagenCliente = this.listahistoricomaquinaria[0].iagenCliente;
        this.nombreCLiente = this.listahistoricomaquinaria[0].nombreCliente;
        this.nombreAgencia = this.listahistoricomaquinaria[0].nombreAgencia;
      }

    })

  }


  filtroTexto:string = '';
  filtrarElementos() {

  }


}
