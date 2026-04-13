// main.dart
import 'package:cmsmobile/Routes/routes.dart';
import 'package:cmsmobile/screens/services/CronogramaService.dart';
import 'package:cmsmobile/screens/services/BackgroundService.dart';
import 'package:cmsmobile/screens/services/DeviceService.dart';
import 'package:cmsmobile/screens/shared/network_banner_wrapper.dart';
import 'package:flutter/material.dart';
import 'dart:io';

class MyHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return super.createHttpClient(context)
      ..badCertificateCallback =
          (X509Certificate cert, String host, int port) => true;
  }
}

void main() async {
  HttpOverrides.global = MyHttpOverrides();
  WidgetsFlutterBinding.ensureInitialized();
  await initializeService();
  DeviceService.startPeriodicTracking();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  permisosGeolocalizacion() {}

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      scaffoldMessengerKey: DeviceService.messengerKey,
      debugShowCheckedModeBanner: false,
      title: 'CronoMobile',
      builder: (context, child) {
        return NetworkBannerWrapper(child: child!);
      },
      initialRoute: 'Login',
      routes: {
        'Login': (context) => const Login(),

        'Dashboard': (context) => const Dashboard(),

        'CronogramaMantenimientos': (context) =>
            const CronogramaMantenimientos(),

        'CronogramaSeleccionado': (context) {
          final item =
              ModalRoute.of(context)!.settings.arguments as CronogramaItem;
          return CronogramaSeleccionado(item: item);
        },

        'CronogramaEjecutado': (context) {
          final item =
              ModalRoute.of(context)!.settings.arguments as CronogramaItem;
          return CronogramaEjecutado(item: item);
        },

        'TrackingMonitor': (context) => const TrackingMonitorScreen(),
      },
    );
  }
}
