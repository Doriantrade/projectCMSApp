using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using cmsDb2024_System.Models;
using CMS_System.Controllers.GeolocalizacionDataHub.dto;

namespace CMS_System.Controllers
{
    
    [Route("api/[controller]")]
    [ApiController]
    public class AsignacionMobilTecnicoController : ControllerBase
    {
        private readonly cmsDb2024Context _context;
        private readonly IHubContext<CMS_System.Controllers.GeolocalizacionDataHub.GeolocalizacionDataHub> _hubContext;

        public AsignacionMobilTecnicoController(cmsDb2024Context context, IHubContext<CMS_System.Controllers.GeolocalizacionDataHub.GeolocalizacionDataHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // GET: api/AsignacionMobilTecnico
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AsignacionMobilTecnico>>> GetAsignacionMobilTecnico()
        {
            return await _context.AsignacionMobilTecnico.ToListAsync();
        }

        // GET: api/AsignacionMobilTecnico/5
        [HttpGet("{id}")]
        public async Task<ActionResult<AsignacionMobilTecnico>> GetAsignacionMobilTecnico(int id)
        {
            var asignacion = await _context.AsignacionMobilTecnico.FindAsync(id);

            if (asignacion == null)
            {
                return NotFound();
            }

            return asignacion;
        }

        // GET: api/AsignacionMobilTecnico/ByMac/MAC123
        [HttpGet("ByMac/{mac}")]
        public async Task<ActionResult<AsignacionMobilTecnico>> GetAsignacionByMac(string mac)
        {
            var asignacion = await _context.AsignacionMobilTecnico.FirstOrDefaultAsync(a => a.Mac == mac);

            if (asignacion == null)
            {
                return NotFound();
            }

            return asignacion;
        }

        // POST: api/AsignacionMobilTecnico
        [HttpPost]
        public async Task<ActionResult<AsignacionMobilTecnico>> PostAsignacionMobilTecnico(AsignacionMobilTecnico asignacion)
        {
            // Validar si ya existe la MAC
            var existing = await _context.AsignacionMobilTecnico.FirstOrDefaultAsync(a => a.Mac == asignacion.Mac);
            if (existing != null)
            {
                // Siempre actualizamos el usuario si viene uno diferente (ej: cambio de técnico en el mismo teléfono)
                if (!string.IsNullOrEmpty(asignacion.Coduser) && existing.Coduser != asignacion.Coduser)
                {
                    existing.Coduser = asignacion.Coduser;
                    existing.Fecrea = DateTime.Now;
                    await _context.SaveChangesAsync();
                    
                    await EnsureDefaultSettings(existing.Mac);

                    return Ok(existing);
                }

                await EnsureDefaultSettings(existing.Mac);
                return Ok(existing); // Ya existe y es el mismo usuario
            }

            asignacion.Fecrea = DateTime.Now;
            _context.AsignacionMobilTecnico.Add(asignacion);
            await _context.SaveChangesAsync();

            await EnsureDefaultSettings(asignacion.Mac);

            return CreatedAtAction("GetAsignacionMobilTecnico", new { id = asignacion.Id }, asignacion);
        }

        // PUT: api/AsignacionMobilTecnico/UpdateByMac
        [HttpPut("UpdateByMac")]
        public async Task<IActionResult> UpdateByMac([FromBody] AsignacionMobilTecnico input)
        {
            if (string.IsNullOrEmpty(input.Mac))
            {
                return BadRequest("La MAC es requerida.");
            }

            var existing = await _context.AsignacionMobilTecnico.FirstOrDefaultAsync(a => a.Mac == input.Mac);
            if (existing == null)
            {
                // Si no existe, lo creamos
                input.Fecrea = DateTime.Now;
                _context.AsignacionMobilTecnico.Add(input);
                await _context.SaveChangesAsync();

                await EnsureDefaultSettings(input.Mac);

                return Ok(input);
            }

            existing.Coduser = input.Coduser;
            existing.Fecrea = DateTime.Now; // Opcional: actualizar fecha de última actividad/asignación
            
            await _context.SaveChangesAsync();

            await EnsureDefaultSettings(existing.Mac);

            return Ok(existing);
        }

        private async Task EnsureDefaultSettings(string mac)
        {
            var settings = await _context.SettingsGeoLocalizacionMobil.FirstOrDefaultAsync(s => s.Codmac == mac);
            if (settings == null)
            {
                _context.SettingsGeoLocalizacionMobil.Add(new SettingsGeoLocalizacionMobil
                {
                    Codmac = mac,
                    TimeSendDataGeoLocalization = 300, // 5 min
                    HorarioLaboinicial = new TimeSpan(8, 0, 0),
                    HorarioLabofinal = new TimeSpan(17, 0, 0),
                    AproximGeoLocalizacion = 10,
                    MetodoDeEnvioDeDatos = 1,
                    Permisos = 1,
                    Fecrea = DateTime.Now,
                    Usercrea = "SYSTEM",
                    Pasos = 100
                });
                await _context.SaveChangesAsync();
            }
        }

        // DELETE: api/AsignacionMobilTecnico/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsignacionMobilTecnico(int id)
        {
            var asignacion = await _context.AsignacionMobilTecnico.FindAsync(id);
            if (asignacion == null)
            {
                return NotFound();
            }

            _context.AsignacionMobilTecnico.Remove(asignacion);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

