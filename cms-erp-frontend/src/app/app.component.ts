import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { HubService } from './components/shared/hub-services/hub.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'CMS-System';

  constructor(private hub: HubService) {}

  ngOnInit(): void {
  
  }

  
  
}
