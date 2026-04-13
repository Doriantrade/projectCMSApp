
using Microsoft.AspNetCore.SignalR;
using ticketsRequerimientosBackend.ModelsDto;


  public class TicketResolucionHUB : Hub
  {
      public async Task SendTicketRequerimiento(TicketModelDto ticket)
      {
          await Clients.All.SendAsync("SendTicketRequerimiento", ticket);
      }

  }


