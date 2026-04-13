using Microsoft.AspNetCore.SignalR;
using System.Reflection.Metadata;
using ticketsRequerimientosBackend.Models;
using ticketsRequerimientosBackend.ModelsDto;
//using ticketsRequerimientosBackend.Hub;



    public class MesnajeHub : Hub
    {
        public async Task SendMessageHub(MensajeriaTicket msj, List<object> respuesta)
        {
            await Clients.All.SendAsync("SendMessageHub", msj, respuesta);
        }

    }


