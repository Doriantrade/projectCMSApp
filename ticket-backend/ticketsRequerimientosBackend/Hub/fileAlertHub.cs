using Microsoft.AspNetCore.SignalR;
using ticketsRequerimientosBackend.Models;
using ticketsRequerimientosBackend.ModelsDto;

public class fileAlertHub : Hub
{
    public async Task SendFileAlert(TunelAlerFileDto ticket)
    {
        await Clients.All.SendAsync("ReceiveFileAlert", ticket);
    }
}