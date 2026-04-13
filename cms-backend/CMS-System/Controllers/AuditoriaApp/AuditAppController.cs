using cmsDb2024_System.Models;
 
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Web;
using Microsoft.Extensions.DependencyInjection;
namespace CMS_System.Controllers.AuditoriaApp
{
    [Route("api/AuditApp")]
    [ApiController]
    public class AuditAppController : ControllerBase
    {

        private readonly cmsDb2024Context _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditAppController(cmsDb2024Context context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        [HttpPost]
        [Route("GuardarConsumo")]
        public async Task<IActionResult> GuardarConsumo([FromBody] AuditApp model)
        {

            if (ModelState.IsValid)
            {
                _context.AuditApp.Add(model);
                if (await _context.SaveChangesAsync() > 0)
                {
                    return Ok(model);
                }
                else
                {
                    return BadRequest("Datos incorrectos");
                }
            }
            else
            {
                return BadRequest("No has ingresado datos");
            }

        }


        //    public string GetClientIP()
        //    {
        //        string ipAddress = string.Empty;

        //        // Obtener el contexto HTTP actual
        //        HttpContext context = _httpContextAccessor.HttpContext;

        //        if (context != null)
        //        {
        //            // Comprobar si existe un proxy inverso
        //            string forwardedFor = context.Request.Headers["X-Forwarded-For"];

        //            if (!string.IsNullOrEmpty(forwardedFor))
        //            {
        //                // Si hay un proxy, la dirección IP real se encuentra en la primera posición
        //                ipAddress = forwardedFor.Split(',')[0].Trim();
        //            }

        //            // Si no hay un proxy, obtener la dirección IP desde el servidor HTTP
        //            if (string.IsNullOrEmpty(ipAddress))
        //            {
        //                ipAddress = context.Connection.RemoteIpAddress?.ToString();
        //            }

        //            // Si la dirección IP es una dirección IPv6 en formato IPv4-mapped, convertirla a IPv4
        //            if (ipAddress != null && ipAddress.Contains(":"))
        //            {
        //                ipAddress = ipAddress.Split(':').Last();
        //            }
        //        }

        //        return ipAddress;
        //    }


    }



}
