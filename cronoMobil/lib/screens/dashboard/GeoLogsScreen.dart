import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:cmsmobile/environments/environments.dart';
import 'package:cmsmobile/screens/services/DeviceService.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:cmsmobile/screens/services/DatabaseHelper.dart';

class GeoLogsScreen extends StatefulWidget {
  const GeoLogsScreen({super.key});

  @override
  State<GeoLogsScreen> createState() => _GeoLogsScreenState();
}

class _GeoLogsScreenState extends State<GeoLogsScreen> {
  bool _isLoading = true;
  String _error = "";
  List<dynamic> _logs = [];

  @override
  void initState() {
    super.initState();
    _fetchHistoricalLogs();
    _listenToLiveUpdates();
  }

  Future<void> _fetchHistoricalLogs() async {
    try {
      String deviceId = await DeviceService.getDeviceId();
      final url = "${Environments().api()}MacMobile/ByMac/$deviceId/today";
      
      List<dynamic> remoteLogs = [];
      String tempError = "";

      try {
        final response = await http.get(Uri.parse(url));

        if (response.statusCode == 200) {
          remoteLogs = jsonDecode(response.body); 
        } else if (response.statusCode == 404) {
          tempError = "No hay datos enviados para mostrar en el servidor.";
        } else {
          tempError = "Error remoto: ${response.statusCode}";
        }
      } catch (e) {
        tempError = "Sin conexión al servidor o error de API.";
      }

      // Obtener locales de SQLite
      final localRecords = await DatabaseHelper().getLocations();
      List<dynamic> combinedLogs = [];

      for (var record in localRecords) {
        combinedLogs.add({
          "latitud": record['latitud'],
          "longitud": record['longitud'],
          "fecrea": record['timestamp'],
          "estado": "OFFLINE_LOCAL",
        });
      }

      // Invertir locales para tener el más nuevo primero
      combinedLogs = combinedLogs.reversed.toList();
      
      // Agregar remotos al final
      combinedLogs.addAll(remoteLogs);

      setState(() {
        _logs = combinedLogs;
        if (combinedLogs.isEmpty) {
           _error = tempError.isNotEmpty ? tempError : "No hay datos enviados para mostrar.";
        } else {
           _error = "";
        }
        _isLoading = false;
      });
      
    } catch (e) {
      setState(() {
        _error = "Error general:\nExcepción: $e";
        _isLoading = false;
      });
    }
  }

  void _listenToLiveUpdates() {
    FlutterBackgroundService().on('update').listen((event) {
      if (event != null && mounted) {
        setState(() {
          // Agregar el nuevo lat/lng al tope de la lista
          _logs.insert(0, {
            "latitud": event["lat"],
            "longitud": event["lng"],
            "fecrea": event["current_date"],
            "estado": "Live (Local Appended)",
          });
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('GEO datos enviados'),
        backgroundColor: Colors.blue.shade700,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              setState(() {
                _isLoading = true;
                _error = "";
              });
              _fetchHistoricalLogs();
            },
          )
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error.isNotEmpty && _logs.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Text(_error, textAlign: TextAlign.center, style: const TextStyle(color: Colors.red)),
        ),
      );
    }

    if (_logs.isEmpty) {
      return const Center(child: Text("No se han enviado datos de geolocalización hoy."));
    }

    return ListView.builder(
      itemCount: _logs.length,
      itemBuilder: (context, index) {
        final log = _logs[index];
        final fecreaValue = log['fecrea'] ?? log['Fecrea'];
        final fechaStr = fecreaValue != null ? fecreaValue.toString().replaceAll('T', ' ').split('.').first : 'N/A';
        final estadoLog = log['estado'] ?? log['Estado'];
        final isLocalOffline = estadoLog == "OFFLINE_LOCAL";
        
        Widget? trailingIcon;
        if (estadoLog == "Live (Local Appended)") {
          trailingIcon = const Icon(Icons.bolt, color: Colors.orange);
        } else if (estadoLog == 3) {
          trailingIcon = const Icon(Icons.cloud_sync, color: Colors.redAccent);
        } else if (isLocalOffline) {
          trailingIcon = const Icon(Icons.cloud_off, color: Colors.red);
        }

        return Card(
          elevation: 2,
          color: isLocalOffline ? Colors.red.shade50 : Colors.white,
          margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: isLocalOffline ? Colors.red : Colors.green,
              child: const Icon(Icons.location_on, color: Colors.white, size: 20),
            ),
            title: Text(
              "Lat: ${log['latitud'] ?? log['Latitud']} | Lng: ${log['longitud'] ?? log['Longitud']}", 
              style: TextStyle(
                fontSize: 14, 
                color: isLocalOffline ? Colors.red.shade900 : Colors.black87
              )
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("Fecha: $fechaStr", style: const TextStyle(fontSize: 12, color: Colors.grey)),
                if (estadoLog == 3) 
                  const Text("Sincronizado Offline", style: TextStyle(fontSize: 11, color: Colors.redAccent, fontWeight: FontWeight.bold)),
                if (isLocalOffline)
                  const Text("Esperando conexión (Local)", style: TextStyle(fontSize: 11, color: Colors.red, fontWeight: FontWeight.bold)),
              ],
            ),
            trailing: trailingIcon,
          ),
        );
      },
    );
  }
}
