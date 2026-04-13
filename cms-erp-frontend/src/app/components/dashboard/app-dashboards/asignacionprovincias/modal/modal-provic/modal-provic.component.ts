import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AsignacionProvinciasComponent } from '../../asignacion-provincias/asignacion-provincias.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedService } from 'src/app/components/shared/services/shared.service';
import Swal from 'sweetalert2'
/* Imports */
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AsignacionprovinciasService } from '../../asignacion-provincias/services/asignacionprovincias.service';
import { elementAt } from 'rxjs';

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

/* Chart code */
// Themes begin
// Themes end

@Component({
  selector: 'app-modal-provic',
  templateUrl: './modal-provic.component.html',
  styleUrls: ['./modal-provic.component.scss']
})

export class ModalProvicComponent implements OnInit {
  pMod: number = 4;

  _user: boolean = true;
  columnHead: any = [ 'cod', 'NombreProvincia', 'action'];
  _func: string = 'expand_less';
  public dataSource!: MatTableDataSource<any>;
  public dataSourceCantones!: MatTableDataSource<any>;
  _show_spinner: boolean = false;
  _prov_sel: string = '';
  _dis_button: boolean = true;

  constructor( private DataMaster: SharedService, private asprov: AsignacionprovinciasService, public dialogRef: MatDialogRef<AsignacionProvinciasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any ) { }

  @ViewChild(MatPaginator)
  paginator!: MatPaginator; 

  @ViewChild(MatPaginator)
  paginatorCanton!: MatPaginator; 


  ccia: any ;

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

