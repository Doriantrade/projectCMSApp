import 'package:flutter/material.dart';

// Definición del tipo de función para el callback de filtro.
typedef FilterCallback = void Function(DateTime? startDate, DateTime? endDate);

class DateRangeFilterDialog extends StatefulWidget {
  final DateTime? initialStartDate;
  final DateTime? initialEndDate;
  final FilterCallback onApplyFilter;
  final VoidCallback onResetFilter;

  const DateRangeFilterDialog({
    super.key,
    this.initialStartDate,
    this.initialEndDate,
    required this.onApplyFilter,
    required this.onResetFilter,
  });

  @override
  State<DateRangeFilterDialog> createState() => _DateRangeFilterDialogState();
}

class _DateRangeFilterDialogState extends State<DateRangeFilterDialog> {
  DateTime? _tempStartDate;
  DateTime? _tempEndDate;

  @override
  void initState() {
    super.initState();
    // Inicializa el estado temporal con los valores pasados
    _tempStartDate = widget.initialStartDate;
    _tempEndDate = widget.initialEndDate;
  }

  // Función para seleccionar la fecha inicial o final
  Future<void> _selectDate(bool isStart) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: (isStart ? _tempStartDate : _tempEndDate) ?? DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2101),
    );

    if (picked != null) {
      setState(() {
        if (isStart) {
          _tempStartDate = picked;
          // Asegurar que la fecha final no sea anterior a la inicial
          if (_tempEndDate != null && _tempEndDate!.isBefore(_tempStartDate!)) {
            _tempEndDate = _tempStartDate;
          }
        } else {
          _tempEndDate = picked;
          // Asegurar que la fecha inicial no sea posterior a la final
          if (_tempStartDate != null &&
              _tempStartDate!.isAfter(_tempEndDate!)) {
            _tempStartDate = _tempEndDate;
          }
        }
      });
    }
  }

  // Helper para mostrar la fecha seleccionada
  String _formatSelectedDate(DateTime? date) {
    return date == null
        ? 'Seleccionar fecha'
        : '${date.day}/${date.month}/${date.year}';
  }

  // --- El cuerpo del Diálogo (AlertDialog) ---

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Filtrar por Rango de Fechas'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            // Selector de Fecha Inicial
            ListTile(
              leading: const Icon(Icons.date_range),
              title: const Text('Fecha Inicial'),
              subtitle: Text(_formatSelectedDate(_tempStartDate)),
              onTap: () => _selectDate(true),
            ),
            // Selector de Fecha Final
            ListTile(
              leading: const Icon(Icons.date_range),
              title: const Text('Fecha Final'),
              subtitle: Text(_formatSelectedDate(_tempEndDate)),
              onTap: () => _selectDate(false),
            ),
            const SizedBox(height: 20),
            // Botón Restablecer
            TextButton.icon(
              onPressed: () {
                // Notifica al widget padre para restablecer y actualiza el estado interno del diálogo.
                setState(() {
                  _tempStartDate = null;
                  _tempEndDate = null;
                });
                widget.onResetFilter(); // Llama a reset y cierra el diálogo
              },
              icon: const Icon(Icons.refresh),
              label: const Text('Restablecer Filtro'),
            ),
          ],
        ),
      ),
      actions: <Widget>[
        TextButton(
          child: const Text('Cancelar'),
          onPressed: () {
            Navigator.of(context).pop();
          },
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF00796B), // Color primario
            foregroundColor: Colors.white,
          ),
          onPressed: _tempStartDate != null && _tempEndDate != null
              ? () {
                  // Llama al callback con las fechas seleccionadas
                  widget.onApplyFilter(_tempStartDate, _tempEndDate);
                  Navigator.of(context).pop(); // Cierra el diálogo
                }
              : null, // Deshabilitar si no hay fechas seleccionadas
          child: const Text('Aplicar Filtro'),
        ),
      ],
    );
  }
}
