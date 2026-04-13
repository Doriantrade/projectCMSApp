using Microsoft.AspNetCore.SignalR;
using ticketsRequerimientosBackend.Models;
using ticketsRequerimientosBackend.ModelsDto;

    public class ActualizaRequerimientoReal : Hub
    {
        // Lógica del Hub aquí
        public async Task SendRequerimiemtoActual(TicketModelDto ticket)
        {
            await Clients.All.SendAsync("SendRequerimiemtoActual", ticket);
        }
    }

