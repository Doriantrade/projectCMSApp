import 'package:cmsmobile/screens/dashboard/CronogramaMantenimiento/TimeExpireDialog/TimeExpiredDialog.dart';
import 'package:flutter/material.dart';
import 'package:cmsmobile/screens/services/CronogramaService.dart';
import 'package:cmsmobile/screens/services/SessionManager.dart';
import 'dart:convert';
import 'dart:typed_data';

// Define el tipo de función para el callback del botón, para que el padre la provea.
typedef ShowImageDialogCallback = void Function(String imageUrl);

class CronogramaDetailContent extends StatelessWidget {
  final CronogramaItem item;
  final String formattedIdRequer;
  final String imageUrl;
  final ShowImageDialogCallback onShowImageDialog;
  final Color Function(int) getStatusColor;
  final String Function(int) getStatusText;
  final String Function(String) formatDate;

  const CronogramaDetailContent({
    super.key,
    required this.item,
    required this.formattedIdRequer,
    required this.imageUrl,
    required this.onShowImageDialog,
    required this.getStatusColor,
    required this.getStatusText,
    required this.formatDate,
  });

  Widget _buildPlaceholder() {
    return Container(
      color: Colors.grey[300],
      alignment: Alignment.center,
      child: Icon(Icons.person, size: 50, color: Colors.grey[600]),
    );
  }

