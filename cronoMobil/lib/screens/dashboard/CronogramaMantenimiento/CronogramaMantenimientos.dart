import 'package:cmsmobile/screens/dashboard/CronogramaMantenimiento/Estructure/CronogramaCard.dart';
import 'package:cmsmobile/screens/dashboard/CronogramaMantenimiento/Estructure/DateRangeFilterDialog.dart';
import 'package:cmsmobile/screens/services/CronogramaService.dart';
import 'package:cmsmobile/screens/services/SyncService.dart';
import 'package:flutter/material.dart';
import 'package:cmsmobile/screens/services/SessionManager.dart';
// Nuevo: Importar el diálogo de filtro

// Asumimos que CronogramaItem está disponible a través de una importación
// o definido en cronograma_card.dart (como se ve en el archivo provisto).

class CronogramaMantenimientos extends StatefulWidget {
  const CronogramaMantenimientos({super.key});

  @override
  State<CronogramaMantenimientos> createState() =>
      _CronogramaMantenimientosState();
}

class _CronogramaMantenimientosState extends State<CronogramaMantenimientos> {
  String _coduser = '';
  String companyCode = 'CMS-001-2023';
  int cantidadCronograma = 0;
  bool _isLoading = true;

  // Lista original completa de datos
  List<CronogramaItem> _allCronogramaItems = [];
  // Lista filtrada (la que se muestra)
  List<CronogramaItem> _filteredCronogramaItems = [];

  // Mapa para almacenar los elementos agrupados por fecha (clave: "AAAA-MM-DD")
  Map<String, List<CronogramaItem>> _groupedCronograma = {};

  // Estados para el filtro de fechas
  DateTime? _startDate;
  DateTime? _endDate;

  @override
  void initState() {
    super.initState();
    _loadUserData();
    SyncService.syncOfflineData(); // Trigger sync in background
  }

  // Helper para agrupar y ordenar los ítems por fecha y hora
  void _groupItemsByDate(List<CronogramaItem> items) {
    _groupedCronograma = {};

    // 1. Ordenar por fecha y hora (Descendente: más reciente primero)
    items.sort((a, b) {
      DateTime dateA =
          DateTime.tryParse(a.fechamantenimiento) ?? DateTime(1900);
      DateTime dateB =
          DateTime.tryParse(b.fechamantenimiento) ?? DateTime(1900);

      // Comparación inversa para descendente
      int dateComparison = dateB.compareTo(dateA);
      if (dateComparison != 0) {
        return dateComparison;
      }

      // Ordenar por hora si las fechas son iguales (también descendente)
      if (a.horaInicialReal.isNotEmpty && b.horaInicialReal.isNotEmpty) {
        try {
          final partsA = a.horaInicialReal.split(':');
          final partsB = b.horaInicialReal.split(':');
          final timeA = Duration(
            hours: int.parse(partsA[0]),
            minutes: int.parse(partsA[1]),
          );
          final timeB = Duration(
            hours: int.parse(partsB[0]),
            minutes: int.parse(partsB[1]),
          );
          return timeB.compareTo(timeA);
        } catch (e) {
          // Fallback si el parseo de hora falla
        }
      }
      return 0;
    });

    // 2. Agrupar por la fecha (sólo día, mes, año)
    for (var item in items) {
      try {
        final dateTime = DateTime.parse(item.fechamantenimiento);
        // Formato clave: AAAA-MM-DD para garantizar la agrupación correcta y ordenada
        final formattedDate =
            '${dateTime.year}-${dateTime.month.toString().padLeft(2, '0')}-${dateTime.day.toString().padLeft(2, '0')}';

        if (!_groupedCronograma.containsKey(formattedDate)) {
          _groupedCronograma[formattedDate] = [];
        }
        _groupedCronograma[formattedDate]!.add(item);
      } catch (e) {
        // Manejo de ítems con fecha inválida
        if (!_groupedCronograma.containsKey('Fecha Inválida')) {
          _groupedCronograma['Fecha Inválida'] = [];
        }
        _groupedCronograma['Fecha Inválida']!.add(item);
      }
    }

    // Actualizar la cantidad total de registros mostrados
    cantidadCronograma = items.length;
  }

  // Helper para formatear la fecha del encabezado (ej: 28/8/2025)
  String _formatHeaderDate(String dateKey) {
    if (dateKey == 'Fecha Inválida') return 'Registros sin Fecha Válida';

    try {
      final parts = dateKey.split('-'); // Esperamos AAAA-MM-DD
      final year = parts[0];
      final month = parts[1];
      final day = parts[2];
      return '$day/$month/$year';
    } catch (e) {
      return dateKey;
    }
  }

