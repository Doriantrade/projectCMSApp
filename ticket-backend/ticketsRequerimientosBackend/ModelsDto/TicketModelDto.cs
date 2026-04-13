namespace ticketsRequerimientosBackend.ModelsDto
{
    public class TicketModelDto
    {
        public int Id { get; set; }
        public int IdTicket { get; set; }
        public int? Estado { get; set; }
        public string Tipo { get; set; }
        public string nombreAgencia { get; set; }
        public string nombreCliente { get; set; }
        public string codcli { get; set; }
        public string TiempoTotalExactoMinutos { get; set; }
    }
}
