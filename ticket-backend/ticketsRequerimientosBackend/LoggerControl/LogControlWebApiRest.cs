namespace ticketsRequerimientosBackend.LoggerControl
{
    public class LogControlWebApiRest
    {
        private readonly ILogger _logger;

        public LogControlWebApiRest(ILogger<LogControlWebApiRest> logger)
        {
            _logger = logger;
        }

        public void LogAction(string usuario, string descripcion, bool exito)
        {
            string estado = exito ? "exitoso" : "no enviado";
            _logger.LogInformation("El usuario: {Usuario} ha consumido la API {Descripcion} [{Estado}: {Time}] ", usuario, descripcion, estado, DateTime.UtcNow);
        }
    }
}
