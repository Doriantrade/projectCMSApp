// auth_service.dart
import 'dart:convert';
import 'package:cmsmobile/environments/environments.dart';
import 'package:http/http.dart' as http;

class AuthService {
  static final String _baseUrl = '${Environments().api()}login/login';

  // Modelo de datos para el login
  static Map<String, dynamic> loginData = {"email": "", "contrasenia": ""};

  // Función para realizar el login
  static Future<Map<String, dynamic>> login(
    String email,
    String password,
  ) async {
    print('DATOS ENVIADOS AL SERVIDOR>>>>>>>>>>>>>>>>>>>>');
    print(email);
    print(password);
    print('DATOS ENVIADOS AL SERVIDOR>>>>>>>>>>>>>>>>>>>>');

    try {
      final response = await http.post(
        Uri.parse(_baseUrl),
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
        body: jsonEncode({"email": email, "contrasenia": password}),
      );

      print('-------------------------------------------');
      print('RESPUESTA DEL SERVIDOR!!!!');
      print(_baseUrl);
      print(response);
      print('-------------------------------------------');

      // Manejar diferentes códigos de estado
      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': 'Ingreso correcto',
          'data': jsonDecode(response.body),
        };
      } else if (response.statusCode == 404 || response.statusCode == 400) {
        return {
          'success': false,
          'message': 'No se encontraron datos',
          'data': null,
        };
      } else if (response.statusCode == 500) {
        return {
          'success': false,
          'message': 'Problemas con el servidor',
          'data': null,
        };
      } else {
        return {
          'success': false,
          'message': 'Error desconocido: ${response.statusCode}',
          'data': null,
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión: $e',
        'data': null,
      };
    }
  }
}
