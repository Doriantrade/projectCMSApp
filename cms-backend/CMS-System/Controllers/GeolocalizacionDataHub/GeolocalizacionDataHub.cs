using CMS_System.Controllers.GeolocalizacionDataHub.dto;
using Microsoft.AspNetCore.SignalR;

namespace CMS_System.Controllers.GeolocalizacionDataHub
{
    public class GeolocalizacionDataHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"=> HUB: Nueva conexión establecida: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Console.WriteLine($"=> HUB: Conexión terminada: {Context.ConnectionId}. Error: {exception?.Message}");
            await base.OnDisconnectedAsync(exception);
        }

        public async Task GeoLocalizacionHub(GeolocalizacionDto modelDto)
        {
            await Clients.All.SendAsync("SendGeolocalizacion", modelDto);
        }
    }
}
