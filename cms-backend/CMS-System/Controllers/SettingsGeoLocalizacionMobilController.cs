using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using cmsDb2024_System.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq;

namespace CMS_System.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SettingsGeoLocalizacionMobilController : ControllerBase
    {
        private readonly cmsDb2024Context _context;

        public SettingsGeoLocalizacionMobilController(cmsDb2024Context context)
        {
            _context = context;
        }

        // GET: api/SettingsGeoLocalizacionMobil
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SettingsGeoLocalizacionMobil>>> GetSettings()
        {
            return await _context.SettingsGeoLocalizacionMobil.ToListAsync();
        }

        // GET: api/SettingsGeoLocalizacionMobil/ByMac/MAC123
        [HttpGet("ByMac/{mac}")]
        public async Task<ActionResult<SettingsGeoLocalizacionMobil>> GetSettingsByMac(string mac)
        {
            var settings = await _context.SettingsGeoLocalizacionMobil.FirstOrDefaultAsync(s => s.Codmac == mac);
            if (settings == null) return NotFound();
            return settings;
        }

        // GET: api/SettingsGeoLocalizacionMobil/MobileMonitorData
        [HttpGet("MobileMonitorData")]
        public async Task<IActionResult> GetMobileMonitorData()
        {
            var data = await (from s in _context.SettingsGeoLocalizacionMobil
                              join a in _context.AsignacionMobilTecnico on s.Codmac equals a.Mac into joinedAssigment
                              from a in joinedAssigment.DefaultIfEmpty()
                              join u in _context.Usuario on a.Coduser equals u.Coduser into joinedUser
                              from u in joinedUser.DefaultIfEmpty()
                              select new
                              {
                                  s.Id,
                                  s.Codmac,
                                  s.TimeSendDataGeoLocalization,
                                  s.HorarioLaboinicial,
                                  s.HorarioLabofinal,
                                  s.AproximGeoLocalizacion,
                                  s.MetodoDeEnvioDeDatos,
                                  s.Permisos,
                                  s.Pasos,
                                  Coduser = a != null ? a.Coduser : null,
                                  NombreUsuario = u != null ? $"{u.Nombre} {u.Apellido}" : "- NO ASIGNADO TODAVÍA A ESTE DISPOSITIVO -"
                              }).ToListAsync();

            return Ok(data);
        }

        // POST: api/SettingsGeoLocalizacionMobil
        [HttpPost]
        public async Task<ActionResult<SettingsGeoLocalizacionMobil>> PostSettings(SettingsGeoLocalizacionMobil settings)
        {
            settings.Fecrea = DateTime.Now;
            _context.SettingsGeoLocalizacionMobil.Add(settings);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSettings), new { id = settings.Id }, settings);
        }

        // PUT: api/SettingsGeoLocalizacionMobil/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutSettings(int id, SettingsGeoLocalizacionMobil settings)
        {
            if (id != settings.Id) return BadRequest();

            var existing = await _context.SettingsGeoLocalizacionMobil.FindAsync(id);
            if (existing == null) return NotFound();

            // Solo actualizamos los campos configurables
            existing.TimeSendDataGeoLocalization = settings.TimeSendDataGeoLocalization;
            existing.HorarioLaboinicial = settings.HorarioLaboinicial;
            existing.HorarioLabofinal = settings.HorarioLabofinal;
            existing.AproximGeoLocalizacion = settings.AproximGeoLocalizacion;
            existing.MetodoDeEnvioDeDatos = settings.MetodoDeEnvioDeDatos;
            existing.Pasos = settings.Pasos;
            existing.Permisos = settings.Permisos;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SettingsExists(id)) return NotFound();
                else throw;
            }

            return Ok(existing);
        }

        // DELETE: api/SettingsGeoLocalizacionMobil/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSettings(int id)
        {
            var settings = await _context.SettingsGeoLocalizacionMobil.FindAsync(id);
            if (settings == null) return NotFound();

            _context.SettingsGeoLocalizacionMobil.Remove(settings);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private bool SettingsExists(int id)
        {
            return _context.SettingsGeoLocalizacionMobil.Any(e => e.Id == id);
        }
    }
}
