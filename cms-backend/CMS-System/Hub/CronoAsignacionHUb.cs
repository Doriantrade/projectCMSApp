using CMS_System.Controllers.DTO;
using Microsoft.AspNetCore.SignalR;

namespace CMS_System
{
    public class CronoAsignacionHUb: Hub
    {
        public async Task CronoAsignacion(MobilModelDto model)
        {
            await Clients.All.SendAsync("CronoAsignacion", model);
        }
    }

}
