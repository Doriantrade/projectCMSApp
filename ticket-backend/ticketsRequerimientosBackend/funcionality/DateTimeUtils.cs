public static class DateTimeUtils
{
    public static int? CalcularMinutosDiferencia(DateTime? inicio, DateTime? fin)
    {
        if (!inicio.HasValue || !fin.HasValue) return null;
        return (int)(fin.Value - inicio.Value).TotalMinutes;
    }
}