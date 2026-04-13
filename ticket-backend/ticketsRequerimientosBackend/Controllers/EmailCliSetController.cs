using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ticketsRequerimientosBackend.auditoria_services;
using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.Controllers
{
    [Route("api/emailCliSet")]
    [ApiController]
    public class EmailCliSetController : ControllerBase
    {

        private readonly cmsDb2024Context _context;

        public EmailCliSetController(cmsDb2024Context context)
        {
            _context = context;
        }

        [HttpDelete]
        [Route("DeleteEmailCliSet/{id}")]
        public async Task<IActionResult> DeleteEmailCliSet([FromRoute] int id)
        {
            // 1. Buscar el registro en EmailCliSet
            var emailCliSet = await _context.EmailCliSet.FindAsync(id);

            if (emailCliSet == null)
            {
                return NotFound("No se encontró el registro en EmailCliSet");
            }

            // 2. Eliminar registros relacionados en EmailSettings
            var emailSettingsToDelete = _context.EmailSettings
                .Where(x => x.IdEmailCliSets == id)
                .ToList();

            if (emailSettingsToDelete.Any()) {
                _context.EmailSettings.RemoveRange(emailSettingsToDelete);
            }

            // 3. Eliminar el registro principal en EmailCliSet
            _context.EmailCliSet.Remove(emailCliSet);

            // 4. Guardar cambios en la base de datos
            await _context.SaveChangesAsync();
            return Ok();

        }

        [HttpPut]
        [Route("UpdateEmailCliSet/{id}")]
        public async Task<IActionResult> UpdateEmailCliSet([FromRoute] int id, [FromBody] EmailCliSet model)
        {
            if (id != model.Id)
            {
                return BadRequest("No existe la configuración");
            }

            var existingEntity = await _context.EmailCliSet.FindAsync(id);
            if (existingEntity == null)
            {
                return NotFound();
            }

            // 1. Eliminar registros antiguos en EmailSettings
            var emailSettingsToDelete = _context.EmailSettings.Where(x => x.IdEmailCliSets == model.Id).ToList();
            if (emailSettingsToDelete.Any())
            {
                _context.EmailSettings.RemoveRange(emailSettingsToDelete);
            }

            // 2. Actualizar el registro principal (EmailCliSet)
            _context.Entry(existingEntity).CurrentValues.SetValues(model);
            existingEntity.Fecrea = existingEntity.Fecrea; // Mantener fecha original

            // 3. Insertar nuevos registros en EmailSettings (si hay recipients)
            if (!string.IsNullOrEmpty(model.Recipients))
            {
                var emailsList = model.Recipients.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                                .Select(e => e.Trim())
                                                .ToList();

                foreach (var email in emailsList)
                {
                    var newEmailSetting = new EmailSettings
                    {
                        IdEmailCliSets = model.Id, // Relación con EmailCliSet
                        ProfileName = model.ProfileName,
                        EmailsToSend = email, // Guardamos cada email individualmente
                        Fecrea = DateTime.Now, // Fecha actual
                        Usercrea = model.Usercrea // Usuario que creó el registro
                    };
                    _context.EmailSettings.Add(newEmailSetting);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(existingEntity);
        }

        [HttpPost("GuardarEmailCliSet")]
        public async Task<IActionResult> GuardarEmailCliSet([FromBody] EmailCliSet model)
        {
            if (model == null)
            {
                return BadRequest("Los datos del modelo no pueden ser nulos");
            }

            try
            {
                // 1. Guardar el EmailCliSet principal
                _context.EmailCliSet.Add(model);
                await _context.SaveChangesAsync();

                // 2. Procesar los recipients para guardar en EmailSettings
                if (!string.IsNullOrEmpty(model.Recipients))
                {
                    // Separar los emails y eliminar espacios
                    var emails = model.Recipients.Split(',')
                        .Select(e => e.Trim())
                        .Where(e => !string.IsNullOrEmpty(e))
                        .ToList();

                    foreach (var email in emails)
                    {
                        var emailSetting = new EmailSettings
                        {
                            IdEmailCliSets = model.Id, // El ID generado automáticamente del EmailCliSet recién guardado
                            ProfileName = string.Empty, // Como indicaste que va vacío
                            EmailsToSend = email,
                            Usercrea = model.Usercrea,
                            Fecrea = DateTime.Now // Fecha actual
                        };

                        _context.EmailSettings.Add(emailSetting);
                    }

                    await _context.SaveChangesAsync();
                }

                return Ok(new
                {
                    Message = "Configuración guardada correctamente",
                    EmailCliSetId = model.Id // Opcional: devolver el ID generado
                });
            }
            catch (Exception ex)
            {
                // Loggear el error (ex) aquí
                return StatusCode(500, "Error interno al guardar la configuración");
            }
        }


        [HttpPost("GuardarEmailSettings")]
        public async Task<IActionResult> GuardarEmailSettings([FromBody] EmailSettings model)
        {

            if (model == null)
            {
                return BadRequest("Los datos del modelo no pueden ser nulos");
            }

            _context.EmailSettings.Add(model);
            await _context.SaveChangesAsync();
            return Ok();

        }

        [HttpGet("ObtenerConfiguracionEmail/{idconfig}")]
        public async Task<IActionResult> ObtenerConfiguracionEmail([FromRoute] int idconfig)
        {
            try
            {
                // Obtener todas las configuraciones de email que coincidan con el idconfig
                var configuracionesEmail = await _context.EmailCliSet
                    .Where(x => x.Idconfig == idconfig)
                    .ToListAsync();

                if (!configuracionesEmail.Any())
                {
                    return NotFound($"No se encontraron configuraciones con ID {idconfig}");
                }

                // Construir la respuesta con todas las configuraciones y sus settings relacionados
                var response = configuracionesEmail.Select(ce => new
                {
                    id = ce.Id,
                    profileName = ce.ProfileName,
                    recipients = ce.Recipients,
                    body = ce.Body,
                    subject = ce.Subject,
                    fromAddress = ce.FromAddress,
                    replyTo = ce.ReplyTo,
                    usercrea = ce.Usercrea,
                    fecrea = ce.Fecrea,
                    codcli = ce.Codcli,
                    idconfig = ce.Idconfig,
                    codecProcess = ce.CodecProcess,
                    settings = _context.EmailSettings
                        .Where(s => s.IdEmailCliSets == ce.Id)
                        .Select(s => new
                        {
                            id = s.Id,
                            idEmailCliSets = s.IdEmailCliSets,
                            profileName = s.ProfileName,
                            emailsToSend = s.EmailsToSend,
                            fecrea = s.Fecrea,
                            usercrea = s.Usercrea
                        })
                        .ToList()
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                // Loggear el error (ex) aquí
                return StatusCode(500, "Error interno del servidor");
            }
        }

    }
}
