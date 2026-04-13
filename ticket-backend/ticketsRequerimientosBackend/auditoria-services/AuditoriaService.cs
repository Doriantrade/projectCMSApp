using System;
using System.Text.Json;
using ticketsRequerimientosBackend.Models;

public class AuditoriaService
{
    private readonly cmsDb2024Context _context;

    public AuditoriaService(cmsDb2024Context context)
    {
        _context = context;
    }

    public async Task RegistrarAuditoria<T>(string accion, int? codmodulo, string codusuario, T entidad, string idEntidad, string systemObserv = null)
    {
        try
        {
            //var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "IP no disponible";
            // Generar código de auditoría
            string codaudit = GenerarCodigoAuditoria();

            // Serializar la entidad a JSON para el campo Data
            string dataJson = JsonSerializer.Serialize(entidad);

            // Crear query SQL simulado (opcional)
            string sqlQuery = GenerarQuerySimulado(entidad, typeof(T).Name, idEntidad);

            // Crear registro de auditoría
            var auditoria = new Auditoria
            {
                Codaudit = codaudit,
                Accion = accion,
                Codmodulo = codmodulo,
                Codusuario = codusuario,
                Cod = idEntidad,
                Ip = "--",
                Fecrea = DateTime.Now,
                Data = $"{sqlQuery}\n\nDatos completos:\n{dataJson}",
                Systemobserv = systemObserv,
                Estado = 1
            };

            // Guardar en base de datos
            _context.Auditoria.Add(auditoria);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            // Considera loggear este error
            Console.WriteLine($"Error al registrar auditoría: {ex.Message}");
        }
    }

    private string GenerarCodigoAuditoria()
    {
        // Formato: DDMMYYYYHHMMSS-XXXXXX (ejemplo: 03022025154503-AA5523ASKJ)
        string fechaPart = DateTime.Now.ToString("ddMMyyyyHHmmss");
        string randomPart = GenerarRandomString(8); // 8 caracteres aleatorios
        return $"{fechaPart}-{randomPart}";
    }

    private string GenerarRandomString(int length)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }

    private string GenerarQuerySimulado<T>(T entidad, string nombreEntidad, string id)
    {
        var propiedades = typeof(T).GetProperties();
        var nombresColumnas = string.Join(", ", propiedades.Select(p => p.Name));

        var valores = string.Join(", ", propiedades.Select(p =>
        {
            var valor = p.GetValue(entidad);
            if (valor == null) return "NULL";

            if (p.PropertyType == typeof(DateTime) || p.PropertyType == typeof(DateTime?))
                return $"'{((DateTime)valor).ToString("yyyy-MM-ddTHH:mm:ss")}'";

            if (p.PropertyType == typeof(TimeSpan) || p.PropertyType == typeof(TimeSpan?))
                return $"'{((TimeSpan)valor).ToString(@"hh\:mm\:ss")}'";

            if (p.PropertyType == typeof(string))
                return $"'{valor.ToString().Replace("'", "''")}'"; // ¡Escapa comillas simples!

            return valor.ToString();
        }));

        string jsonData = JsonSerializer.Serialize(entidad);
        string datosCompletos = $"\n\n--Datos completos: {jsonData}";

        return $"BEGIN TRANSACTION;\n" +
               $"SET IDENTITY_INSERT {nombreEntidad} ON;\n" +
               $"INSERT INTO {nombreEntidad} ({nombresColumnas}) VALUES ({valores});\n" +
               $"SET IDENTITY_INSERT {nombreEntidad} OFF;\n" +
               $"COMMIT TRANSACTION;\n" +
               $"{datosCompletos}";
    }


}