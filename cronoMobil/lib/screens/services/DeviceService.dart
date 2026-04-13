import 'package:flutter/material.dart';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:device_info_plus/device_info_plus.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:async';
import 'package:cmsmobile/environments/environments.dart';
import 'package:cmsmobile/screens/services/SessionManager.dart';
import 'package:cmsmobile/screens/services/LocationService.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:cmsmobile/screens/services/DatabaseHelper.dart';

class _AppLifecycleObserver extends WidgetsBindingObserver {
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) async {
    final prefs = await SharedPreferences.getInstance();
    if (state == AppLifecycleState.resumed) {
      await prefs.setBool('is_app_in_foreground', true);
    } else {
      await prefs.setBool('is_app_in_foreground', false);
    }
  }
}

class DeviceService {
  static final GlobalKey<ScaffoldMessengerState> messengerKey =
      GlobalKey<ScaffoldMessengerState>();
  static bool _isTrackingRunning = false;
  static final _lifecycleObserver = _AppLifecycleObserver();

  static Future<Map<String, dynamic>?> registrarDispositivo(
    String codUser,
  ) async {
    final String apiUrl = Environments().api() + 'AsignacionMobilTecnico';

    try {
      String deviceId = await getDeviceId();
      double lat = 0.0;
      double lng = 0.0;
      
      try {
        // Solo intentamos obtener ubicación si ya hay permisos (para evitar el error de plugin "User denied")
        LocationPermission permission = await Geolocator.checkPermission();
        if (permission == LocationPermission.always || permission == LocationPermission.whileInUse) {
            Position position = await Geolocator.getCurrentPosition(
              desiredAccuracy: LocationAccuracy.low,
              timeLimit: const Duration(seconds: 4),
            );
            lat = position.latitude;
            lng = position.longitude;
        } else {
            print('DEVICE_SERVICE: Sin permisos de GPS todavía. Registrando con 0,0.');
        }
      } catch (e) {
        print('DEVICE_SERVICE: Error silencioso obteniendo ubicación inicial: $e');
      }

      final Map<String, dynamic> body = {
        "mac": deviceId,
        "coduser": codUser.isEmpty ? null : codUser,
      };

      print('REGISTRANDO DISPOSITIVO (SOLO MAC Y USER): $body');

      final response = await http.post(
        Uri.parse(apiUrl),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(body),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        print('Registro de Dispositivo OK: ${response.body}');
        // Solo mostramos SnackBar si se ha logueado manualmente (codUser no vacío)
        if (codUser.isNotEmpty) {
           _showDebugSnackBar("✅ Registro Inicial Exitoso", isError: false);
        }
      } else {
        print('Error Registro Dispositivo: ${response.statusCode} - ${response.body}');
        if (codUser.isNotEmpty) {
           _showDebugSnackBar("❌ Error Registro (${response.statusCode})", isError: true);
        }
      }
      return body;
    } catch (e) {
      print('Error en registrarDispositivo: $e');
      if (codUser.isNotEmpty) {
         _showDebugSnackBar("❗ Error de conexión: $e", isError: true);
      }
      return null;
    }
  }

