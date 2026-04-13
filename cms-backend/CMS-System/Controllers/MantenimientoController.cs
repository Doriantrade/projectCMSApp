using CMS_System.Controllers.DTO;
using cmsDb2024_System.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace CMS_System.Controllers
{
    [Route("api/Mantenimiento")]
    [ApiController]
    public class MantenimientoController : ControllerBase
    {

        private readonly cmsDb2024Context _context;
        private readonly IHubContext<MantenimimetoEstados> _hubContext;

        public MantenimientoController(cmsDb2024Context context, IHubContext<MantenimimetoEstados> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpPost]
        [Route("guardarMantenimiento")]
        public async Task<IActionResult> guardarMantenimiento([FromBody] Mantemaqcro model)
        {
            //var res = _context.Cronograma.Where( x => x.Codcrono == model.Codcrono );
            if (ModelState.IsValid)
            {
                _context.Mantemaqcro.Add(model);
                if (await _context.SaveChangesAsync() > 0)
                {
                    return Ok(model);
                }
                else
                {
                    return BadRequest("Datos incorrectos");
                }
            }
            else
            {
                return BadRequest("ERROR");
            }
        }

        [HttpPut("actualizarEstado/{id}")]
        public async Task<IActionResult> ActualizarEstado([FromRoute] int id, [FromHeader] int nuevoEstado, [FromHeader] string usuario)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // 1. Obtener el mantenimiento actual
                    var mantenimiento = await _context.Mantemaqcro.FindAsync(id);
                    if (mantenimiento == null) return NotFound("Mantenimiento no encontrado");
                    // --- LÓGICA MODIFICADA: Datos del TÉCNICO y Maquinaria ---
                    var datosExtras = await (from u in _context.Usuario
                                                 // Buscamos al técnico asignado al mantenimiento
                                             where u.Coduser == mantenimiento.Codtecnico
                                             let maquina = _context.Maquinaria.FirstOrDefault(m => m.Codmaquina == mantenimiento.Codprod)
                                             select new
                                             {
                                                 NombreCompletoTecnico = u.Nombre + " " + u.Apellido,
                                                 FotoPerfilTecnico = _context.ImgFile
                                                    .Where(i => i.Codentidad == "IMG-" + u.Coduser && i.Tipo == "Perfil")
                                                    .Select(i => i.Imagen)
                                                    .FirstOrDefault(),

                                                 DetalleMaquina = (from mq in _context.Maquinaria
                                                                   join mc in _context.Marca on new { M = mq.Marca, T = mq.Codtipomaquina } equals new { M = mc.Codmarca, T = mc.Codigotipomaq } into mcGroup
                                                                   from mc in mcGroup.DefaultIfEmpty()
                                                                   join md in _context.Modelo on new { Mo = mq.Modelo, Ma = mq.Marca, T = mq.Codtipomaquina } equals new { Mo = md.Codmodelo, Ma = md.Codmarca, T = md.Codigotipomaq } into mdGroup
                                                                   from md in mdGroup.DefaultIfEmpty()
                                                                   join mt in _context.MasterTable on mq.Codtipomaquina equals mt.Codigo into mtGroup
                                                                   from mt in mtGroup.DefaultIfEmpty()
                                                                   where mq.Codmaquina == mantenimiento.Codprod && (mt.Codigo == null || mt.Master == "MQT")
                                                                   select new
                                                                   {
                                                                       Nserie = mq.Nserie,
                                                                       NombreMarca = mc.Nombremarca,
                                                                       NombreModelo = md.Nombremodelo,
                                                                       NombreTipoMaquina = mt.Nombre
                                                                   }).FirstOrDefault()
                                             }).FirstOrDefaultAsync();

                    // Asignamos los datos obtenidos del técnico
                    string nombreTecnico = datosExtras?.NombreCompletoTecnico ?? "Técnico no asignado";
                    string imagenPerfil = datosExtras?.FotoPerfilTecnico ?? "";
                    var infoMaquina = datosExtras?.DetalleMaquina;
                    // -------------------------------------------------------

                    DateTime fechaActual = DateTime.Now;
                    int segundosCalculados = 0;

                    // 2. Lógica de cálculo de tiempo
                    var ultimoIntervalo = await _context.IntervalosMantenimiento
                        .Where(x => x.IdRequerimiento == mantenimiento.IdRequer)
                        .OrderByDescending(x => x.IdIntervalo)
                        .FirstOrDefaultAsync();

                    if (ultimoIntervalo != null)
                    {
                        var diferencia = fechaActual - ultimoIntervalo.Fecrea;
                        segundosCalculados = (int)diferencia.TotalSeconds + (ultimoIntervalo.Mintime ?? 0);
                    }

                    // 3. Registrar el nuevo intervalo (el Usercrea sigue siendo el 'usuario' del header que hace la acción)
                    var nuevoIntervalo = new IntervalosMantenimiento
                    {
                        IdRequerimiento = mantenimiento.IdRequer,
                        Mintime = segundosCalculados,
                        Fecrea = fechaActual,
                        Usercrea = usuario,
                        Tipo = 1,
                        EstadoTicket = nuevoEstado,
                        Observacion = ObtenerDescripcionEstado(nuevoEstado)
                    };

                    _context.IntervalosMantenimiento.Add(nuevoIntervalo);
                    mantenimiento.Estado = nuevoEstado;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    // 5. Enviar Notificación vía SignalR
                    var dataRelay = new MantenimientoNotificacionDto
                    {
                        IdMantenimiento = id,
                        Estado = nuevoEstado,
                        NombreEstado = nuevoIntervalo.Observacion,
                        Usuario = usuario, // Quien realiza el cambio
                        ImagenPerfil = imagenPerfil, // Ahora es la foto del TÉCNICO
                        SegundosAcumulados = segundosCalculados,
                        FechaCambio = fechaActual,
                        IdTecnico = mantenimiento.Codtecnico,
                        NombreTecnico = nombreTecnico, // Nombre y apellido del técnico
                        Nserie = infoMaquina?.Nserie,
                        NombreMarca = infoMaquina?.NombreMarca,
                        NombreModelo = infoMaquina?.NombreModelo,
                        NombreTipoMaquina = infoMaquina?.NombreTipoMaquina
                    };

                    await _hubContext.Clients.All.SendAsync("MantenimimetoEstadosSend", dataRelay);
                    return Ok(dataRelay);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return BadRequest($"Error en la operación: {ex.Message}");
                }
            }

        }


        private string ObtenerDescripcionEstado(int estado)
        {
            return estado switch
            {
                1 => "Llegó el ticket",
                2 => "Ticket revisado",
                3 => "Mantenimiento Iniciado",
                4 => "Solicitud de Repuestos",
                5 => "Fin Mantenimiento",
                _ => "Estado no definido"
            };
        }

        // Método auxiliar para la observación
        private string ObtenerNombreEstado(int estado)
        {
            return estado switch
            {
                1 => "Llegó el ticket",
                2 => "Ticket revisado",
                3 => "Mantenimiento Iniciado",
                4 => "Solicitud de Repuestos",
                5 => "Fin Mantenimiento",
                _ => "Estado Desconocido"
            };
        }

        [HttpGet("ObtenerMantenimientoCrono/{cagencia}/{m}/{a}/{l}")]
        public async Task<IActionResult> ObtenerMantenimientoCrono([FromRoute] string cagencia, [FromRoute] string m, [FromRoute] string a, [FromRoute] string l)
        {

            string Sentencia = " exec ObtenerMantenimiento @codagencia, @mes, @anio, @local ";

            DataTable dt = new DataTable();
            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString))
            {
                using (SqlCommand cmd = new SqlCommand(Sentencia, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@codagencia", cagencia));
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@mes",   m));
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@anio",  a));
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@local", l));
                    adapter.Fill(dt);
                }
            }

            if (dt == null)
            {
                return NotFound("No se ha podido crear...");
            }

            return Ok(dt);

        }


        [HttpGet("eliminarMantenimiento/{id}")]
        public async Task<IActionResult> eliminarMantenimiento([FromRoute] int id)
        {

            string Sentencia = " delete from mantemaqcro where idmantenimiento = @idmante  ";

            DataTable dt = new DataTable();
            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString))
            {
                using (SqlCommand cmd = new SqlCommand(Sentencia, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@idmante", id));
                    adapter.Fill(dt);
                }
            }

            if (dt == null)
            {
                return NotFound("No se ha podido crear...");
            }

            return Ok(dt);

        }

    }
}
