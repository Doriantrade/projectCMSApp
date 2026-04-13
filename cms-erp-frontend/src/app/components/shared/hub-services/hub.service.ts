import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class HubService {
  
  public hubConnection!: signalR.HubConnection;


  constructor() { }

  
  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5130/msj', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('HUB CONNECTION');
      })
      .catch(err => console.error('ERROR WHILE CONNECTION', err));
  }

  askServer() {
    this.hubConnection
      .invoke('askServer', 'hey')
      .catch(err => console.error(err));
  }

  askServerListener() {
    this.hubConnection.on('askServerResponse', sometext =>
      console.log(sometext)
    );
  }

}
