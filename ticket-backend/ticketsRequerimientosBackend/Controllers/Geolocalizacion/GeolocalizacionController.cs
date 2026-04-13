using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using ticketsRequerimientosBackend.Controllers.Geolocalizacion.signalr_gl;


namespace ticketsRequerimientosBackend.Controllers.Geolocalizacion
{
    [Route("api/GeoLocalizacion")]
    [ApiController]
    public class GeolocalizacionController : ControllerBase
    {
        private readonly IHubContext<LocationHub> _hubContext;

        public GeolocalizacionController(IHubContext<LocationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        [HttpPost("ActualizarUbicacion")]
        public async Task<IActionResult> ActualizarUbicacion([FromBody] UbicacionRequest request)
        {
            // 1. Aquí podrías guardar la ubicación en tu Base de Datos si lo necesitas
            // 2. "Gritar" la ubicación a todos los que estén viendo ese ticket en la web
            await _hubContext.Clients.Group(request.TicketId.ToString())
                .SendAsync("RecibirUbicacion", new
                {
                    lat = request.Latitud,
                    lng = request.Longitud,
                    tecnicoId = request.TecnicoId,
                    fecha = DateTime.Now
                });

            return Ok();
        }
    }

    public class UbicacionRequest {
        public int TicketId { get; set; }
        public int TecnicoId { get; set; }
        public double Latitud { get; set; }
        public double Longitud { get; set; }
    }

}