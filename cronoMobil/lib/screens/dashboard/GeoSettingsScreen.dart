import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:cmsmobile/environments/environments.dart';

class GeoSettingsScreen extends StatefulWidget {
  const GeoSettingsScreen({super.key});

  @override
  State<GeoSettingsScreen> createState() => _GeoSettingsScreenState();
}

class _GeoSettingsScreenState extends State<GeoSettingsScreen> {
  Map<String, dynamic>? _settings;
  bool _isLoading = true;
  String _error = "";

  @override
  void initState() {
    super.initState();
    _fetchSettings();
  }

  Future<void> _fetchSettings() async {
    try {
      String deviceId = 'UNKNOWN';
      final DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();
      
      if (Platform.isAndroid) {
        AndroidDeviceInfo androidInfo = await deviceInfo.androidInfo;
        deviceId = androidInfo.model;
      } else if (Platform.isIOS) {
        IosDeviceInfo iosInfo = await deviceInfo.iosInfo;
        deviceId = iosInfo.identifierForVendor ?? 'UNKNOWN_IOS';
      }

      final url = "${Environments().api()}SettingsGeoLocalizacionMobil/ByMac/$deviceId";
      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        setState(() {
          _settings = jsonDecode(response.body);
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = "Error: ${response.statusCode}";
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = "Excepción: $e";
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Características de Geolocalización'),
        backgroundColor: Colors.orange.shade700,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _error.isNotEmpty 
          ? Center(child: Text(_error, style: const TextStyle(color: Colors.red)))
          : Padding(
              padding: const EdgeInsets.all(15.0),
              child: ListView(
                children: [
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 20),
                    child: Icon(Icons.settings_applications, size: 80, color: Colors.orange),
                  ),
                  _buildSettingTile("MAC del Dispositivo", _settings?['codmac'] ?? 'N/A'),
                  _buildSettingTile("Intervalo de Envío", "${_settings?['timeSendDataGeoLocalization'] ?? '---'} segundos"),
                  _buildSettingTile("Hora Inicio Laboral", _settings?['horarioLaboinicial'] ?? '---'),
                  _buildSettingTile("Hora Fin Laboral", _settings?['horarioLabofinal'] ?? '---'),
                  _buildSettingTile("Aproximación (m)", "${_settings?['aproximGeoLocalizacion'] ?? '---'} m"),
                  _buildSettingTile("Pasos Mínimos (m)", "${_settings?['pasos'] ?? '---'} m"),
                  _buildSettingTile("Método de Envío", _settings?['metodoDeEnvioDeDatos'] == 1 ? "Por Tiempo" : "Por Pasos"),
                  const Divider(height: 40),
                  const Text(
                    "Nota: Estas configuraciones son gestionadas por el administrador desde el panel web y son de solo lectura.",
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: Colors.grey),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildSettingTile(String label, String value) {
    return Card(
      elevation: 0,
      color: Colors.grey.shade50,
      margin: const EdgeInsets.symmetric(vertical: 5),
      shape: RoundedRectangleBorder(
        side: BorderSide(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(8)
      ),
      child: ListTile(
        title: Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.black54)),
        trailing: Text(value, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.black87)),
      ),
    );
  }
}
