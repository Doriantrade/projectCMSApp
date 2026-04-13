
using Microsoft.AspNetCore.SignalR;
using ticketsRequerimientosBackend.ModelsDto;

public class HoraMantenimientoHub : Hub
{

    public async Task SendHoraMantenimientoHub(RequestMantenimientoTecnico modelData )
    {
        await Clients.All.SendAsync("SendHoraMantenimientoHub", modelData );
    }
}

