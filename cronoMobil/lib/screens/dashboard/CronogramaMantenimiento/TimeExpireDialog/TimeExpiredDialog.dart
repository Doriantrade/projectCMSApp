import 'package:flutter/material.dart';

// Widget de Diálogo para mostrar la alerta de tiempo expirado.
class TimeExpiredDialog extends StatelessWidget {
  const TimeExpiredDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      // Usar el icono superior de AlertDialog si está disponible (Material 3)
      // o mantenerlo en el título pero con un diseño más seguro.
      title: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.timer_off, color: Colors.red, size: 28),
          SizedBox(width: 12),
          Text(
            '¡Tiempo Expirado!',
            style: TextStyle(
              color: Colors.red,
              fontWeight: FontWeight.bold,
              fontSize: 18,
            ),
          ),
        ],
      ),
      content: const Text(
        "Te has quedado sin tiempo, por favor pide una reasignación a tu supervisor.",
        style: TextStyle(fontSize: 16),
      ),
      actions: <Widget>[
        TextButton(
          onPressed: () {
            if (context.mounted) {
              Navigator.of(context).pop();
            }
          },
          child: const Text(
            'Entendido',
            style: TextStyle(
              color: Color(0xFF00796B),
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        ),
      ],
    );
  }
}

// Función de utilidad para mostrar el diálogo fácilmente
void showTimeExpiredDialog(BuildContext context) {
  showDialog(
    context: context,
    builder: (BuildContext context) {
      return const TimeExpiredDialog();
    },
  );
}
