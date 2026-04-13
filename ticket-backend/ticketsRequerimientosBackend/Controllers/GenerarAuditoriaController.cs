using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using ticketsRequerimientosBackend.Models;
using ticketsRequerimientosBackend.ModelsDto.Autorizacion;

namespace ticketsRequerimientosBackend.Controllers
{
    [Route("api/Autorizacion")]
    [ApiController]
    public class GenerarAuditoriaController : ControllerBase
    {
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly cmsDb2024Context _context;

        public GenerarAuditoriaController(cmsDb2024Context context, IWebHostEnvironment hostingEnvironment)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
        }

        [HttpGet("GenerarAutorizacion/{idTicket}")]
        public async Task<IActionResult> GenerarAutorizacion([FromRoute] int idTicket)
        {
            string Sentencia = "exec GenerarAutorizacion @idTicket";

            DataTable dt = new DataTable();
            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString))
            {
                using (SqlCommand cmd = new SqlCommand(Sentencia, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@idTicket", idTicket));
                    adapter.Fill(dt);
                }
            }

            if (dt == null || dt.Rows.Count == 0)
            {
                return NotFound("No se ha podido crear...");
            }

            // Transformar el DataTable a la estructura deseada
            var response = new AutorizacionResponse
            {
                Tecnicos = new List<Tecnico>()
            };

            // Asumimos que todos los registros tienen la misma información de cabecera
            DataRow firstRow = dt.Rows[0];
            response.Cabecera = new CabeceraRequerimiento
            {
                IdTicket = Convert.ToInt32(firstRow["idTicket"]),
                IdAgencia = firstRow["idAgencia"].ToString(),
                NombreAgencia = firstRow["nombreAgencia"].ToString(),
                NombreCliente = firstRow["nombreCliente"].ToString(), // Asumiendo que 'imagenCliente' en tu código original debería ser 'nombreCliente' según la clase.
                Url = firstRow["url"].ToString(),
                Estado = Convert.ToInt32(firstRow["estado"]), // Convertir a int si 'Estado' es int en la base de datos
                NombreProvincia = firstRow["nombreProvincia"].ToString(),
                NombreCiudad = firstRow["nombreCiudad"].ToString(),
                Fecrea = Convert.ToDateTime(firstRow["fecrea"]),
                FechainiPlanif = Convert.ToDateTime(firstRow["fechainiPlanif"]),
                FechafinPlanif = Convert.ToDateTime(firstRow["fechafinPlanif"]),
                Area = firstRow["area"].ToString(),
                MotivoTrabajo = firstRow["motivoTrabajo"].ToString(),
                EspacioSirve = firstRow["espacioSirve"].ToString(),
                DescripcionProblema = firstRow["descripcionProblema"].ToString(),
                NserieEquipo = firstRow["nserieEquipo"].ToString(),
                Beneficiario = firstRow["beneficiario"].ToString(),
                Telefono = firstRow["telefono"].ToString(),
                Email = firstRow["email"].ToString(),
                FecreaRealIni = Convert.ToDateTime(firstRow["fecreaRealIni"]),
                FecreaRealFin = Convert.ToDateTime(firstRow["fecreaRealFin"]),
                CodTipoEquipo = firstRow["codTipoEquipo"].ToString(),
                CodMarca = firstRow["codMarca"].ToString(),
                CodModelo = firstRow["codModelo"].ToString(),
                Tipo = firstRow["tipo"].ToString(),
                HoraInicialReal = TimeSpan.Parse(firstRow["horaInicialReal"].ToString()), // Asegúrate de que el formato en el DataTable sea compatible con TimeSpan.Parse
                HoraFinalReal = TimeSpan.Parse(firstRow["horaFinalReal"].ToString()),
                HoraInicialPlanificada = TimeSpan.Parse(firstRow["horaInicialPlanificada"].ToString()),
                HoraFinalPlanificada = TimeSpan.Parse(firstRow["horaFinalPlanificada"].ToString()),
                ValorTicketRequerimiento = Convert.ToDecimal(firstRow["valorTicketRequerimiento"]),
                Observacion = firstRow["observacion"].ToString(),
                NombreEmpresa = firstRow["nombreEmpresa"].ToString(),
                TelefonoEmpresa = firstRow["telefonoEmpresa"].ToString(),
                WebEmpresa = firstRow["webEmpresa"].ToString(),
                ImagenCliente = firstRow["imagenCliente"].ToString()
            };

            // Agregar todos los técnicos
            foreach (DataRow row in dt.Rows)
            {
                response.Tecnicos.Add(new Tecnico
                {
                    NombreTecnico = row["nombreTecino"].ToString(),
                    CedulaTecnico = row["cedulaTecnico"].ToString(),
                    ImagenTecnicoPerfil = row["imagenTecnicoPerfil"].ToString() // Sin espacio al final
                });
            }
            return Ok(response);
        }

    }
}