    console.warn(this.data.imagenPerfil);
    this.ccia = sessionStorage.getItem('codcia');
    this.getProvincias();
    this.obtenerTecnicoProvincias();
    this.loadMap();
  }



  listProvincias: any = [];
  getProvincias() {
    this.DataMaster.getDataMaster('PRV00').subscribe(
      {
        next: (provincias) => {
          this.listProvincias = provincias;
          console.warn(this.listProvincias);
        },
        error: (e) => {
          console.error('ERROR AL TRAER LAS PROVINCIAS');
          console.error(e);
        }, complete: () => {
          this.dataSource = new MatTableDataSource(this.listProvincias);
          this.dataSource.paginator = this.paginator;
          ;
          if( this.listCantones.length > 0 ) this._dis_button = false;
        }
      }
    )
  }

  modelAsignacionGhost: any = [];
  asignarTodosCantones() {

    let xuser: any = sessionStorage.getItem('UserCod');  

    this.listCantones.filter( (element: any) => {
  
      this.modelAsignacion = {
        coduser: this.data.coduser,
        codcia:  this.ccia,
        codprov: this.provCodSel,
        codcanton: element.codigo,
        codmantenimiento: "",
        codusermod: xuser,
        fechainicio: new Date(),
        fechamod: new Date()
      }

      this._show_spinner = true;
    this.asprov.guardarAsignacionProvincias(this.modelAsignacion).subscribe({
      next: () => {
        Toast.fire({
          icon: 'success',
          title: 'Provincia agregada correctamente',
          timer: 1000,
          position: 'top-end'          
        })
        this._show_spinner = false;
      }, error: (e) => {
        this._show_spinner = false;
        console.error(e);
        Toast.fire({
          icon: 'error',
          title: 'No se ha podido agregar',
          timer: 2000,
          position: 'center'          
        })
      }, complete: () => {
        this.obtenerTecnicoProvincias();
        this._dis_button = true;
        // this.provCodSel = '';
        this.listCantones = [];
      }
    })

    })
  }


  funcHTML(id: string) {

    const html = <HTMLDivElement> document.getElementById(id) 
    const html2 = <HTMLDivElement> document.getElementById('bodyProv') 


    switch( this._func ) {
      case 'expand_less':
        this._func = 'expand_more';
        html.style.animationName = 'minimizar'
        this._user = false;
        html2.style.height = '400px';
        setTimeout(() => {
          html.style.transform = 'scale(0,0)';
        }, 1000);
        break;
      case 'expand_more':
        html.style.animationName = 'maximizar'
        html2.style.height = '210px';
        setTimeout(() => {
          html.style.transform = 'scale(1,1)';
          this._user = true;
        }, 1000);
        this._func = 'expand_less';
        break;
    }
  }

  eliminarTodasProvincias() {
    Swal.fire({
      title: 'Estás seguro?',
      text: "Esta acción es irreversible y podría provocar perdida de datos en otros procesos!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this._show_spinner = true;
        this.asprov.eliminarTecnicoProvinciaPorUsuario(this.data.coduser, this.ccia).subscribe({
          next: (x) => {
            this._show_spinner = false;
            Swal.fire(
              'Deleted!',
              'Provincias asignadas eliminadas en su totalidad',
              'success'
            )
          }, error: (e) => {
            console.error(e);
            this._show_spinner = false;
            Swal.fire(
              'Upps!',
              'No hemos podido eliminar la provincia',
              'error'
            )
          }, complete: () => {
            this.obtenerTecnicoProvincias();
            this._dis_button = false;
          } 
        })
      }
    })
  }

  listCantones: any = [];
  getCantones( data: any ) {
    this._prov_sel = data.nombre;

    // if(this.listCantones.length <= 0) this._dis_button = true;
    
    this.DataMaster.getDataMaster(data.codigo).subscribe({
      next: ( cantones ) => {
        this.listCantones = cantones;
        console.log(this.listCantones);
        if( this.listCantones.length > 0 ) this._dis_button = false;
      }, error: (e) => {
        console.error('ERROR AL TRAER LOS CANTONES');
      }, complete: () => {
        this.validacionSelProv();
        this.dataSourceCantones = new MatTableDataSource(this.listCantones);
        this.dataSourceCantones.paginator = this.paginatorCanton;
      }
    })
  }

  provCodSel: string = '';
  cantCodSel: string = '';
  modelAsignacion: any = [];

  validacionSelProv() {
    const faltantes = this.listCantones.filter((item1:any) => {
      return !this.listtecnicoProvincia.some((item2:any) => item2.nombreCanton.trim() === item1.nombre.trim());
    });
    
    console.log(faltantes);
    this.listCantones = faltantes;
    if (this.listCantones.length <= 0) this._dis_button = true;

  }

  validacionRep() {

    const isRepeated = this.listtecnicoProvincia.some((item: any) => {
      return item.codprov.toString().trim() === this.provCodSel && item.codcanton.toString().trim() === this.cantCodSel;
    });
  
    if (!isRepeated) {
      this.guardarAsignacionProv();
    } else {
      Toast.fire({
        icon: 'warning',
        title: 'Esta provincia ya ha sido agregada correctamente',
        timer: 1000,
        position: 'top-end'
      });
    }
  }


  guardarAsignacionProv() {

    let xuser: any = sessionStorage.getItem('UserCod');

    this.modelAsignacion = {
      coduser: this.data.coduser,
      codcia:  this.ccia,
      codprov: this.provCodSel,
      codcanton: this.cantCodSel,
      codmantenimiento: "",
      codusermod: xuser,
      fechainicio: new Date(),
      fechamod: new Date()
    }

    this._show_spinner = true;
    this.asprov.guardarAsignacionProvincias(this.modelAsignacion).subscribe({
      next: () => {
        console.warn(this.modelAsignacion);
        Toast.fire({
          icon: 'success',
          title: 'Provincia agregada correctamente',
          timer: 1000,
          position: 'top-end'          
        })
        this._show_spinner = false;
      }, error: (e) => {
        this._show_spinner = false;
        console.error(e);
        Toast.fire({
          icon: 'error',
          title: 'No se ha podido agregar',
          timer: 2000,
          position: 'center'          
        })
      }, complete: () => {
        this.obtenerTecnicoProvincias();
        // this._dis_button = true;
      }
    }) 
  }

  listtecnicoProvincia: any = [];
  cantidadprovincias:any =[];
  cantprov:number = 0;
  obtenerTecnicoProvincias() {
    if( this.listtecnicoProvincia.length > 0  ) this._dis_button = false;
    this.asprov.obtenerTecnicoProvincias(this.data.coduser, this.ccia, 1).subscribe({
      next:(tecnicoProvincia) => {
        this.listtecnicoProvincia = tecnicoProvincia;
        console.warn(this.listtecnicoProvincia);
      },error: (e) => {
        console.error(e);
      }
    })
    this.asprov.obtenerTecnicoProvincias(this.data.coduser, this.ccia, 2).subscribe({
      next:(tecnicoProvincia) => {
        this.cantidadprovincias = tecnicoProvincia;
        this.cantprov = this.cantidadprovincias.length;
        console.warn(this.cantidadprovincias);
      },error: (e) => {
        console.error(e);
      }
    })
  }

  eliminarProvincia(id:number) {

    Swal.fire({
      title: 'Estás seguro?',
      text: "Esta acción es irreversible y podría provocar perdida de datos en otros procesos!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this._show_spinner = true;
        this.asprov.eliminarTecnicoProvincia(id).subscribe({
          next: (x) => {
            this._show_spinner = false;
            Swal.fire(
              'Deleted!',
              'Provincia eliminada',
              'success'
            )
          }, error: (e) => {
            console.error(e);
            this._show_spinner = false;
            Swal.fire(
              'Upps!',
              'No hemos podido eliminar la provincia',
              'error'
            )
          }, complete: () => {
            this.obtenerTecnicoProvincias();
            this._dis_button = true;
            // console.warn(this.listtecnicoProvincia.length)
            if( this.listtecnicoProvincia.length <= 1 ) this._dis_button = false; 
          } 
        })
      }
    })
  
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applyFilterCantones(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceCantones.filter = filterValue.trim().toLowerCase();
  }

  loadMap() {
    
// let chart = am4core.create("chartdiv", am4maps.MapChart);


// try {
//     chart.geodata = am4geodata_worldHigh;
// }
// catch (e) {
//     chart.raiseCriticalError(new Error("Map geodata could not be loaded. Please download the latest <a href=\"https://www.amcharts.com/download/download-v4/\">amcharts geodata</a> and extract its contents into the same directory as your amCharts files."));
// }

// chart.projection = new am4maps.projections.Mercator();

// chart.homeZoomLevel = 1.2;
// chart.homeGeoPoint = {
//   latitude:  -1.831239,
//   longitude: -78.183406
// };

// // zoomout on background click
// chart.chartContainer.background.events.on("hit", function () { zoomOut() });

// let colorSet = new am4core.ColorSet();
// let morphedPolygon:any;

// // map polygon series (countries)
// let polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
// polygonSeries.useGeodata = true;
// specify which countries to include
// polygonSeries.include = ["IT", "CH", "FR", "DE", "GB", "ES", "PT", "IE", "NL", "LU", "BE", "AT", "DK"]

// // country area look and behavior
// let polygonTemplate = polygonSeries.mapPolygons.template;
// polygonTemplate.strokeOpacity = 1;
// polygonTemplate.stroke = am4core.color("#ffffff");
// polygonTemplate.fillOpacity = 0.5;
// polygonTemplate.tooltipText = "{name}";

// // desaturate filter for countries
// let desaturateFilter = new am4core.DesaturateFilter();
// desaturateFilter.saturation = 0.25;
// polygonTemplate.filters.push(desaturateFilter);

// // take a color from color set
// polygonTemplate.adapter.add("fill", function (fill, target) {
//     return colorSet.getIndex(target.dataItem.index + 1);
// })

// // set fillOpacity to 1 when hovered
// let hoverState = polygonTemplate.states.create("hover");
// hoverState.properties.fillOpacity = 1;

// // what to do when country is clicked
// polygonTemplate.events.on("hit", function (event) {
//     event.target.zIndex = 1000000;
//     selectPolygon(event.target);
// })

// // Pie chart
// let pieChart = chart.seriesContainer.createChild(am4charts.PieChart);
// // Set width/heigh of a pie chart for easier positioning only
// pieChart.width = 100;
// pieChart.height = 100;
// pieChart.hidden = true; // can't use visible = false!

// // because defauls are 50, and it's not good with small countries
// pieChart.chartContainer.minHeight = 1;
// pieChart.chartContainer.minWidth = 1;

// let pieSeries = pieChart.series.push(new am4charts.PieSeries());
// pieSeries.dataFields.value = "value";
// pieSeries.dataFields.category = "category";
// pieSeries.data = [{ value: 100, category: "First" }, { value: 20, category: "Second" }, { value: 10, category: "Third" }];

// let dropShadowFilter = new am4core.DropShadowFilter();
// dropShadowFilter.blur = 4;
// pieSeries.filters.push(dropShadowFilter);

// let sliceTemplate = pieSeries.slices.template;
// sliceTemplate.fillOpacity = 1;
// sliceTemplate.strokeOpacity = 0;

// let activeState:any = sliceTemplate.states.getKey("active");
// activeState.properties.shiftRadius = 0; // no need to pull on click, as country circle under the pie won't make it good

// let sliceHoverState:any = sliceTemplate.states.getKey("hover");
// sliceHoverState.properties.shiftRadius = 0; // no need to pull on click, as country circle under the pie won't make it good

// // we don't need default pie chart animation, so change defaults
// let hiddenState = pieSeries.hiddenState;
// hiddenState.properties.startAngle = pieSeries.startAngle;
// hiddenState.properties.endAngle = pieSeries.endAngle;
// hiddenState.properties.opacity = 0;
// hiddenState.properties.visible = false;

// // series labels
// let labelTemplate = pieSeries.labels.template;
// labelTemplate.nonScaling = true;
// labelTemplate.fill = am4core.color("#FFFFFF");
// labelTemplate.fontSize = 10;
// labelTemplate.background = new am4core.RoundedRectangle();
// labelTemplate.background.fillOpacity = 0.9;
// labelTemplate.padding(4, 9, 4, 9);
// labelTemplate.background.fill = am4core.color("#7678a0");

// // we need pie series to hide faster to avoid strange pause after country is clicked
// pieSeries.hiddenState.transitionDuration = 200;

// // country label
// let countryLabel = chart.chartContainer.createChild(am4core.Label);
// countryLabel.text = "Select a country";
// countryLabel.fill = am4core.color("#7678a0");
// countryLabel.fontSize = 40;

// countryLabel.hiddenState.properties.dy = 1000;
// countryLabel.defaultState.properties.dy = 0;
// countryLabel.valign = "middle";
// countryLabel.align = "right";
// countryLabel.paddingRight = 50;
// countryLabel.hide(0);
// countryLabel.show();

// // select polygon
// function selectPolygon(polygon:any) {
//     if (morphedPolygon != polygon) {
//         let animation = pieSeries.hide();
//         if (animation) {
//             animation.events.on("animationended", function () {
//                 morphToCircle(polygon);
//             })
//         }
//         else {
//             morphToCircle(polygon);
//         }
//     }
// }

// // // fade out all countries except selected
// function fadeOut(exceptPolygon:any) {
//     for (var i = 0; i < polygonSeries.mapPolygons.length; i++) {
//         let polygon:any = polygonSeries.mapPolygons.getIndex(i);
//         if (polygon != exceptPolygon) {
//             polygon.defaultState.properties.fillOpacity = 0.5;
//             polygon.animate([{ property: "fillOpacity", to: 0.5 }, { property: "strokeOpacity", to: 1 }], polygon.polygon.morpher.morphDuration);
//         }
//     }
// }

// function zoomOut() {
//     if (morphedPolygon) {
//         // pieSeries.hide();
//         morphBack();
//         fadeOut(null);
//         // countryLabel.hide();
//         morphedPolygon = undefined;
//     }
// }

// function morphBack() {
//     if (morphedPolygon) {
//         morphedPolygon.polygon.morpher.morphBack();
//         let dsf = morphedPolygon.filters.getIndex(0);
//         dsf.animate({ property: "saturation", to: 0.25 }, morphedPolygon.polygon.morpher.morphDuration);
//     }
// }

// function morphToCircle(polygon:any) {


//     let animationDuration = polygon.polygon.morpher.morphDuration;
//     // if there is a country already morphed to circle, morph it back
//     morphBack();
//     // morph polygon to circle
//     polygon.toFront();
//     polygon.polygon.morpher.morphToSingle = true;
//     let morphAnimation = polygon.polygon.morpher.morphToCircle();

//     polygon.strokeOpacity = 0; // hide stroke for lines not to cross countries

//     polygon.defaultState.properties.fillOpacity = 1;
//     polygon.animate({ property: "fillOpacity", to: 1 }, animationDuration);

//     // animate desaturate filter
//     let filter = polygon.filters.getIndex(0);
//     filter.animate({ property: "saturation", to: 1 }, animationDuration);

//     // save currently morphed polygon
//     morphedPolygon = polygon;

//     // fade out all other
//     fadeOut(polygon);

//     // hide country label
//     countryLabel.hide();

//     if (morphAnimation) {
//         morphAnimation.events.on("animationended", function () {
//             zoomToCountry(polygon);
//         })
//     }
//     else {
//         zoomToCountry(polygon);
//     }
// }

// function zoomToCountry(polygon:any) {
//     let zoomAnimation = chart.zoomToMapObject(polygon, 2.2, true);
//     if (zoomAnimation) {
//         zoomAnimation.events.on("animationended", function () {
//             showPieChart(polygon);
//         })
//     }
//     else {
//         showPieChart(polygon);
//     }
// }


// function showPieChart(polygon: any) {
//     polygon.polygon.measure();
//     let radius = polygon.polygon.measuredWidth / 2 * polygon.globalScale / chart.seriesContainer.scale;
//     pieChart.width = radius * 2;
//     pieChart.height = radius * 2;
//     pieChart.radius = radius;

//     let centerPoint = am4core.utils.spritePointToSvg(polygon.polygon.centerPoint, polygon.polygon);
//     centerPoint = am4core.utils.svgPointToSprite(centerPoint, chart.seriesContainer);

//     pieChart.x = centerPoint.x - radius;
//     pieChart.y = centerPoint.y - radius;

//     let fill = polygon.fill;
//     let desaturated = fill.saturate(0.3);

//     for (var i = 0; i < pieSeries.dataItems.length; i++) {
//         let dataItem: any = pieSeries.dataItems.getIndex(i);
//         dataItem.value = Math.round(Math.random() * 100);
//         dataItem.slice.fill = am4core.color(am4core.colors.interpolate(
//             fill.rgb,
//             am4core.color("#ffffff").rgb,
//             0.2 * i
//         ));

//         dataItem.label.background.fill = desaturated;
//         dataItem.tick.stroke = fill;
//     }

//     pieSeries.show();
//     pieChart.show();

//     countryLabel.text = "{name}";
//     countryLabel.dataItem = polygon.dataItem;
//     countryLabel.fill = desaturated;
//     countryLabel.show();
// }

  }


}
