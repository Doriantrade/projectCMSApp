namespace ticketsRequerimientosBackend.ModelsDto
{
public class AsignacionTecnicoTicketDto
{
    public int IdRequerimiento { get; set; }
    public string CodTenicUser { get; set; }
    public int Reasignacion { get; set; }
    public string ResTecnico { get; set; }
    public string UrlA { get; set; }
    public string UrlB { get; set; }
    public DateTime Fechacrea { get; set; }
    public DateTime Fechares { get; set; }
}
}
