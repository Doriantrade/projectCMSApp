using Microsoft.AspNetCore.SignalR;

namespace ticketsRequerimientosBackend.Controllers.Geolocalizacion.signalr_gl
{
    public class LocationHub : Hub
    {
        // Los técnicos se pueden unir a un "grupo" basado en el ID del Ticket
        public async Task JoinTicketGroup(string ticketId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, ticketId);
        }
    }
}
