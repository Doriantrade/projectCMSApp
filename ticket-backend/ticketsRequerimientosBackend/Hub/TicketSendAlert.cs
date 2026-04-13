using Microsoft.AspNetCore.SignalR;
using ticketsRequerimientosBackend.Models;

    public class TicketSendAlert: Hub
    {

        public async Task ticketSendAlertHub(Ticketresolucion msj)
        {
            await Clients.All.SendAsync("SendTicketRequerimientoHub", msj);
        }

    }
