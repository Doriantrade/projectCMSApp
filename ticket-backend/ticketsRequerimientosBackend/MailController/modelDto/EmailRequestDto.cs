using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

public class EmailRequestDto
{
    public string ProfileName { get; set; } = "NotificationDev";

    [Required(ErrorMessage = "Debe especificar al menos un destinatario")]
    public List<string> Recipients { get; set; }

    [Required(ErrorMessage = "El cuerpo del mensaje es requerido")]
    public string Body { get; set; }

    [Required(ErrorMessage = "El asunto del mensaje es requerido")]
    public string Subject { get; set; }

    public bool ExcludeQueryOutput { get; set; } = true;
    public List<string> CcRecipients { get; set; } = new List<string>();
    public List<string> BccRecipients { get; set; } = new List<string>();

    [EmailAddress(ErrorMessage = "El formato del correo remitente no es válido")]
    public string FromAddress { get; set; }

    [EmailAddress(ErrorMessage = "El formato del correo para respuesta no es válido")]
    public string ReplyTo { get; set; }

    public bool? IsBodyHtml { get; set; }

    // Nuevo campo para adjuntos (lista de rutas de archivo)
    public List<string> FileAttachments { get; set; } = new List<string>();
}