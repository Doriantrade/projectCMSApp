namespace ticketsRequerimientosBackend.ModelsDto.Autorizacion
{
    public class CabeceraRequerimiento
    {
        public int IdTicket { get; set; }
        public string IdAgencia { get; set; }
        public string NombreAgencia { get; set; }
        public string NombreCliente { get; set; }
        public string Url { get; set; }
        public int Estado { get; set; }
        public string NombreProvincia { get; set; }
        public string NombreCiudad { get; set; }
        public DateTime Fecrea { get; set; }
        public DateTime FechainiPlanif { get; set; }
        public DateTime FechafinPlanif { get; set; }
        public string Area { get; set; }
        public string MotivoTrabajo { get; set; }
        public string EspacioSirve { get; set; }
        public string DescripcionProblema { get; set; }
        public string NserieEquipo { get; set; }
        public string Beneficiario { get; set; }
        public string Telefono { get; set; }
        public string Email { get; set; }
        public DateTime FecreaRealIni { get; set; }
        public DateTime FecreaRealFin { get; set; }
        public string CodTipoEquipo { get; set; }
        public string CodMarca { get; set; }
        public string CodModelo { get; set; }
        public string Tipo { get; set; }
        public TimeSpan HoraInicialReal { get; set; }
        public TimeSpan HoraFinalReal { get; set; }
        public TimeSpan HoraInicialPlanificada { get; set; }
        public TimeSpan HoraFinalPlanificada { get; set; }
        public decimal ValorTicketRequerimiento { get; set; }
        public string Observacion { get; set; }
        public string NombreEmpresa { get; set; }
        public string TelefonoEmpresa { get; set; }
        public string WebEmpresa { get; set; }
        public string ImagenCliente { get; set; }
    }
}
