
using Microsoft.AspNetCore.SignalR;
using ticketsRequerimientosBackend.ModelsDto;

public class EliminacionTecnicoHub : Hub
{

    public async Task EliminacionTecnicoSignal( tecnicoDto tecnico)
    {
        await Clients.All.SendAsync("SendAprobarCotizacionHub", tecnico);
    }

}

