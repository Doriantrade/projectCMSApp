using Microsoft.AspNetCore.SignalR;
using ticketsRequerimientosBackend.ModelsDto;

    public class EstadoTicketHUB : Hub
    {
        // Lógica del Hub aquí
        public async Task SendEstadoTicket(TicketModelDto ticket )
        {
            await Clients.All.SendAsync("SendEstadoTicket", ticket);
        }                

    }
