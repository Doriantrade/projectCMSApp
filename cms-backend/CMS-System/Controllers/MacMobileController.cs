using cmsDb2024_System.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using CMS_System.Controllers.GeolocalizacionDataHub;
using CMS_System.Controllers.GeolocalizacionDataHub.dto;

namespace CMS_System.Controllers
{
    [Route("api/MacMobile")]
    [ApiController]
    public class MacMobileController : ControllerBase
    {

        private readonly cmsDb2024Context _context;
        private readonly IHubContext<CMS_System.Controllers.GeolocalizacionDataHub.GeolocalizacionDataHub> _hubContext;
        
        public MacMobileController(cmsDb2024Context context, IHubContext<CMS_System.Controllers.GeolocalizacionDataHub.GeolocalizacionDataHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpPost]
        [Route("guardarAsignacionMacTecnico")]
        public async Task<IActionResult> guardarAsignacionMacTecnico([FromBody] MacMobilUser model)
        {
            if (model == null)
            {
                return BadRequest("Los datos enviados son nulos.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _context.MacMobilUser.AddAsync(model);

                var result = await _context.SaveChangesAsync();

                if (result > 0)
                {
                    string nombreCompleto = "-Sin ingresar a la app todabia -";
                    string imagen = "";

                    try 
                    {
                        var usuario = await _context.Usuario.FirstOrDefaultAsync(u => u.Coduser == model.Coduser);

                        if (usuario != null)
                        {
                            nombreCompleto = $"{usuario.Nombre} {usuario.Apellido}".Trim();
                            if (string.IsNullOrWhiteSpace(nombreCompleto)) 
                            {
                                nombreCompleto = "-Sin ingresar a la app todabia -";
                            }
                        }
                        
                        // NOTA: NO enviamos la imagen base64 en cada reporte periódico para no saturar SignalR.
                        // El frontend mantendrá la imagen que recibió en el registro inicial (AsignacionMobil).
                        imagen = ""; 
                    }
                    catch (Exception linqEx)
                    {
                        Console.WriteLine("=> BACKEND: Error al obtener nombre o imagen de usuario: " + linqEx.Message);
                    }

                    var locationDto = new GeolocalizacionDto
                    {
                        macMobile = model.Mac,
                        coduser = model.Coduser,
                        estado = model.Estado ?? 0,
                        longitud = model.Longitud,
                        latitud = model.Latitud,
                        fecrea = DateTime.Now,
                        idTicket = model.IdTicket ?? 0,
                        nombreUsuario = nombreCompleto,
                        imagenUsuario = imagen
                    };
                    try 
                    {
                        var jsonPayload = Newtonsoft.Json.JsonConvert.SerializeObject(locationDto);
                        Console.WriteLine($"=> BACKEND: Intentando emitir por SignalR Hub: GeolocalizacionDataHub, Evento: SendGeolocalizacion");
                        Console.WriteLine($"=> BACKEND: Payload: {jsonPayload}");
                        await _hubContext.Clients.All.SendAsync("SendGeolocalizacion", locationDto);
                        Console.WriteLine($"=> BACKEND: Emisión exitosa para MAC: {locationDto.macMobile}");
                    }
                    catch (Exception hubEx)
                    {
                        Console.WriteLine($"=> BACKEND: ERROR CRÍTICO AL EMITIR POR SIGNALR: {hubEx.Message}");
                        Console.WriteLine($"=> BACKEND: StackTrace: {hubEx.StackTrace}");
                    }

                    return Ok(new { mensaje = "Guardado exitosamente", data = model });
                }

                return BadRequest("No se realizaron cambios en la base de datos.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        [HttpGet]
        [Route("ByMac/{mac}/today")]
        public async Task<IActionResult> GetTodayLogsByMac(string mac)
        {
            if (string.IsNullOrEmpty(mac))
            {
                return BadRequest("La MAC es requerida.");
            }

            try
            {
                var today = DateTime.Today;
                var logs = await _context.MacMobilUser
                    .Where(m => m.Mac == mac)
                    .OrderByDescending(m => m.Id)
                    .Select(m => new { 
                        m.Latitud, 
                        m.Longitud, 
                        m.Estado,
                        m.Coduser,
                        Fecrea = new DateTime()
                    })
                    .Take(100) // Límite razonable para no saturar al cliente
                    .ToListAsync();

                if (logs == null || logs.Count == 0)
                {
                    return NotFound(new { mensaje = "No hay datos enviados para mostrar hoy." });
                }

                return Ok(logs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

    }
}