  Widget _imageFromBase64(String base64String) {
    try {
      if (base64String.length < 50) {
        throw const FormatException('String too short for a Base64 image.');
      }
      final String data = base64String.contains(',')
          ? base64String.split(',').last
          : base64String;
      final Uint8List bytes = base64Decode(data);

      return Image.memory(
        bytes,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return _buildPlaceholder();
        },
      );
    } catch (e) {
      return _buildPlaceholder();
    }
  }

  // --- Widget para mostrar cada fila de detalle ---
  Widget _buildDetailRow(
    String label,
    String value, {
    IconData? icon,
    bool isHighlighted = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (icon != null)
            Padding(
              padding: const EdgeInsets.only(right: 8.0, top: 2),
              child: Icon(
                icon,
                size: 18,
                color: isHighlighted
                    ? const Color(0xFF00796B)
                    : Colors.grey[600],
              ),
            ),
          SizedBox(
            width: 140, // Ancho fijo para las etiquetas
            child: Text(
              '$label:',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
                color: isHighlighted ? const Color(0xFF00796B) : Colors.black87,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value.isNotEmpty ? value : 'Sin datos',
              style: TextStyle(
                fontSize: 14,
                color: isHighlighted ? Colors.redAccent : Colors.black54,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Widget para títulos de sección
  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10.0),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Colors.black87,
        ),
      ),
    );
  }

  // --- LÓGICA DE VALIDACIÓN DE TIEMPO ---
  bool _isTimeValid(CronogramaItem item) {
    try {
      // 1. Obtener la hora actual
      final DateTime currentTime = DateTime.now();

      // 2. Parsear el componente de TIEMPO (Hora:Minuto)
      if (item.horaInicialReal.isEmpty || item.horaFinalReal.isEmpty) {
        debugPrint(
          "Advertencia: Una de las horas está vacía. Se permite la ejecución.",
        );
        return true;
      }

      final List<String> startHourParts = item.horaInicialReal.split(':');
      final List<String> endHourParts = item.horaFinalReal.split(':');

      if (startHourParts.length < 2 || endHourParts.length < 2) {
        debugPrint(
          "Advertencia: Formato de hora inválido (${item.horaInicialReal} / ${item.horaFinalReal}). Se permite la ejecución.",
        );
        return true;
      }

      final int startHour = int.tryParse(startHourParts[0].trim()) ?? 0;
      final int startMinute = int.tryParse(startHourParts[1].trim()) ?? 0;
      final int endHour = int.tryParse(endHourParts[0].trim()) ?? 23;
      final int endMinute = int.tryParse(endHourParts[1].trim()) ?? 59;

      // 3. Parsear el componente de FECHA (Día/Mes/Año)
      final String iniDateString = item.fecreaRealIni.toString();
      final String endDateString = item.fecreaRealFin.toString();

      final DateTime? iniDateParsed = DateTime.tryParse(iniDateString);
      final DateTime? endDateParsed = DateTime.tryParse(endDateString);

      if (iniDateParsed == null || endDateParsed == null) {
        debugPrint(
          "Advertencia: No se pudo parsear las fechas ($iniDateString / $endDateString). Se permite la ejecución.",
        );
        return true;
      }

      // 4. Crear objetos DateTime completos
      final DateTime startTime = DateTime(
        iniDateParsed.year,
        iniDateParsed.month,
        iniDateParsed.day,
        startHour,
        startMinute,
      );

      final DateTime endTime = DateTime(
        endDateParsed.year,
        endDateParsed.month,
        endDateParsed.day,
        endHour,
        endMinute,
      );

      // 5. Validación
      final bool isAfterStart =
          currentTime.isAfter(startTime) ||
          currentTime.isAtSameMomentAs(startTime);
      final bool isBeforeEnd =
          currentTime.isBefore(endTime) ||
          currentTime.isAtSameMomentAs(endTime);

      final bool isValid = isAfterStart && isBeforeEnd;
      if (!isValid) {
        debugPrint(
          "TIEMPO EXPIRADO: Actual: $currentTime, Inicio: $startTime, Fin: $endTime",
        );
      }
      return isValid;
    } catch (e) {
      debugPrint('Error al validar el tiempo del cronograma: $e');
      return true;
    }
  }

  // --- Método Build del Contenido ---
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 1. TARJETA PRINCIPAL (Cliente y Estado)
          Card(
            elevation: 5,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Imagen del Cliente
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: item.imagenCliente.isNotEmpty
                          ? _imageFromBase64(item.imagenCliente)
                          : _buildPlaceholder(),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.nombreCliente,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF00796B),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item.nombreAgencia,
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey[600],
                            fontStyle: FontStyle.italic,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 5,
                          ),
                          decoration: BoxDecoration(
                            color: getStatusColor(item.estado),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            getStatusText(item.estado),
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          // 2. DETALLES DEL MANTENIMIENTO
          _buildSectionTitle('Información de la Cita'),
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  _buildDetailRow(
                    'Cód. Cronograma',
                    item.codcrono,
                    icon: Icons.vpn_key,
                  ),
                  _buildDetailRow(
                    'Fecha de creación del ticket',
                    formatDate(item.feccrea),
                    icon: Icons.calendar_today,
                    // isHighlighted: true,
                  ),
                  _buildDetailRow(
                    'Rango Validez (Inicio)',
                    formatDate(item.fecreaRealIni),
                    icon: Icons.date_range,
                  ),
                  _buildDetailRow(
                    'Rango Validez (Fin)',
                    formatDate(item.fecreaRealFin),
                    icon: Icons.date_range_outlined,
                  ),
                  _buildDetailRow(
                    'Técnico Asignado',
                    item.nombreTecnico,
                    icon: Icons.person_pin,
                  ),
                  _buildDetailRow(
                    'Creado por',
                    item.nombreCreadorCrono,
                    icon: Icons.person_add_alt_1,
                  ),
                  // _buildDetailRow(
                  //   'Fecha Creación',
                  //   formatDate(item.feccrea),
                  //   icon: Icons.post_add,
                  // ),
                  _buildDetailRow(
                    'Estado (Cód)',
                    item.estado.toString(),
                    icon: Icons.check_circle_outline,
                  ),
                  // _buildDetailRow(
                  //   'ID Requerimiento',
                  //   formattedIdRequer,
                  //   icon: Icons.list_alt,
                  // ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          // 3. DETALLES DE UBICACIÓN
          _buildSectionTitle('Ubicación y Horario'),
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  _buildDetailRow(
                    'Localidad',
                    item.codlocalidad,
                    icon: Icons.location_city,
                  ),
                  _buildDetailRow(
                    'Provincia',
                    item.provinciaAgencia,
                    icon: Icons.map,
                  ),
                  _buildDetailRow(
                    'Cantón',
                    item.cantonAgencia,
                    icon: Icons.map_outlined,
                  ),
                  _buildDetailRow(
                    'Horario At. Desde',
                    item.horarioatenciond,
                    icon: Icons.access_time,
                  ),
                  _buildDetailRow(
                    'Horario At. Hasta',
                    item.horarioatencionhm,
                    icon: Icons.access_time_filled,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          // 4. DETALLES DE MAQUINARIA Y TIEMPO REAL
          _buildSectionTitle('Maquinaria y Tiempos Reales'),
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  _buildDetailRow(
                    'Tipo',
                    item.tipoMaquinaria,
                    icon: Icons.precision_manufacturing,
                  ),
                  _buildDetailRow(
                    'Marca',
                    item.marcaMaquinaria,
                    icon: Icons.branding_watermark,
                  ),
                  _buildDetailRow(
                    'Modelo',
                    item.modeloMaquinaria,
                    icon: Icons.device_hub,
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Padding(
                              padding: EdgeInsets.only(right: 8.0, top: 2),
                              child: Icon(
                                Icons.bug_report,
                                size: 18,
                                color: Color(0xFF00796B),
                              ),
                            ),
                            const Text(
                              'Problema:',
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 14,
                                color: Color(0xFF00796B),
                              ),
                            ),
                          ],
                        ),
                        Padding(
                          padding: const EdgeInsets.only(top: 4.0),
                          child: Text(
                            item.descripcionProblema.isNotEmpty
                                ? item.descripcionProblema
                                : 'Sin datos',
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.redAccent,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Divider(),
                  _buildDetailRow(
                    'Hora Inicio Real',
                    item.horaInicialReal,
                    icon: Icons.timer,
                    isHighlighted: true,
                  ),
                  _buildDetailRow(
                    'Hora Fin Real',
                    item.horaFinalReal,
                    icon: Icons.timer_off,
                    isHighlighted: true,
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 20),

          // 5. OBSERVACIONES
          _buildSectionTitle('Observaciones'),
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                item.observacion.isNotEmpty
                    ? item.observacion
                    : 'No hay observaciones registradas.',
                style: TextStyle(fontSize: 14, color: Colors.grey[700]),
              ),
            ),
          ),

          const SizedBox(height: 20),

          // ... código anterior ...
          const SizedBox(height: 20),

          // 6. BOTONES (YA NO FLOTANTES AQUÍ, ESTÁN AL FINAL DEL SCROLL)
          Padding(
            // <--- ENVOLVEMOS SIEMPRE EN UN PADDING
            // Usamos Padding en lugar de Positioned
            padding: const EdgeInsets.symmetric(
              horizontal: 10.0,
              vertical: 20.0,
            ),
            child: Row(
              mainAxisAlignment:
                  MainAxisAlignment.start, // Alinea a la izquierda
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                // 1. Botón de Ver Imagen (CONDICIONAL: SOLO SI HAY IMAGEN)
                if (item
                    .imagenTicketClienteGenerada
                    .isNotEmpty) // <--- ESTA CONDICIÓN AHORA SOLO ENVUELVE AL BOTÓN DE IMAGEN
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      ElevatedButton(
                        onPressed: () => onShowImageDialog(imageUrl),
                        child: const Icon(
                          Icons.image_search,
                          color: Colors.white,
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF00796B),
                          padding: const EdgeInsets.all(15),
                          shape: const CircleBorder(),
                          elevation: 5,
                        ),
                      ),
                      const SizedBox(
                        width: 15,
                      ), // <--- SEPARADOR ENTRE LOS BOTONES
                    ],
                  ),

                // 2. Botón de Comenzar (SIEMPRE VISIBLE)
                ElevatedButton.icon(
                  // *** LÓGICA DE VALIDACIÓN IMPLEMENTADA AQUÍ ***
                  onPressed: () async {
                    if (_isTimeValid(item)) {
                      // 1. Mostrar diálogo de carga
                      showDialog(
                        context: context,
                        barrierDismissible: false,
                        builder: (BuildContext context) {
                          return const Center(
                            child: CircularProgressIndicator(),
                          );
                        },
                      );

                      try {
                        // 2. Llamar a la API con tipo 'E' (Entrada)
                        final bool success =
                            await CronogramaService.actualizarHoraAsignacion(
                              item.idAsignacionTecnico.toString(),
                              'E',
                            );

                        // Cerrar diálogo de carga
                        if (context.mounted) {
                          Navigator.of(context).pop();
                        }

                        if (success) {
                          // 3. CAMBIO DE ESTADO: Si el registro de la hora fue exitoso, actualizamos a estado 3.
                          final userData = await SessionManager.getUserData();
                          final String coduser = userData['coduser'] ?? '';
                          if (coduser.isNotEmpty) {
                            await CronogramaService.actualizarEstado(
                              idMantenimiento: item.idmantenimiento,
                              nuevoEstado: 3,
                              usuario: coduser,
                            );
                          }
                          // 4. NAVEGACIÓN
                          if (context.mounted) {
                            Navigator.of(
                              context,
                            ).pushNamed('CronogramaEjecutado', arguments: item);
                          }
                        } else {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'No se pudo iniciar el mantenimiento. Error desconocido.',
                                ),
                                backgroundColor: Colors.red,
                              ),
                            );
                          }
                        }
                      } catch (e) {
                        // Cerrar diálogo de carga si hay error
                        if (context.mounted) {
                          Navigator.of(context).pop();
                          showDialog(
                            context: context,
                            builder: (context) => AlertDialog(
                              title: const Text('Error'),
                              content: Text(
                                'Error al iniciar mantenimiento: ${e.toString()}',
                              ),
                              actions: [
                                TextButton(
                                  onPressed: () {
                                    if (context.mounted)
                                      Navigator.of(context).pop();
                                  },
                                  child: const Text('OK'),
                                ),
                              ],
                            ),
                          );
                        }
                      }
                    } else {
                      // Si el tiempo NO es válido, muestra el diálogo de alerta
                      showTimeExpiredDialog(context);
                    }
                  },
                  icon: const Icon(Icons.play_arrow, color: Colors.white),
                  label: const Text(
                    'Comenzar',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color.fromARGB(255, 11, 100, 225),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 15,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    elevation: 5,
                  ),
                ),
                // Eliminamos el SizedBox(width: 15) que estaba aquí,
                // ya que ahora está después del botón condicional para separar.
              ],
            ),
          ),
          const SizedBox(height: 20),
          // ... código posterior ...
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
