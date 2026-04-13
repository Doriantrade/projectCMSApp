import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:cmsmobile/screens/services/LocationService.dart';
import 'package:cmsmobile/screens/services/DeviceService.dart';
import 'package:cmsmobile/screens/services/DatabaseHelper.dart';

class NetworkBannerWrapper extends StatefulWidget {
  final Widget child;

  const NetworkBannerWrapper({super.key, required this.child});

  @override
  State<NetworkBannerWrapper> createState() => _NetworkBannerWrapperState();
}

class _NetworkBannerWrapperState extends State<NetworkBannerWrapper> {
  bool _hasInternet = true;
  late StreamSubscription<List<ConnectivityResult>> _connectivitySubscription;

  @override
  void initState() {
    super.initState();
    _checkInitialConnectivity();
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen(_updateConnectionStatus);
  }
  
  Future<void> _checkInitialConnectivity() async {
    final results = await Connectivity().checkConnectivity();
    _updateConnectionStatus(results);
  }

  void _updateConnectionStatus(List<ConnectivityResult> results) {
    if (mounted) {
      bool previousInternetState = _hasInternet;
      
      setState(() {
        if (results.length == 1 && results.first == ConnectivityResult.none) {
          _hasInternet = false;
        } else {
          _hasInternet = true;
        }
      });

      if (!previousInternetState && _hasInternet) {
         print('INTERNET RESTAURADO: Disparando sincronización offline...');
         
         Future.microtask(() async {
           final records = await DatabaseHelper().getLocations();
           if (records.isNotEmpty && mounted) {
             ScaffoldMessenger.of(context).showSnackBar(
               SnackBar(
                 content: Row(
                   children: [
                     const Icon(Icons.cloud_upload, color: Colors.white),
                     const SizedBox(width: 10),
                     Expanded(child: Text('Enviando ${records.length} registros guardados sin internet al servidor...', style: const TextStyle(color: Colors.white))),
                   ],
                 ),
                 backgroundColor: Colors.blue.shade800,
                 duration: const Duration(seconds: 5),
               ),
             );
           }
         });

         LocationService().syncOfflineLocations();
         DeviceService.syncOfflineLocations();
      }
    }
  }

  @override
  void dispose() {
    _connectivitySubscription.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.ltr,
      child: Stack(
        children: [
          widget.child,
          if (!_hasInternet)
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: SafeArea(
                top: false,
                child: Material(
                  color: Colors.transparent,
                  child: Container(
                    color: Colors.orange.shade800,
                    padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
                    alignment: Alignment.center,
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.wifi_off, color: Colors.white, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Sin conexión a internet',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
