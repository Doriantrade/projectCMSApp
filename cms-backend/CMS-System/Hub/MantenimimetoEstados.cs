using CMS_System.Controllers.DTO;
using cmsDb2024_System.Models;
using Microsoft.AspNetCore.SignalR;

public class MantenimimetoEstados : Hub
{
    public async Task MantenimimetoEstadosSend(MobilModelDto model)
    {
        await Clients.All.SendAsync("MantenimimetoEstadosSend", model);
    }

}
