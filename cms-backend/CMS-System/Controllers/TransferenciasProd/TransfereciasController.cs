using cmsDb2024_System.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Text.RegularExpressions;

namespace CMS_System.Controllers.TransferenciasProd
{
    [Route("api/Transferencias")]
    [ApiController]
    public class TransfereciasController : ControllerBase
    {

        readonly cmsDb2024Context _context;

        public TransfereciasController(cmsDb2024Context context)
        {
            _context = context;
        }

        //[HttpGet]
        //[Route("obtenerDetalleTrans/{codcabe}")]
        //public async Task<IActionResult> obtenerDetalleTrans([FromRoute] string codcabe)
        //{
        //    var query = from edet in _context.Entytrandet
        //                join mq in _context.Maquinaria on edet.Codprod equals mq.Codmaquina
        //                join mt in _context.MasterTable on new { Codtipomaquina = mq.Codtipomaquina, Master = "MQT" } 
        //                equals new { Codtipomaquina = mt.Codigo, Master = mt.Master }
        //                where edet.Codtran == codcabe select new
        //                {
        //                    nombremaquina = mt.Nombre,
        //                    mq.Nserie,
        //                    mq.Marca,
        //                    mq.Modelo,
        //                    edet.Codtrandet,
        //                    edet.Codtran,
        //                    edet.Descripcion,
        //                    edet.Codusercrea,
        //                    edet.Codprod,
        //                    edet.Fecrea
        //                };

        //    var result = await query.ToListAsync();

        //    if (result == null)
        //    {
        //        return NotFound("No se ha podido obtener el detalle de items para el kardex...");
        //    }

        //    return Ok(result);
        //}


        [HttpGet]
        [Route("obtenerDetalleTrans/{codcabe}")]
        public async Task<IActionResult> obtenerDetalleTrans([FromRoute] string codcabe)
        {

            string Sentencia = " select mt.nombre as nombremaquina, mq.nserie, mc.nombremarca, mq.marca, mq.modelo, md.nombremodelo, edet.* from entytrandet as edet "
                               + " left join maquinaria as mq on mq.codmaquina = edet.codprod "
                               + " left join MasterTable as mt on mt.codigo = mq.codtipomaquina and master = 'MQT' " 
                               + " left join marca as mc on mc.codmarca = mq.marca and mc.codigotipomaq = mq.codtipomaquina " 
                               + " left join modelo as md on md.codmodelo = mq.modelo and md.codmarca = mq.marca and md.codigotipomaq = mq.codtipomaquina " 
                               + " where edet.codtran = @codcab ";

            DataTable dt = new DataTable();
            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString))
            {
                using (SqlCommand cmd = new SqlCommand(Sentencia, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@codcab", codcabe));
                    adapter.Fill(dt);
                }
            }

            if (dt == null)
            {
                return NotFound("No se ha podido crear...");
            }

            return Ok(dt);

        }


        [HttpPost]
        [Route("ProcesoTransdferenciaBod")]
        public async Task<IActionResult> ProcesoTransdferenciaBod([FromBody] Transferencia model )
        {

            string Sentencia = " exec ProcesoTransdferenciaBod @codprod, @state, @cuser, @boden, @bodsal, @ccia ";

            DataTable dt = new DataTable();
            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString))
            {
                using (SqlCommand cmd = new SqlCommand(Sentencia, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@codprod",   model.Codprod));
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@state",     model.State));
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@cuser",     model.Cuser));
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@boden",     model.Boden));
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@bodsal",    model.Bodsal));
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@ccia",      model.Ccia));
                    adapter.Fill(dt);
                }
            }

            if (dt == null)
            {
                return NotFound("No se ha podido crear...");
            }

            return Ok(dt);

        }

        [HttpGet]
        [Route("repoOrdenTransferProd/{ccia}/{ccab}")]
        public async Task<IActionResult> repoOrdenTransferProd([FromRoute] string ccia, [FromRoute] string ccab)
        {

            string Sentencia = " exec RepoOrdenTransferProd @codcia, @codcab ";

            DataTable dt = new DataTable();
            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString))
            {
                using (SqlCommand cmd = new SqlCommand(Sentencia, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@codcia", ccia));
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@codcab", ccab));
                    adapter.Fill(dt);
                }
            }

            if (dt == null)
            {
                return NotFound("No se ha podido crear...");
            }

            return Ok(dt);

        }



        [HttpGet]
        [Route("CliBodegAsign/{ccli}/{cmaq}")]
        public async Task<IActionResult> CliBodegAsign([FromRoute] string ccli, [FromRoute] string cmaq)
        {

            string Sentencia = " exec CliBodegAsign @codcli, @codmaqbod ";

            DataTable dt = new DataTable();
            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString))
            {
                using (SqlCommand cmd = new SqlCommand(Sentencia, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@codcli", ccli));
                    adapter.SelectCommand.Parameters.Add(new SqlParameter("@codmaqbod", cmaq));
                    adapter.Fill(dt);
                }
            }

            if (dt == null)
            {
                return NotFound("No se ha podido crear...");
            }

            return Ok(dt);

        }

        [HttpGet]
        [Route("invmov")]
        public async Task<IActionResult> invmov()
        {

            string Sentencia = " select * from invmov ";

            DataTable dt = new DataTable();
            using (SqlConnection connection = new SqlConnection(_context.Database.GetDbConnection().ConnectionString))
            {
                using (SqlCommand cmd = new SqlCommand(Sentencia, connection))
                {
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    adapter.SelectCommand.CommandType = CommandType.Text;

                    adapter.Fill(dt);
                }
            }

            if (dt == null)
            {
                return NotFound("No se ha podido crear...");
            }

            return Ok(dt);

        }
        
        


        [HttpPost]
        [Route("guardarDetalleTransaciion")]
        public async Task<IActionResult> guardarDetalleTransaciion([FromBody] Entytrandet model)
        {

            //if (_context.Entytrandet.Any(c => c.Codmaquina == model.Codmaquina))
            //{
            //    return BadRequest("Este producto ya existe en el detalle");
            //}

            if (ModelState.IsValid)
            {
                _context.Entytrandet.Add(model);
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

    }
}
