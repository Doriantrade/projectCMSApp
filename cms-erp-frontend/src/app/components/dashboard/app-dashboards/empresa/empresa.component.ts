import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.scss']
})
export class EmpresaComponent implements OnInit {
  pMod: number = 4;


  constructor() { }

  ngOnInit(): void {
    let pm = localStorage.getItem('PMod');
    this.pMod = pm ? parseInt(pm) : 4;

  }

}