  // Implementación de la función para aplicar el filtro (llamada por el diálogo)
  void _applyDateFilter(DateTime? newStartDate, DateTime? newEndDate) {
    if (newStartDate == null || newEndDate == null) {
      // Debería ser innecesario si el botón "Aplicar Filtro" está deshabilitado
      return;
    }

    // 1. Actualizar el estado de las fechas
    setState(() {
      _startDate = newStartDate;
      _endDate = newEndDate;
    });

    // 2. Filtrar la lista completa
    final filtered = _allCronogramaItems.where((item) {
      try {
        final itemDate = DateTime.parse(item.fechamantenimiento);
        // Normalizar a medianoche para solo comparar día, mes y año
        final normalizedItemDate = DateTime(
          itemDate.year,
          itemDate.month,
          itemDate.day,
        );

        // Asegurar que el rango sea inclusivo (el fin del día final)
        // La fecha final seleccionada representa el día completo
        final normalizedEndDate = DateTime(
          _endDate!.year,
          _endDate!.month,
          _endDate!.day,
          23,
          59,
          59,
        );

        // Compara si la fecha del ítem está dentro del rango inclusivo
        return normalizedItemDate.isAfter(
              _startDate!.subtract(const Duration(milliseconds: 1)),
            ) &&
            normalizedItemDate.isBefore(
              normalizedEndDate.add(const Duration(milliseconds: 1)),
            );
      } catch (e) {
        // Si la fecha del ítem es inválida, no se incluye en el filtro
        return false;
      }
    }).toList();

    // 3. Actualizar la vista con los datos filtrados
    setState(() {
      _filteredCronogramaItems = filtered;
      _groupItemsByDate(_filteredCronogramaItems);
    });
  }

  // Implementación de la función para restablecer el filtro (llamada por el diálogo)
  void _resetFilter() {
    setState(() {
      _startDate = null;
      _endDate = null;
      _filteredCronogramaItems =
          _allCronogramaItems; // Mostrar la lista completa
      _groupItemsByDate(_filteredCronogramaItems);
    });
  }

  Future<void> _loadUserData() async {
    try {
      final userData = await SessionManager.getUserData();
      setState(() {
        _coduser = userData['coduser'] ?? '';
      });
      await _loadCronograma();
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      print('Error al cargar datos del usuario: $e');
    }
  }

  Future<void> _loadCronograma() async {
    try {
      // Asegúrate de que CronogramaService.getCronograma devuelva List<CronogramaItem>
      final cronograma = await CronogramaService.getCronograma(
        _coduser,
        companyCode,
      );

      // Filtrar: No mostrar los mantenimientos que ya están finalizados (estadoMantenimiento == 5)
      // o cancelados (estado == -1)
      final activeCronograma = cronograma
          .where((item) => item.estadoMantenimiento != 5 && item.estado != -1)
          .toList();

      setState(() {
        _allCronogramaItems = activeCronograma;
        _filteredCronogramaItems =
            activeCronograma; // Inicialmente, filtrada es igual a toda la lista

        // Llamar a la función de agrupación después de cargar los datos
        _groupItemsByDate(_filteredCronogramaItems);

        _isLoading = false;
      });
      print(
        'Cronograma cargado y agrupado: ${_groupedCronograma.length} grupos',
      );
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      print('Error al cargar cronograma: $e');
    }
  }

  // Lista de las claves (fechas) del mapa agrupado, ordenadas descendente
  List<String> get _sortedDateKeys {
    final keys = _groupedCronograma.keys.toList();
    // Ordenar las fechas de forma descendente (AAAA-MM-DD)
    keys.sort((a, b) => b.compareTo(a));
    return keys;
  }

  // Función para mostrar el diálogo de selección de fechas (usa el nuevo widget)
  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return DateRangeFilterDialog(
          initialStartDate: _startDate,
          initialEndDate: _endDate,
          onApplyFilter: _applyDateFilter, // Se pasa la función de filtrado
          onResetFilter: _resetFilter, // Se pasa la función de restablecimiento
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Cronograma de Mantenimientos',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: const Color(0xFF00796B),
        elevation: 10.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          // 1. Contador (Altura definida)
          Padding(
            padding: const EdgeInsets.all(10.0),
            child: Text(
              'Cantidad de registros: $cantidadCronograma',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          // 2. Contenido Principal (Expanded para tomar el espacio restante)
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: _filteredCronogramaItems.isEmpty
                        ? Center(
                            child: Text(
                              _allCronogramaItems.isEmpty
                                  ? 'No hay mantenimientos programados'
                                  : 'No hay registros para el rango seleccionado (${_startDate != null ? _formatSelectedDate(_startDate) : 'N/A'} - ${_endDate != null ? _formatSelectedDate(_endDate) : 'N/A'})',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 18,
                                color: Colors.grey,
                              ),
                            ),
                          )
                        : ListView.builder(
                            itemCount: _groupedCronograma.length,
                            itemBuilder: (context, groupIndex) {
                              final dateKey = _sortedDateKeys[groupIndex];
                              final groupItems = _groupedCronograma[dateKey]!;
                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Encabezado de la Fecha (Estilo Agenda)
                                  Padding(
                                    padding: const EdgeInsets.only(
                                      top: 20.0,
                                      bottom: 8.0,
                                    ),
                                    child: Text(
                                      _formatHeaderDate(dateKey),
                                      style: const TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        color: Color(
                                          0xFF00796B,
                                        ), // Color del AppBar
                                      ),
                                    ),
                                  ),
                                  // Lista de tarjetas para esa fecha
                                  ...groupItems.map((item) {
                                    return CronogramaCard(item: item);
                                  }).toList(),
                                ],
                              );
                            },
                          ),
                  ),
          ),
        ],
      ),

      // Botón flotante para el calendario
      floatingActionButtonLocation: FloatingActionButtonLocation.miniStartFloat,
      floatingActionButton: FloatingActionButton(
        onPressed: _showFilterDialog,
        backgroundColor: const Color(0xFF00796B),
        child: const Icon(Icons.calendar_today, color: Colors.white),
      ),
    );
  }

  // Helper para mostrar la fecha seleccionada en el mensaje de no resultados
  String _formatSelectedDate(DateTime? date) {
    return date == null ? 'N/A' : '${date.day}/${date.month}/${date.year}';
  }
}
