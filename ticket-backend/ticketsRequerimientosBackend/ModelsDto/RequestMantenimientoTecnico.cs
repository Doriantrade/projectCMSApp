namespace ticketsRequerimientosBackend.ModelsDto
{
    public class RequestMantenimientoTecnico
    {
        public int idTicket { get; set; }
        public int idAsignacionTecnico { get; set; }
        public string tipo { get; set; }
        public string HoraInicio { get; set; }
        public string HoraFin { get; set; }

    }
}
