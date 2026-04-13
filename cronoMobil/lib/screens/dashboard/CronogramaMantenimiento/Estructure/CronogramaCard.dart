import 'dart:convert';
import 'dart:typed_data';
import 'package:cmsmobile/screens/services/CronogramaService.dart';
import 'package:cmsmobile/screens/services/SessionManager.dart';
import 'package:flutter/material.dart';

class CronogramaCard extends StatelessWidget {
  final CronogramaItem item;

  const CronogramaCard({super.key, required this.item});

  // --- Funciones de Presentación (Helpers) ---

  String _formatDate(String fecha) {
    try {
      final dateTime = DateTime.parse(fecha);
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    } catch (e) {
      return fecha;
    }
  }

  Color _getStatusColor(int estado) {
    switch (estado) {
      case 0:
        return Colors.orange; // Pendiente
      case 1:
        return Colors.green; // Completado
      case -1:
        return Colors.red; // Cancelado
      default:
        return Colors.grey;
    }
  }

  String _getStatusText(int estado) {
    switch (estado) {
      case 0:
        return 'Pendiente';
      case 1:
        return 'Completado';
      case -1:
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  }

  // Widget para la imagen por defecto (usa el asset 'usuario_default.png')
  Widget _buildPlaceholder() {
    return Image.asset(
      'lib/assets/default_images/usuario_default.png',
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) {
        return Container(
          color: Colors.grey[300],
          child: const Icon(Icons.person, color: Colors.grey),
        );
      },
    );
  }

  // Función para convertir base64 a Image, con manejo de errores robusto
  Widget _imageFromBase64(String base64String) {
    try {
      if (base64String.length < 50) {
        throw const FormatException(
          'String seems too short for a Base64 image.',
        );
      }
      final String data = base64String.contains(',')
          ? base64String.split(',').last
          : base64String;
      final Uint8List bytes = base64Decode(data);

      return Image.memory(
        bytes,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          // print('Error de renderizado de imagen decodificada: $error');
          return _buildPlaceholder();
        },
      );
    } catch (e) {
      // print('Error decodificando base64 (cargando imagen por defecto): $e');
      return _buildPlaceholder();
    }
  }

  // --- Método Build principal del Widget de Tarjeta ---

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 3,
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () async {
          // 1. Obtención de los datos de sesión para identificar al usuario técnico
          final userData = await SessionManager.getUserData();
          final String coduser = userData['coduser'] ?? '';

          // 2. Ejecución de la API para actualizar el estado del mantenimiento a 2.
          // Este estado indica que el técnico ha visualizado el detalle en el cronograma.
          // Se dispara de forma asíncrona ("fuego y olvido") para no retrasar la navegación.
          if (coduser.isNotEmpty) {
            CronogramaService.actualizarEstado(
              idMantenimiento: item.idmantenimiento,
              nuevoEstado: 2,
              usuario: coduser,
            );
          }

          // 3. Navegación hacia la pantalla de detalle del cronograma seleccionado
          // Se transfiere el objeto 'item' completo como argumento para evitar recargas innecesarias.
          Navigator.pushNamed(
            context,
            'CronogramaSeleccionado', // Nombre de la ruta definida en el router
            arguments: item, // Datos del mantenimiento seleccionado
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Imagen del cliente
              Container(
                width: 70,
                height: 70,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: Colors.grey[300],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: item.imagenCliente.isNotEmpty
                      ? _imageFromBase64(item.imagenCliente)
                      : _buildPlaceholder(),
                ),
              ),
              const SizedBox(width: 12),
              // Información del mantenimiento
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Nombre del cliente y agencia
                    Text(
                      // item.idAsignacionTecnico.toString() +
                      //     ' - ' +
                      item.nombreCliente,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      item.nombreAgencia,
                      style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    // Fecha y ubicación
                    Row(
                      children: [
                        const Icon(Icons.calendar_today, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          _formatDate(item.feccrea),
                          style: const TextStyle(fontSize: 12),
                        ),
                        const SizedBox(width: 12),
                        const Icon(Icons.location_on, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          '${item.cantonAgencia}, ${item.provinciaAgencia}',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    // Información de la máquina
                    if (item.tipoMaquinaria.isNotEmpty ||
                        item.marcaMaquinaria.isNotEmpty ||
                        item.modeloMaquinaria.isNotEmpty)
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Equipo:',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (item.tipoMaquinaria.isNotEmpty)
                            Text(
                              'Tipo: ${item.tipoMaquinaria}',
                              style: const TextStyle(fontSize: 12),
                            ),
                          if (item.marcaMaquinaria.isNotEmpty)
                            Text(
                              'Marca: ${item.marcaMaquinaria}',
                              style: const TextStyle(fontSize: 12),
                            ),
                          if (item.modeloMaquinaria.isNotEmpty)
                            Text(
                              'Modelo: ${item.modeloMaquinaria}',
                              style: const TextStyle(fontSize: 12),
                            ),
                        ],
                      ),

                    const SizedBox(height: 8),

                    // Descripción del problema
                    if (item.descripcionProblema.isNotEmpty)
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Problema reportado:',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            item.descripcionProblema,
                            style: const TextStyle(fontSize: 12),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    const SizedBox(height: 8),
                    // Número de ticket (si existe)
                    if (item.idRequer > 0)
                      Row(
                        children: [
                          const Icon(Icons.confirmation_number, size: 14),
                          const SizedBox(width: 4),
                          Text(
                            'Ticket: #${item.idRequer}',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Colors.blue,
                            ),
                          ),
                        ],
                      ),

                    const SizedBox(height: 8),

                    // Estado
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: _getStatusColor(item.estado),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            _getStatusText(item.estado),
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.white,
                            ),
                          ),
                        ),
                        const Spacer(),
                        if (item.horaInicialReal.isNotEmpty)
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                'Hora Inicial: ${item.horaInicialReal}',
                                style: const TextStyle(fontSize: 12),
                              ),
                              Text(
                                'Hora Final: ${item.horaFinalReal}',
                                style: const TextStyle(fontSize: 12),
                              ),
                            ],
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
