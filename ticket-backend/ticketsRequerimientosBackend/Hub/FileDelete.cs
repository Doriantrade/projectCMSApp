
using Microsoft.AspNetCore.SignalR;
using ticketsRequerimientosBackend.ModelsDto;

public class FileDelete : Hub
{
    public async Task FileDeleteSignal(FileDelDto FileData)
    {
        await Clients.All.SendAsync("FileDeleteSignalHub", FileData);
    }
}

