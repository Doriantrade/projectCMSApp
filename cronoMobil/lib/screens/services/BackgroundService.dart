import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_background_service/flutter_background_service.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:device_info_plus/device_info_plus.dart';
import 'package:cmsmobile/environments/environments.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cmsmobile/screens/services/DatabaseHelper.dart';

Future<void> initializeService() async {
  final service = FlutterBackgroundService();

  const AndroidNotificationChannel channel = AndroidNotificationChannel(
    'my_foreground', // id
    'Rastreo GPS CMS', // title
    description: 'Este canal se usa para rastreo GPS en segundo plano.',
    importance: Importance.low, // low para que no suene a cada rato
  );

  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

  if (Platform.isIOS || Platform.isAndroid) {
    await flutterLocalNotificationsPlugin.initialize(
      settings: const InitializationSettings(
        iOS: DarwinInitializationSettings(),
        android: AndroidInitializationSettings('ic_bg_service_small'),
        
      ),
    );
  }

  await flutterLocalNotificationsPlugin
      .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
      ?.createNotificationChannel(channel);

  await service.configure(
    androidConfiguration: AndroidConfiguration(
      onStart: onStart,
      autoStart: false,
      isForegroundMode: true,
      notificationChannelId: 'my_foreground',
      initialNotificationTitle: 'Activando Rastreo',
      initialNotificationContent: 'Preparando servicios de GPS',
      foregroundServiceNotificationId: 888,
    ),
    iosConfiguration: IosConfiguration(
      autoStart: false,
      onForeground: onStart,
      onBackground: onIosBackground,
    ),
  );
}

@pragma('vm:entry-point')
Future<bool> onIosBackground(ServiceInstance service) async {
  WidgetsFlutterBinding.ensureInitialized();
  DartPluginRegistrant.ensureInitialized();
  return true;
}

@pragma('vm:entry-point')
void onStart(ServiceInstance service) async {
  DartPluginRegistrant.ensureInitialized();

  final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

  if (service is AndroidServiceInstance) {
    service.on('setAsForeground').listen((event) {
      service.setAsForegroundService();
    });

    service.on('setAsBackground').listen((event) {
      service.setAsBackgroundService();
    });
  }

  service.on('stopService').listen((event) {
    service.stopSelf();
  });

  // Obtenemos tiempo de intervalo
  SharedPreferences prefs = await SharedPreferences.getInstance();
  await prefs.reload(); // Asegurar que lee el último valor guardado por DeviceService
  int intervalSeconds = prefs.getInt('bg_interval_seconds') ?? 300;
  
  if (intervalSeconds <= 0) {
    intervalSeconds = 300;
  }
  
  Timer? bgTimer;

  Future<void> performTick() async {
    if (service is AndroidServiceInstance) {
      if (await service.isForegroundService()) {
        flutterLocalNotificationsPlugin.show(
          id: 888,
          title: 'Rastreo CMS Activo',
          body: 'Enviando coordenadas en segundo plano a las ${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}',
          notificationDetails: const NotificationDetails(
            android: AndroidNotificationDetails(
              'my_foreground',
              'Rastreo GPS CMS',
              icon: 'ic_bg_service_small',
              ongoing: true,
            ),
          ),
        );
      }
    }

    print('BACKGROUND_SERVICE: Ejecutando ciclo...');

    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      print('BACKGROUND_SERVICE: GPS apagado.');
      return;
    }
    
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) {
       print('BACKGROUND_SERVICE: Sin permisos. Ignorando.');
       return;
    }

    late Position position;
    late String deviceId;

    try {
      position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.best,
        timeLimit: const Duration(seconds: 15),
      );
      deviceId = await _getDeviceId();
    } catch (e) {
      print('BACKGROUND_SERVICE: Error obteniendo ubicación o deviceId: $e');
      return; 
    }

    try {
      String codUser = prefs.getString('coduser') ?? '-SINLOG-';

      // Forzamos recarga de las preferencias para leer el estado más reciente de la UI
      await prefs.reload();
      bool isForeground = prefs.getBool('is_app_in_foreground') ?? false;
      int currentEstado = isForeground ? 1 : 2;

      int ticketId = prefs.getInt('current_ticket_id') ?? 0;

      // Construimos el payload igual que en DeviceService
      final Map<String, dynamic> body = {
        "mac": deviceId,
        "coduser": codUser,
        "estado": currentEstado,
        "longitud": position.longitude.toString(),
        "latitud": position.latitude.toString(),
        "idTicket": ticketId,
      };

      final String apiUrl = Environments().api() + 'MacMobile/guardarAsignacionMacTecnico';
      final response = await http.post(
        Uri.parse(apiUrl),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        print('BACKGROUND_SERVICE: Envío exitoso.');
        // Enviamos evento al UI por si está abierta la app en primer plano
        service.invoke(
          'update',
          {
            "current_date": DateTime.now().toIso8601String(),
            "lat": position.latitude,
            "lng": position.longitude,
            "status": "Success",
          },
        );
      } else {
        print('BACKGROUND_SERVICE: Error en API ${response.statusCode}');
        print('BACKGROUND_SERVICE: Guardando en SQLite localmente...');
        await DatabaseHelper().insertLocation({
          'mac': deviceId,
          'coduser': codUser,
          'latitud': position.latitude,
          'longitud': position.longitude,
          'ticketId': ticketId,
          'tipo': 'RASTREO',
          'timestamp': DateTime.now().toIso8601String()
        });
      }
    } catch (e) {
      print('BACKGROUND_SERVICE: Excepción de red: $e');
      print('BACKGROUND_SERVICE: Guardando en SQLite localmente por falta de internet...');
      await DatabaseHelper().insertLocation({
        'mac': deviceId, 
        'coduser': prefs.getString('coduser') ?? '-SINLOG-',
        'latitud': position.latitude,
        'longitud': position.longitude,
        'ticketId': prefs.getInt('current_ticket_id') ?? 0,
        'tipo': 'RASTREO',
        'timestamp': DateTime.now().toIso8601String()
      });
    }
  }

  void startTimer(int interval) {
    bgTimer?.cancel();
    bgTimer = Timer.periodic(Duration(seconds: interval), (timer) async {
       await performTick();
    });
    print('BACKGROUND_SERVICE_START: Timer configurado para disparar cada $interval segundos.');
  }

  startTimer(intervalSeconds);

  service.on('updateTimer').listen((event) async {
    await prefs.reload();
    int newInterval = prefs.getInt('bg_interval_seconds') ?? 300;
    if (newInterval <= 0) newInterval = 300;
    
    print('BACKGROUND_SERVICE_UPDATE: Recibida petición para actualizar timer. Nuevo intervalo: $newInterval');
    startTimer(newInterval);
    await performTick(); // Forzar un envío inmediato al actualizar
  });
}

Future<String> _getDeviceId() async {
  String deviceId = 'UNKNOWN';
  final DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();
  if (Platform.isAndroid) {
    AndroidDeviceInfo androidInfo = await deviceInfo.androidInfo;
    deviceId = androidInfo.model;
  } else if (Platform.isIOS) {
    IosDeviceInfo iosInfo = await deviceInfo.iosInfo;
    deviceId = iosInfo.identifierForVendor ?? 'UNKNOWN_IOS';
  }
  return deviceId;
}
