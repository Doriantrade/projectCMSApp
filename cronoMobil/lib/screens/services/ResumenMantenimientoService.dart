import 'dart:convert';
import 'package:cmsmobile/environments/environments.dart';
import 'package:cmsmobile/screens/services/SessionManager.dart';
import 'package:http/http.dart' as http;
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:cmsmobile/screens/services/DatabaseHelper.dart';

class ResumenMantenimientoService {
  static final String _baseUrl =
      '${Environments().apiTicket()}ResumenMantenimiento/';

  static Future<bool> guardarResumenMantenimiento(
    Map<String, dynamic> model,
  ) async {
    try {
      // Obtener el token JWT desde SessionManager
      final userData = await SessionManager.getUserData();
      final String token = userData['token'] ?? '';

      final String url = '${_baseUrl}GuardarResumenMantenimientos';

      print("--> HTTP POST [Resumen/Online]: $url");
      print("    Token: ${token.isNotEmpty ? 'Token presente' : 'Token MISSING'}");
      print("    Payload: ${jsonEncode(model)}");

      final connectivityResult = await (Connectivity().checkConnectivity());
      if (connectivityResult.isEmpty || connectivityResult.contains(ConnectivityResult.none)) {
        print('Guardando resumen de mantenimiento OFFLINE');
        final ticketId = model['idMantenimiento'] ?? model['idmantenimiento'] ?? 0;
        await DatabaseHelper().insertResumenMantenimiento(ticketId, jsonEncode(model));
        return true;
      }

      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json; charset=UTF-8',
        },        
        body: jsonEncode(model),
      ).timeout(const Duration(seconds: 15));

      print('<-- Respuesta [Resumen/Online]: ${response.statusCode} | Body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      } else {
        throw Exception(
          'Error del servidor (${response.statusCode}): ${response.body}',
        );
      }
    } catch (e) {
      print('Excepción en guardarResumenMantenimiento: $e -> ENCOLANDO OFFLINE');
      final ticketId = model['idMantenimiento'] ?? model['idmantenimiento'] ?? 0;
      await DatabaseHelper().insertResumenMantenimiento(ticketId, jsonEncode(model));
      return true;
    }
  }
}
