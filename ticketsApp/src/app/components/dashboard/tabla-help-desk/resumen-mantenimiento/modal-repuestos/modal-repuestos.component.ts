import { MantenimientoService } from '../../mantenimiento/services/mantenimiento.service';
import { MantenimientoComponent } from '../../mantenimiento/mantenimiento.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
})

@Component({
  selector: 'app-modal-repuestos',
  templateUrl: './modal-repuestos.component.html',
  styleUrls: ['./modal-repuestos.component.scss']
})
export class ModalRepuestosComponent implements OnInit {
  xcli:                 any;
  listaRepElegidos:     any = [];
  listRepuestos:        any = [];
  listRepuestosGhost:   any = [];
  modelRepuestos:       any = [];
  _show_spinner:        boolean = false;
  calculoTotalFactur:   number = 0.0;
  calculoSubTotales:    number = 0.0;
  cantidadDespachada:   number = 0;
  repuestoSearchForm = new FormGroup ({
    filter:            new FormControl()
  })
  
  constructor( public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mant: MantenimientoService,
    public dialogRef: MatDialogRef<MantenimientoComponent>) {}

  ngOnInit(): void {
    this.xcli = sessionStorage.getItem('codcli');
    this.obtenerRepuestos();
  }

  obtenerRepuestos() {
    this._show_spinner = true;
    this.listRepuestos = [];
    this.listRepuestosGhost = [];
    this.mant.obtenerRepuestos( this.xcli, 'CMS-001-2023' ).subscribe({
      next: (x) => {
        this.listRepuestos      = x;
        // console.warn('Repuestos obtenidos:', this.listRepuestos);
        this.listRepuestosGhost = x;
      }, error: (e) => {
        console.error(e);
        this._show_spinner = false;
      }, complete: () => {
        this.listRepuestos.filter( (lg:any) => {
          lg.cantDespacho = 0;
          lg.totalPVP = 0.0;
          lg.icon_calculo = 'hourglass_top';
          lg.color_calculo = 'orange';
          lg.desc_calculo = 'Sin cambio en stock';
          lg.cantStock = lg.cantRep;
          lg.colorRow = (!lg.activo  ? 'orangered' : 'yellowgreen');
          lg.iconRep = (!lg.activo  ? 'cancel' : 'done');
        })
        this._show_spinner = false;
      }
    })
  }

  cantidadDespacho(idCantDespacho: string, repuestos: any, event: any) {
    // Validación inicial del input
    let xCantidadDespacho = document.getElementById(idCantDespacho) as HTMLInputElement;
    // Convertir a número y manejar casos especiales
    let cantidad:any = this.parseNumberWithValidation(xCantidadDespacho.value);
    let precio = event ? this.parseNumberWithValidation(event.target.value) || repuestos.pvp : repuestos.pvp;
    // Validar y ajustar la cantidad
    cantidad = this.validateAndAdjustQuantity(cantidad, repuestos.cantRep);
    
    // Actualizar el valor en el input por si fue ajustado
    xCantidadDespacho.value = cantidad.toString();
    
    // Calcular stock actualizado (no puede ser negativo)
    repuestos.cantStock = Math.max(repuestos.cantRep - cantidad, 0);
    repuestos.cantDespacho = xCantidadDespacho.value;
    // Calcular valores financieros
    this.calculateFinancialValues(cantidad, precio, repuestos);
    
    this.actualizarRepuestos(repuestos, repuestos.cantStock, xCantidadDespacho.value);
    this.cantidadRepuestos();
    this.sumarTotales();
  }

  // Función auxiliar para parsear números con validación
  private parseNumberWithValidation(value: any): number {
      if (value === null || value === undefined || value === '') return 0;
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
  }

  // Función para validar y ajustar la cantidad
  private validateAndAdjustQuantity(quantity: number, maxQuantity: number): number {
      if (quantity < 0) return 0;
      if (quantity > maxQuantity) return maxQuantity;
      return quantity;
  }

    // Función para calcular los valores financieros
  private calculateFinancialValues(quantity: number, price: number, repuesto: any) {
      const calculoSubTotal = quantity * price;
      const calculoIva = calculoSubTotal * (repuesto.iva / 100);
      const calculoTotalIva = calculoSubTotal + calculoIva;
      repuesto.ivAvalor = parseFloat(calculoIva.toFixed(2));
      repuesto.totalPVP = parseFloat(calculoTotalIva.toFixed(2));
      repuesto.pvpIVA = parseFloat(calculoSubTotal.toFixed(2));
  }

  actualizarRepuestos(data:any, newValue:number, inputValue: any) {
    this._show_spinner = true;
    this.modelRepuestos = {
      codrep:              data.codrep,
      urlimagenA:          '',
      fecrea:              new Date(),
      usercrea:            data.usercrea,
      nombreRep:           data.nombreRep,
      codigo:              data.codigo,
      descripcion:         data.descripcion,
      codTipoMaquina:      data.codTipoMaquina,
      marca:               data.marca,
      modelo:              data.modelo,
      activo:              data.activo,
      marcaRep:            data.idMarcaRepuesto,
      estado:              1,
      codcia:              data.codcia,
      cantRep:             newValue,
      valorCompra:         data.valorCompra,
      porcentajeVenta:     data.porcentajeVenta,
      desccuentoAplicable: data.desccuentoAplicable,
      vidautil:            0
    }
    
    this.mant.actualizarRepuestos(data.codrep, this.modelRepuestos).subscribe({
      next: () => {
        this._show_spinner = false;
        this.listRepuestos.filter( (x:any) => {
          if( x.codrep == data.codrep ) {
            x.icon_calculo  = 'done';
            x.color_calculo = 'yellowgreen';
            x.desc_calculo  = 'Stock ha sido modificado con éxito';
          }})
      }, error: (e) => {
      console.error(e);
      this._show_spinner = false;
      Toast.fire({
        icon: 'error',
        timer: 3000,
        title: 'Algo ha pasado con la actualización de los valores de stock.'
      });
    }})
    
    if ( inputValue == 0 ) {
      this.listRepuestos.filter( (x:any) => {
        if ( x.codrep == data.codrep ) {
          x.icon_calculo = 'hourglass_top';
          x.color_calculo = 'orange';
          x.desc_calculo = 'Sin cambio en stock';
        }
      })
    }
  }