  static Future<void> emitirPosicionRastreo(String codUser) async {
    final String apiUrl = Environments().api() + 'MacMobile/guardarAsignacionMacTecnico';

    try {
      String deviceId = await getDeviceId();
      Position? position;
      
      try {
        LocationPermission permission = await Geolocator.checkPermission();
        if (permission == LocationPermission.denied) {
          permission = await Geolocator.requestPermission();
        }

        if (permission == LocationPermission.always || permission == LocationPermission.whileInUse) {
            position = await Geolocator.getCurrentPosition(
              desiredAccuracy: LocationAccuracy.best,
              timeLimit: const Duration(seconds: 8),
            );
        } else {
            print('DEVICE_SERVICE: Permisos denegados para rastreo periódico. Omitiendo emisión.');
            return;
        }
      } catch (e) {
        print('DEVICE_SERVICE: No se pudo obtener ubicación para rastreo: $e');
        return; 
      }

      if (position == null) return;

      // Intentar obtener el ticketId actual si hay uno activo en LocationService
      int ticketId = LocationService().currentData?['ticketId'] ?? 0;

      final connectivityResult = await Connectivity().checkConnectivity();
      bool hasInternet = !connectivityResult.contains(ConnectivityResult.none) || connectivityResult.length > 1;
      if (connectivityResult.length == 1 && connectivityResult.first == ConnectivityResult.none) {
        hasInternet = false;
      }

      if (!hasInternet) {
        print('DEVICE_SERVICE: Sin internet. Guardando rastreo en SQLite...');
        await DatabaseHelper().insertLocation({
          'mac': deviceId,
          'coduser': codUser,
          'latitud': position.latitude,
          'longitud': position.longitude,
          'ticketId': ticketId,
          'tipo': 'RASTREO',
          'timestamp': DateTime.now().toIso8601String()
        });
        return;
      }

      final Map<String, dynamic> body = {
        "mac": deviceId,
        "coduser": codUser,
        "estado": 1,
        "longitud": position.longitude.toString(),
        "latitud": position.latitude.toString(),
        "idTicket": ticketId,
      };

      print('EMITIENDO RASTREO: $body');

      final response = await http.post(
        Uri.parse(apiUrl),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        print('Rastreo enviado OK');
        _showDebugSnackBar("📡 Posición en vivo enviada OK", isError: false);
      } else {
        print('Error rastreo: ${response.statusCode} - ${response.body}');
        _showDebugSnackBar("🚨 Fallo al enviar coordenadas (${response.statusCode})", isError: true);
      }
    } catch (e) {
      print('Error en emitirPosicionRastreo: $e');
      _showDebugSnackBar("⏳ Error de envío: $e", isError: true);
    }
  }

  static Future<String> getDeviceId() async {
    String deviceId = 'UNKNOWN';
    final DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();
    if (Platform.isAndroid) {
      AndroidDeviceInfo androidInfo = await deviceInfo.androidInfo;
      // Usamos .model (ej: HONORLGN-L33) como identificador "MAC"
      deviceId = androidInfo.model;
    } else if (Platform.isIOS) {
      IosDeviceInfo iosInfo = await deviceInfo.iosInfo;
      deviceId = iosInfo.identifierForVendor ?? 'UNKNOWN_IOS';
    }
    return deviceId;
  }

  static void startPeriodicTracking() async {
    if (_isTrackingRunning) return;
    _isTrackingRunning = true;

    WidgetsBinding.instance.addObserver(_lifecycleObserver);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('is_app_in_foreground', true); // Estado inicial

    // 1. Intentar obtener configuración del servidor antes de iniciar
    await LocationService().fetchServerSettings();
    final serverSettings = LocationService().serverSettings;

    int intervalSeconds = 300;
    String source = 'SERVER';

    if (serverSettings != null && serverSettings['timeSendDataGeoLocalization'] != null) {
      intervalSeconds = (serverSettings['timeSendDataGeoLocalization'] as num).toInt();
    } else {
      source = 'DEFAULT_FALLBACK';
      print('⚠️ ADVERTENCIA: No se encontró configuración en el servidor para este dispositivo. Usando fallback por defecto de $intervalSeconds segundos.');
    }

    print(
      'DEVICE_SERVICE: Iniciando rastreo periódico cada $intervalSeconds segundos (Origen: $source).',
    );

    // 2. Ejecutar inmediatamente al iniciar
    // Si no hay sesión, registrar el dispositivo vacío para que el backend le asigne configuración por defecto
    final session = await SessionManager.getUserData();
    String codUser = session['coduser'] ?? '';
    
    // Primero, pedimos permisos si no los tenemos
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    if (codUser.isEmpty) {
        await registrarDispositivo('');
    }

    _executeTrackingEmission();

    // 3. Configurar ciclo periódico en segundo plano verdadero
    final service = FlutterBackgroundService();
    // Guardamos intervalo para que el Isolate lo lea
    final prefsBg = await SharedPreferences.getInstance();
    
    // Si viene 0 o null del API por error, forzamos fallback
    if (intervalSeconds <= 0) {
      intervalSeconds = 300;
    }
    
    await prefsBg.setInt('bg_interval_seconds', intervalSeconds);
    await prefsBg.setString('coduser', codUser); // para que el isolate sepa a quien enviar

    print('DEVICE_SERVICE: Guardando bg_interval_seconds en prefs: $intervalSeconds sec.');

    if (await service.isRunning()) {
      print('DEVICE_SERVICE: Servicio de fondo ya activo. Enviando evento updateTimer para sincronizar credenciales e intervalo.');
      service.invoke('updateTimer');
    } else {
      print('DEVICE_SERVICE: Iniciando servicio de fondo por primera vez.');
      await service.startService();
    }
  }

