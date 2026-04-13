namespace ticketsRequerimientosBackend.ModelsDto
{
    public class TicketRequerimiento2Dto
    {
        public int IdTicket { get; set; }
        public int TiempoTotalExactoMinutos { get; set; }
        public int CantRep { get; set; }
        public string Usercrea { get; set; }
        public string IdAgencia { get; set; }
        public string Url { get; set; }
        public string Estado { get; set; }
        public string Codprov { get; set; }
        public string Ciudad { get; set; }
        public DateTime Fecrea { get; set; }
        public DateTime? FechainiPlanif { get; set; }
        public DateTime? FechafinPlanif { get; set; }
        public int? ContadorInicial { get; set; }
        public int? ContadorFinal { get; set; }
        public string CodMaquina { get; set; }
        public string CodModelo { get; set; }
        public string Area { get; set; }
        public string MotivoTrabajo { get; set; }
        public string EspacioSirve { get; set; }
        public string DescripcionProblema { get; set; }
        public string NserieEquipo { get; set; }
        public string Beneficiario { get; set; }
        public string Telefono { get; set; }
        public string Email { get; set; }
        public DateTime? FecreaRealIni { get; set; }
        public DateTime? FecreaRealFin { get; set; }
        public string CodTipoEquipo { get; set; }
        public string TipoRequerimiento { get; set; }
        public TimeSpan HoraInicialReal { get; set; }
        public TimeSpan HoraFinalReal { get; set; }
        public TimeSpan HoraInicialPlanificada { get; set; }
        public TimeSpan HoraFinalPlanificada { get; set; }
        public string NombreAgencia { get; set; }
        public string Codcliente { get; set; }
        public string Codfrecuencia { get; set; }
        public string NombreCliente { get; set; }
        public string NombreProvincia { get; set; }
        public string NombreCanton { get; set; }
        public string NombreTipoRequerimiento { get; set; }
        public DateTime FechaActual { get; set; }
        public int HorasRestantes { get; set; }
        public decimal Valor { get; set; }
        public string Observacion { get; set; }
        public string ImagenRequerimiento { get; set; }
        public byte[] Imagen { get; set; } // Asumiendo que 'img.imagen' es un campo binario para la imagen.
        public int FileCotiza { get; set; }
        public int FileRepTec { get; set; }
        public int FileNotEnt { get; set; }
        public string NombreMarca { get; set; }
    }
}