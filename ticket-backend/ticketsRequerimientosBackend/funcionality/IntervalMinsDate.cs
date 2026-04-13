namespace ticketsRequerimientosBackend.funcionality
{
    public class IntervalMinsDate
    {
        public int CalcularMinutosDiferencia(DateTime? inicio, DateTime? fin)
        {
            if (!inicio.HasValue || !fin.HasValue) return 0;
            return (int)(fin.Value - inicio.Value).TotalMinutes;
        }
    }
}
