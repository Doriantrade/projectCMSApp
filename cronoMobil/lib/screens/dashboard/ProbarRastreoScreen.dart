import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:cmsmobile/screens/services/LocationService.dart';

class ProbarRastreoScreen extends StatefulWidget {
  const ProbarRastreoScreen({super.key});

  @override
  State<ProbarRastreoScreen> createState() => _ProbarRastreoScreenState();
}

class _ProbarRastreoScreenState extends State<ProbarRastreoScreen> {
  String _status = "Listo para probar";
  String _apiResponse = "Sin respuesta aún";
  bool _isLoading = false;

  Future<void> _testGps() async {
    setState(() {
      _isLoading = true;
      _status = "Obteniendo ubicación...";
    });

    try {
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.best,
      );

      setState(() {
        _status = "Ubicación obtenida: ${position.latitude}, ${position.longitude}";
      });

      String response = await LocationService().updateManualLocation(
        position.latitude,
        position.longitude,
      );

      setState(() {
        _apiResponse = response;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _status = "Error: $e";
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Probar Rastreo'),
        backgroundColor: Colors.blue.shade700,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.speed, size: 80, color: Colors.blue),
            const SizedBox(height: 20),
            const Text(
              'Prueba Manual de Localización',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 30),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(15.0),
                child: Column(
                  children: [
                    const Text('Estado del Sensor:', style: TextStyle(fontWeight: FontWeight.bold)),
                    Text(_status, textAlign: TextAlign.center),
                    const Divider(),
                    const Text('Respuesta del Servidor:', style: TextStyle(fontWeight: FontWeight.bold)),
                    Text(_apiResponse, textAlign: TextAlign.center, style: TextStyle(color: _apiResponse.contains('OK') ? Colors.green : Colors.red)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 40),
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _testGps,
              icon: _isLoading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.gps_fixed),
              label: Text(_isLoading ? 'Enviando...' : 'FORZAR ENVÍO GPS'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 15),
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
