import 'package:flutter/material.dart';
import 'package:cmsmobile/screens/dashboard/ProbarRastreoScreen.dart';
import 'package:cmsmobile/screens/dashboard/GeoSettingsScreen.dart';
import 'package:cmsmobile/screens/dashboard/GeoLogsScreen.dart';
import 'package:cmsmobile/screens/dashboard/OfflineDataScreen.dart';

class TrackingMonitorScreen extends StatelessWidget {
  const TrackingMonitorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Data Inspector'),
        backgroundColor: const Color(0xFF00796B),
        centerTitle: true,
      ),
      body: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 50),
        color: Colors.grey.shade50,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.storage_rounded,
              size: 100,
              color: Color(0xFF00796B),
            ),
            const SizedBox(height: 10),
            const Text(
              'Panel de Gestión GPS',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFF00796B),
              ),
            ),
            const Text(
              'Seleccione una opción para continuar',
              style: TextStyle(color: Colors.grey, fontSize: 16),
            ),
            const SizedBox(height: 60),
            
            // Botón 1: Probar Rastreo
            _buildMenuButton(
              context: context,
              label: 'PROBAR RASTREO',
              icon: Icons.speed_rounded,
              color: Colors.blue.shade700,
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const ProbarRastreoScreen()),
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Botón 2: Características
            _buildMenuButton(
              context: context,
              label: 'CARACTERÍSTICAS DE GEOLOCALIZACIÓN',
              icon: Icons.settings_applications_rounded,
              color: Colors.orange.shade800,
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const GeoSettingsScreen()),
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Botón 3: GEO Datos Enviados
            _buildMenuButton(
              context: context,
              label: 'GEO DATOS ENVIADOS',
              icon: Icons.history_rounded,
              color: Colors.green.shade700,
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const GeoLogsScreen()),
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Botón 4: Consultar Datos Offline
            _buildMenuButton(
              context: context,
              label: 'DATOS GUARDADOS OFFLINE',
              icon: Icons.cloud_off_rounded,
              color: Colors.purple.shade700,
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const OfflineDataScreen()),
              ),
            ),
            
            const Spacer(),
            
            const Text(
              'CMS - 2025',
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuButton({
    required BuildContext context,
    required String label,
    required IconData icon,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return SizedBox(
      width: double.infinity,
      height: 70,
      child: ElevatedButton.icon(
        onPressed: onPressed,
        icon: Icon(icon, size: 28),
        label: Text(
          label,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
        ),
      ),
    );
  }
}
