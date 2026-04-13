import 'dart:async';
import 'dart:convert';
import 'package:cmsmobile/environments/environments.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:cmsmobile/screens/services/DatabaseHelper.dart';

class LocationService {
  // Patrón Singleton para acceso global
  static final LocationService _instance = LocationService._internal();
  factory LocationService() => _instance;
  LocationService._internal();

  StreamSubscription<Position>? _positionStream;
  int? _currentTicketId;
  int? _currentTecnicoId;
  Map<String, dynamic>? _serverSettings;
  Map<String, dynamic>? get serverSettings => _serverSettings;

  // Stream para notificar a la UI sobre actualizaciones
  final _locationUpdateController = StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get locationUpdates => _locationUpdateController.stream;

  Map<String, dynamic>? currentData;

  final String _baseUrl = '${Environments().apiTicket()}GeoLocalizacion/ActualizarUbicacion';

  bool get isTracking => _positionStream != null;

  Future<void> fetchServerSettings() async {
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
      final prefs = await SharedPreferences.getInstance();

      if (response.statusCode == 200) {
        _serverSettings = jsonDecode(response.body);
        await prefs.setString('cached_server_settings', response.body);
        print('LOCATION_SERVICE: Configuración obtenida del servidor para MAC: $deviceId');
      } else {
        print('LOCATION_SERVICE: No se pudo obtener config del servidor (${response.statusCode}). Usando caché local.');
        String? cachedSettings = prefs.getString('cached_server_settings');
        if (cachedSettings != null) {
          _serverSettings = jsonDecode(cachedSettings);
        }
      }
    } catch (e) {
      print('LOCATION_SERVICE: Error al buscar settings en servidor: $e');
      final prefs = await SharedPreferences.getInstance();
      String? cachedSettings = prefs.getString('cached_server_settings');
      if (cachedSettings != null) {
        _serverSettings = jsonDecode(cachedSettings);
        print('LOCATION_SERVICE: Usando caché local debido al error de red.');
      }
    }
  }

  /// Verifica y solicita permisos manualmente si es necesario
  Future<bool> checkAndRequestPermission({int? ticketId, int? tecnicoId}) async {
    // Si se pasan IDs, actualizarlos para el próximo inicio
    if (ticketId != null) {
      _currentTicketId = ticketId;
      print('DEBUG: TicketID actualizado a $ticketId');
    }
    if (tecnicoId != null) {
      _currentTecnicoId = tecnicoId;
      print('DEBUG: TecnicoID actualizado a $tecnicoId');
    }

    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      _notifyUI("GPS Apagado", 0, 0);
      return false;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      _notifyUI("Solicitando permiso...", 0, 0);
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        _notifyUI("Permiso denegado", 0, 0);
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      _notifyUI("GPS bloqueado permanentemente", 0, 0);
      return false;
    }

    _notifyUI("Permisos OK", 0, 0);
    
    // Si hay IDs y no estamos rastreando, intentar iniciar automáticamente
    if (_currentTicketId != null && _currentTecnicoId != null && _positionStream == null) {
      print('DEBUG: Auto-iniciando rastreo tras obtener permisos para ticket $_currentTicketId');
      startTracking(ticketId: _currentTicketId!, tecnicoId: _currentTecnicoId!);
    } else if (_currentTicketId == null) {
      print('DEBUG: No se pudo auto-iniciar porque _currentTicketId es null');
    }
    
    return true;
  }

  /// Verifica permisos y comienza a escuchar cambios de ubicación
  void startTracking({required int ticketId, required int tecnicoId}) async {
    _currentTicketId = ticketId;
    _currentTecnicoId = tecnicoId;
    
    print('DEBUG: startTracking llamado - Ticket: $ticketId, Tecnico: $tecnicoId');
    _notifyUI("Iniciando rastreador...", 0, 0);

    LocationPermission permission = await Geolocator.checkPermission();
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();

    if (!serviceEnabled || permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
      _notifyUI("Faltan Permisos / GPS", 0, 0);
      print('DEBUG: Exit early - GPS enabled: $serviceEnabled, Permission: $permission');
      return;
    }

    _notifyUI("Buscando señal...", 0, 0);

    try {
      // Forzar una obtención inicial inmediata para "despertar" el hardware
      final initialPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.best,
        timeLimit: const Duration(seconds: 15),
      );
      print('DEBUG: Posición inicial obtenida: ${initialPosition.latitude}, ${initialPosition.longitude}');
      _notifyUI("Señal OK", initialPosition.latitude, initialPosition.longitude);
      _sendLocation(initialPosition.latitude, initialPosition.longitude);
    } catch (e) {
      print('DEBUG: No se pudo obtener posición inicial (timeout o error): $e');
      _notifyUI("Buscando satélites...", 0, 0);
    }

    // Configuración del stream
    double distanceFilter = _serverSettings?['pasos']?.toDouble() ?? 100.0;
    LocationAccuracy accuracy = LocationAccuracy.best;
    
    // Si la aprox es muy alta, podemos ajustar accuracy
    double aprox = _serverSettings?['aproximGeoLocalizacion']?.toDouble() ?? 10.0;
    if (aprox > 50) accuracy = LocationAccuracy.medium;

    LocationSettings locationSettings = LocationSettings(
      accuracy: accuracy,
      distanceFilter: distanceFilter.toInt(), 
    );

    print('DEBUG: Iniciando stream con distanceFilter: $distanceFilter, Accuracy: $accuracy');
    _notifyUI("Esperando movimiento (${distanceFilter}m)...", 0, 0);

    _positionStream?.cancel();
    _positionStream = Geolocator.getPositionStream(locationSettings: locationSettings)
        .listen((Position? position) {
      if (position != null) {
        print('DEBUG GEOLOCALIZACIÓN: Lat: ${position.latitude}, Lon: ${position.longitude}');
        _sendLocation(position.latitude, position.longitude);
      }
    }, onError: (e) {
      _notifyUI("Error GPS: $e", 0, 0);
      print('DEBUG: Error en stream de ubicación: $e');
    });
  }

  void _notifyUI(String status, double lat, double lng) async {
    currentData = {
      "status": status,
      "lat": lat,
      "lng": lng,
      "ticketId": _currentTicketId,
      "tecnicoId": _currentTecnicoId,
      "timestamp": DateTime.now().toString().split('.').first.split(' ').last
    };
    
    // Guardar el ticketId para que el Isolate de background lo use
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt('current_ticket_id', _currentTicketId ?? 0);
    } catch (e) {
      print('LOCATION_SERVICE: Error guardando ticketId en prefs: $e');
    }

    if (!_locationUpdateController.isClosed) {
      _locationUpdateController.add(currentData!);
    }
  }

  Future<String> _sendLocation(double lat, double lng) async {
    final ticketIdToSend = _currentTicketId ?? 0;
    final tecnicoIdToSend = _currentTecnicoId ?? 0;

    final connectivityResult = await Connectivity().checkConnectivity();
    bool hasInternet = !connectivityResult.contains(ConnectivityResult.none) || connectivityResult.length > 1;
    if (connectivityResult.length == 1 && connectivityResult.first == ConnectivityResult.none) {
      hasInternet = false;
    }

    if (!hasInternet) {
      print('LOCATION_SERVICE: Sin internet. Guardando en SQLite...');
      await DatabaseHelper().insertLocation({
        'ticketId': ticketIdToSend,
        'tecnicoId': tecnicoIdToSend,
        'latitud': lat,
        'longitud': lng,
        'tipo': 'TICKET',
        'timestamp': DateTime.now().toIso8601String()
      });
      _notifyUI("Guardado Offline", lat, lng);
      return "Guardado Offline";
    }

    try {
      final response = await http.post(
        Uri.parse(_baseUrl),
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
        body: jsonEncode({
          "TicketId": ticketIdToSend,
          "TecnicoId": tecnicoIdToSend,
          "Latitud": lat,
          "Longitud": lng
        }),
      );

      if (response.statusCode == 200) {
        _notifyUI("Enviado OK (${ticketIdToSend})", lat, lng);
        print('DEBUG: Ubicación enviada correctamente para Ticket $ticketIdToSend');
        return "Enviado Correctamente (ID: $ticketIdToSend)";
      } else {
        _notifyUI("Error API: ${response.statusCode}", lat, lng);
        print('DEBUG: Error al enviar ubicación: ${response.statusCode} - ${response.body}');
        return "Error API: ${response.statusCode}";
      }
    } catch (e) {
      _notifyUI("Excepción API: $e", lat, lng);
      // print('DEBUG: Excepción al enviar ubicación: $e');
      return "Excepción: $e";
    }
  }

  Future<void> syncOfflineLocations() async {
    print('LOCATION_SERVICE: Iniciando sincronización de ubicaciones offline...');
    try {
      final records = await DatabaseHelper().getLocations();
      if (records.isEmpty) {
        return;
      }
      for (var record in records) {
        if (record['tipo'] == 'TICKET') {
          final response = await http.post(
            Uri.parse(_baseUrl),
            headers: {'Content-Type': 'application/json; charset=UTF-8'},
            body: jsonEncode({
              "TicketId": record['ticketId'],
              "TecnicoId": record['tecnicoId'],
              "Latitud": record['latitud'],
              "Longitud": record['longitud'],
              "Estado": 3
            }),
          );
          if (response.statusCode == 200) {
            await DatabaseHelper().deleteLocation(record['id']);
            print('==================================================');
            print('☁️ ✅ ¡DATOS DE SQLITE ENVIADOS AL SERVIDOR!');
            print('Se sincronizó el registro TICKET ID ${record['id']}.');
            print('==================================================');
          }
        }
      }
    } catch (e) {
      print('LOCATION_SERVICE: Error durante sincronización offline: $e');
    }
  }

  /// Fuerza una actualización de ubicación (útil para "despertar" el sensor)
  Future<String> updateManualLocation(double lat, double lng) async {
    _notifyUI("Manual OK", lat, lng);
    return await _sendLocation(lat, lng);
  }

  void stopTracking() {
    _positionStream?.cancel();
    _positionStream = null;
    _currentTicketId = null;
    _currentTecnicoId = null;
    currentData = null;
    _notifyUI("Rastreo Detenido", 0, 0);
    print('DEBUG: Seguimiento de ubicación detenido.');
  }

  void dispose() {
    _locationUpdateController.close();
  }
}
