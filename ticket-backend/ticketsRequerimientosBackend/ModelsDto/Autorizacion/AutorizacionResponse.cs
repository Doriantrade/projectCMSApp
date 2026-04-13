namespace ticketsRequerimientosBackend.ModelsDto.Autorizacion
{
    public class AutorizacionResponse
    {
        public CabeceraRequerimiento Cabecera { get; set; }
        public List<Tecnico> Tecnicos { get; set; }
    }
}
