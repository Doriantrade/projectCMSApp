using ticketsRequerimientosBackend.Models;

namespace ticketsRequerimientosBackend.funcionality
{
    public static class TicketHelper
    {

        public static string CalcularTiempoTotalExacto(this IEnumerable<IntervalosTicket> intervalos, int idRequerimiento)
        {
            var intervalosFiltrados = intervalos
                .Where(x => x.IdRequerimiento == idRequerimiento)
                .OrderBy(x => x.Fecrea)
                .ToList();

            if (!intervalosFiltrados.Any())
                return "0m 0s";

            var primerEstado = intervalosFiltrados.FirstOrDefault(x => x.EstadoTicket == 1);
            var ultimoEstado = intervalosFiltrados.LastOrDefault();

            if (primerEstado == null || ultimoEstado == null)
                return "0m 0s";

            var tiempoTotal = ultimoEstado.Fecrea - primerEstado.Fecrea;
            var minutos = (int)tiempoTotal.TotalMinutes;
            var segundos = tiempoTotal.Seconds;

            return $"{minutos}m {segundos}s";
        }

    }
}
