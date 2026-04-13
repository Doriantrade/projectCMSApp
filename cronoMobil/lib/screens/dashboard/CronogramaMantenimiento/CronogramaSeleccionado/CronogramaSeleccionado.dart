import 'package:cmsmobile/screens/dashboard/CronogramaMantenimiento/CronogramaSeleccionado/Estructure/CronogramaDetailContent.dart';
import 'package:flutter/material.dart';
// Asegúrate de que esta sea la ruta correcta a tu modelo CronogramaItem
import 'package:cmsmobile/screens/services/CronogramaService.dart';
// Importamos el nuevo widget de contenido. ¡Asegúrate de ajustar esta ruta!

class CronogramaSeleccionado extends StatefulWidget {
  final CronogramaItem item;

  const CronogramaSeleccionado({super.key, required this.item});

  @override
  State<CronogramaSeleccionado> createState() => _CronogramaSeleccionadoState();
}

class _CronogramaSeleccionadoState extends State<CronogramaSeleccionado> {
  // --- 1. Helpers para presentación de datos ---

  String _formatDate(String fecha) {
    try {
      if (fecha.isEmpty) return 'N/A';
      final dateTime = DateTime.parse(fecha);
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    } catch (e) {
      return fecha.isNotEmpty ? fecha : 'N/A';
    }
  }

  String _getStatusText(int estado) {
    switch (estado) {
      case 0:
        return 'PENDIENTE';
      case 1:
        return 'COMPLETADO';
      case -1:
        return 'CANCELADO';
      default:
        return 'DESCONOCIDO';
    }
  }

  Color _getStatusColor(int estado) {
    switch (estado) {
      case 0:
        return Colors.orange[700]!;
      case 1:
        return Colors.green[700]!;
      case -1:
        return Colors.red[700]!;
      default:
        return Colors.grey[500]!;
    }
  }

  // --- 2. FUNCIÓN: Mostrar diálogo con la imagen del ticket (Lógica de la app) ---
  void _showImageDialog(BuildContext context, String imageUrl) {
    if (imageUrl.isEmpty) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Imagen no disponible'),
          content: const Text(
            'No se encontró una ruta de imagen para este ticket.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cerrar'),
            ),
          ],
        ),
      );
      return;
    }

    // Si hay URL, muestra la imagen en un diálogo
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
          contentPadding: EdgeInsets.zero,
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(15),
                  ),
                  child: Image.network(
                    imageUrl,
                    fit: BoxFit.contain,
                    loadingBuilder:
                        (
                          BuildContext context,
                          Widget child,
                          ImageChunkEvent? loadingProgress,
                        ) {
                          if (loadingProgress == null) return child;
                          return Container(
                            height: 300,
                            alignment: Alignment.center,
                            child: const CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Color(0xFF00796B),
                              ),
                            ),
                          );
                        },
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        height: 200,
                        alignment: Alignment.center,
                        color: Colors.grey[200],
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.broken_image,
                              size: 50,
                              color: Colors.grey[600],
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Error al cargar la imagen',
                              style: TextStyle(color: Colors.grey),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(
                    'Ticket N. # ${widget.item.idRequer.toString().padLeft(6, '0')}',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cerrar'),
            ),
          ],
        );
      },
    );
  }

  // --- 3. Método Build principal (Estructura de la pantalla) ---
  @override
  Widget build(BuildContext context) {
    final item = widget.item;

    // Lógica para formatear datos y construir URL
    final formattedIdRequer = item.idRequer.toString().padLeft(9, '0');
    const String baseUrl = 'https://cmsbackticket.cashmachserv.com/storage/';

    final imageUrl = item.imagenTicketClienteGenerada.isNotEmpty
        ? '$baseUrl${item.imagenTicketClienteGenerada}'
        : '';

    return Scaffold(
      // AppBar definido en el padre
      appBar: AppBar(
        title: Text('Ticket  #MC-$formattedIdRequer'),
        backgroundColor: _getStatusColor(item.estado),
        foregroundColor: Colors.white,
        elevation: 0,
      ),

      // Cuerpo delegado al widget hijo
      body: CronogramaDetailContent(
        item: item,
        formattedIdRequer: formattedIdRequer,
        imageUrl: imageUrl,
        // Pasamos la función de diálogo (callback)
        onShowImageDialog: (url) => _showImageDialog(context, url),
        // Pasamos los helpers de presentación
        getStatusColor: _getStatusColor,
        getStatusText: _getStatusText,
        formatDate: _formatDate,
      ),
    );
  }
}