  static Future<void> _executeTrackingEmission() async {
    final serverSettings = LocationService().serverSettings;
    final now = DateTime.now();

    // Usamos el horario del servidor o unos valores por defecto amplios si falla (8 AM a 6 PM)
    int startHour = 8;
    int endHour = 18;

    if (serverSettings != null &&
        serverSettings['horarioLaboinicial'] != null) {
      // Formato esperado: "08:00:00"
      try {
        startHour = int.parse(
          serverSettings['horarioLaboinicial'].toString().split(':').first,
        );
        endHour = int.parse(
          serverSettings['horarioLabofinal'].toString().split(':').first,
        );
      } catch (e) {
        print('DEVICE_SERVICE: Error parseando horario de servidor: $e');
      }
    }

    if (now.hour >= startHour && now.hour < endHour) {
      print(
        'DEVICE_SERVICE: Dentro de horario operativo ($startHour - $endHour). Ejecutando emisión...',
      );

      final session = await SessionManager.getUserData();
      String codUser = session['coduser'] ?? '';

      if (codUser.isEmpty) {
        codUser = '-SINLOG-';
      }

      await emitirPosicionRastreo(codUser);
      print(
        'DEVICE_SERVICE: Emisión de rastreo completada para usuario $codUser',
      );
    } else {
      print(
        'DEVICE_SERVICE: Fuera de horario operativo ($startHour - $endHour). Omitiendo emisión.',
      );
    }
  }

  static Future<void> syncOfflineLocations() async {
    final String apiUrl = Environments().api() + 'MacMobile/guardarAsignacionMacTecnico';
    print('DEVICE_SERVICE: Sincronizando rastreos offline...');
    try {
      final records = await DatabaseHelper().getLocations();
      if (records.isEmpty) return;

      for (var record in records) {
        if (record['tipo'] == 'RASTREO') {
          final body = {
            "mac": record['mac'],
            "coduser": record['coduser'],
            "estado": 3,
            "longitud": record['longitud'].toString(),
            "latitud": record['latitud'].toString(),
            "idTicket": record['ticketId'] ?? 0,
          };
          final response = await http.post(
            Uri.parse(apiUrl),
            headers: {"Content-Type": "application/json"},
            body: jsonEncode(body),
          );
          if (response.statusCode == 200) {
            await DatabaseHelper().deleteLocation(record['id']);
            print('==================================================');
            print('☁️ ✅ ¡DATOS DE SQLITE ENVIADOS AL SERVIDOR!');
            print('Se sincronizó el registro RASTREO ID ${record['id']}.');
            print('==================================================');
          }
        }
      }
    } catch (e) {
      print('DEVICE_SERVICE: Error en syncOfflineLocations: $e');
    }
  }

  static void _showDebugSnackBar(String message, {bool isError = false}) {
    /*
    try {
      messengerKey.currentState?.clearSnackBars();
      messengerKey.currentState?.showSnackBar(
        SnackBar(
          content: Text(
            message,
            style: const TextStyle(fontSize: 12, color: Colors.white),
          ),
          backgroundColor: isError
              ? Colors.red.shade800
              : Colors.green.shade800,
          duration: const Duration(seconds: 5),
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(10),
          action: SnackBarAction(
            label: 'OK',
            textColor: Colors.white,
            onPressed: () => messengerKey.currentState?.hideCurrentSnackBar(),
          ),
        ),
      );
    } catch (e) {
      print('Error mostrando SnackBar: $e');
    }
    */
  }

  static Future<void> stopTracking() async {
    final service = FlutterBackgroundService();
    if (await service.isRunning()) {
      service.invoke('stopService');
    }
    _isTrackingRunning = false;
  }
}
