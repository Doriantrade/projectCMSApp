namespace CMS_System.Controllers.DTO
{
    public class MantenimientoNotificacionDto
    {
        public int IdMantenimiento { get; set; }
        public int Estado { get; set; }
        public string NombreEstado { get; set; }
        public string Usuario { get; set; }
        public string ImagenPerfil { get; set; }
        public string Nserie {get;set;}
        public string NombreMarca {get;set;}
        public string NombreModelo {get;set;}
        public string NombreTipoMaquina { get; set; }
        public int SegundosAcumulados { get; set; }
        public DateTime FechaCambio { get; set; }
        public string IdTecnico { get; set; }
        public string NombreTecnico { get; set; }
    }
}
