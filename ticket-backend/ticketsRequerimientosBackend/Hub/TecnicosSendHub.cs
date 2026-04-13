using Microsoft.AspNetCore.SignalR;
using ticketsRequerimientosBackend.ModelsDto;

namespace ticketsRequerimientosBackend
{
    public class TecnicosSendHub : Hub
    {
        public async Task SendTecnicosHub(TecnicosDto data )
        {
            await Clients.All.SendAsync("SendTecnicosHubAsign", data);   
        }
    }
}
