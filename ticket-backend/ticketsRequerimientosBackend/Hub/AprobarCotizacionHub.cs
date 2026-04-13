using Microsoft.AspNetCore.SignalR;
using ticketsRequerimientosBackend.Models;

 
    public class AprobarCotizacionHub : Hub
    {
        public async Task SendAprobarCotizacionHub( FileMediaTicket modelFile, AsignRepuRequer modelRepu ) 
        {
            await Clients.All.SendAsync("SendAprobarCotizacionHub", modelFile, modelRepu);
        }

    }

