using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Text;
using ticketsRequerimientosBackend.Models;

namespace TicketsRequerimientosBackend.MailController
{
    [ApiController]
    public class MailController : ControllerBase
    {
        private readonly cmsDb2024Context _context;

        public MailController(cmsDb2024Context context)
        {
            _context = context;
        }


        //[Authorize]
        [HttpPost("api/SendEmail")]
        public async Task<IActionResult> SendEmail([FromBody] EmailRequestDto emailRequest)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                // Preparar los valores básicos (código existente)
                string recipients = string.Join("; ", emailRequest.Recipients);
                string cc = emailRequest.CcRecipients?.Any() == true
                    ? string.Join("; ", emailRequest.CcRecipients) : null;
                string bcc = emailRequest.BccRecipients?.Any() == true
                    ? string.Join("; ", emailRequest.BccRecipients) : null;

                // Construir el comando SQL con parámetros
                var commandText = new StringBuilder("EXEC msdb.dbo.sp_send_dbmail ");
                var parameters = new List<SqlParameter>();

                // Parámetros obligatorios (código existente)
                commandText.Append("@profile_name = @profile_name, ");
                parameters.Add(new SqlParameter("@profile_name", emailRequest.ProfileName));

                commandText.Append("@recipients = @recipients, ");
                parameters.Add(new SqlParameter("@recipients", recipients));

                commandText.Append("@body = @body, ");
                parameters.Add(new SqlParameter("@body", emailRequest.Body));

                commandText.Append("@subject = @subject, ");
                parameters.Add(new SqlParameter("@subject", emailRequest.Subject));

                commandText.Append("@exclude_query_output = @exclude_query_output");
                parameters.Add(new SqlParameter("@exclude_query_output", emailRequest.ExcludeQueryOutput ? 1 : 0));

                // Parámetros opcionales (código existente)
                if (!string.IsNullOrEmpty(cc))
                {
                    commandText.Append(", @copy_recipients = @copy_recipients");
                    parameters.Add(new SqlParameter("@copy_recipients", cc));
                }

                if (!string.IsNullOrEmpty(bcc))
                {
                    commandText.Append(", @blind_copy_recipients = @blind_copy_recipients");
                    parameters.Add(new SqlParameter("@blind_copy_recipients", bcc));
                }

                if (!string.IsNullOrEmpty(emailRequest.FromAddress))
                {
                    commandText.Append(", @from_address = @from_address");
                    parameters.Add(new SqlParameter("@from_address", emailRequest.FromAddress));
                }

                if (!string.IsNullOrEmpty(emailRequest.ReplyTo))
                {
                    commandText.Append(", @reply_to = @reply_to");
                    parameters.Add(new SqlParameter("@reply_to", emailRequest.ReplyTo));
                }

                if (emailRequest.IsBodyHtml.HasValue)
                {
                    commandText.Append(", @body_format = @body_format");
                    parameters.Add(new SqlParameter("@body_format", emailRequest.IsBodyHtml.Value ? "HTML" : "TEXT"));
                }

                // Nuevo parámetro para adjuntos
                if (emailRequest.FileAttachments?.Any() == true)
                {
                    // Convertir las rutas a un string separado por punto y coma
                    string attachments = string.Join(";", emailRequest.FileAttachments);
                    commandText.Append(", @file_attachments = @file_attachments");
                    parameters.Add(new SqlParameter("@file_attachments", attachments));
                }

                // Ejecutar el procedimiento almacenado (código existente)
                using (var connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString))
                {
                    await connection.OpenAsync();
                    using (var command = new SqlCommand(commandText.ToString(), connection))
                    {
                        command.Parameters.AddRange(parameters.ToArray());
                        await command.ExecuteNonQueryAsync();
                    }
                }

                return Ok(new { Success = true, Message = "Correo encolado exitosamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = "Error enviando correo",
                    Error = ex.Message,
                    StackTrace = ex.StackTrace
                });
            }
        }


    }
}