  updatedSelected = (cantidad: any, repuesto: any ) => {
    let selected = this.listaRepElegidos.find((item:any) => item.codrep === repuesto.codrep);
    let iva = ((cantidad * repuesto.pvp * repuesto.iva) / 100);
    let calculo = (cantidad * repuesto.pvp) + iva;
    selected.ivAvalor = iva.toFixed(2);
    selected.pvpIVA = calculo.toFixed(2);
    selected.totalPVP = calculo.toFixed(2);
  }
  
  cantidadRepuestos() {
    let arrStockTotal: any[] = [];
    if (this.listaRepElegidos.length != 0) {
      this.listaRepElegidos.forEach( (c:any) => {
        arrStockTotal.push(Number(c.cantDespacho));
      })
      this.cantidadDespachada = arrStockTotal.reduce( (acc,curr) => acc + curr, 0 );
    } else {
      this.cantidadDespachada = 0;
    }
  }

  sumarTotales() {
    let arrPVP:    any[] = [];
    let arrSubPVP: any[] = [];
    if (this.listaRepElegidos.length != 0) {
      this.listaRepElegidos.forEach((x: any) => arrPVP.push(Number(x.totalPVP)) );
      this.listaRepElegidos.forEach((m: any) => arrSubPVP.push(Number(m.pvpIVA)) );
      this.calculoTotalFactur = arrPVP.reduce(  (acc, curr) => acc + curr, 0 );
      this.calculoSubTotales = arrSubPVP.reduce((acc, curr) => acc + curr, 0 );
    } else {
      this.calculoTotalFactur = 0.0;
      this.calculoSubTotales = 0.0;
    }
  }

  selectRow(repuestos: any) {
    if ( repuestos.cantRep > 0 ) {
      repuestos.selected = !repuestos.selected;
      (repuestos.selected == true) 
        ? this.addReplacement(repuestos)
        : this.removeReplacement(repuestos);
      this.cantidadRepuestos();
      this.sumarTotales();
    }    
  }

  addReplacement = (repuestos: any) => {
    let selected = this.listaRepElegidos.find((item:any) => item.codrep === repuestos.codrep);
    if(!selected) {
      this.listaRepElegidos.push(repuestos);
    }
  }

  removeReplacement = (repuestos: any) => {
    let index = this.listaRepElegidos.findIndex((item:any) => item.codrep === repuestos.codrep);
    if(index >= 0) {
      this.listaRepElegidos.splice(index, 1);
    }
  }

filtroRepuestos() {
  let filter: any = this.repuestoSearchForm.controls['filter'].value;
  this.listRepuestos = this.listRepuestosGhost.filter (( item: any ) =>
    item.codigo.toLowerCase().includes(filter.toLowerCase())          ||
    item.nombreRep.toLowerCase().includes(filter.toLowerCase())       ||
    item.marcaRepuesto.toLowerCase().includes(filter.toLowerCase())   
  );
  this.currentPage = 1; // Resetear a la primera página al filtrar
}
  
  closeDialog() {
    this.listaRepElegidos = this.listaRepElegidos.filter((x:any) => x.cantDespacho > 0);
    this.dialogRef.close(this.listaRepElegidos);
  }

  // Agrega estas propiedades al inicio de tu clase
currentPage: number = 1;
itemsPerPage: number = 10; // Puedes ajustar este número según necesites

// Agrega estos métodos a tu clase
totalPages(): number {
  return Math.ceil(this.listRepuestos.length / this.itemsPerPage);
}

getPaginatedItems(): any[] {
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;
  return this.listRepuestos.slice(startIndex, endIndex);
}

getPages(): number[] {
  const pages: number[] = [];
  const total = this.totalPages();
  const maxVisible = 5; // Número máximo de páginas visibles en la paginación
  
  let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(total, start + maxVisible - 1);
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
}

getDisplayRange(): string {
  const start = (this.currentPage - 1) * this.itemsPerPage + 1;
  const end = Math.min(this.currentPage * this.itemsPerPage, this.listRepuestos.length);
  return `${start} a ${end}`;
}

setPage(page: number): void {
  if (page >= 1 && page <= this.totalPages()) {
    this.currentPage = page;
  }
}

previousPage(): void {
  if (this.currentPage > 1) {
    this.currentPage--;
  }
}

nextPage(): void {
  if (this.currentPage < this.totalPages()) {
    this.currentPage++;
  }
}

goToFirstPage(): void {
  this.currentPage = 1;
}

goToLastPage(): void {
  this.currentPage = this.totalPages();
}
  
}
