import 'dart:convert';
import 'package:cmsmobile/environments/environments.dart';
import 'package:cmsmobile/screens/services/SessionManager.dart';
import 'package:http/http.dart' as http;

// Modelo para los items de la Master Table
class MasterTableItem {
  final String codigo;
  final String nombre;

  MasterTableItem({
    required this.codigo,
    required this.nombre,
  });

  factory MasterTableItem.fromJson(Map<String, dynamic> json) {
    return MasterTableItem(
      codigo: json['codigo']?.toString() ?? '',
      nombre: json['nombre']?.toString() ?? '',
    );
  }
}

class MasterTableService {
  static final String _baseUrl = '${Environments().apiTicket()}Master/';

  /// Obtiene los datos de la Master Table según el tipo especificado
  /// 
  /// [master]: Código del tipo de master table a consultar
  ///   - 'RM': Resumen Mantenimiento (Motivo de visita)
  ///   - 'EF': Estado Final (Estado del equipo)
  static Future<List<MasterTableItem>> obtenerDatosMasterTable(
    String master,
  ) async {
    try {
      // Obtener el token JWT desde SessionManager
      final userData = await SessionManager.getUserData();
      final String token = userData['token'] ?? '';

      final String url = '${_baseUrl}ObtenerMasterTable/$master';

      print("::::::::::::::::::::API MASTER TABLE::::::::::::::::::::::");
      print("URL: $url");
      print("Master Type: $master");
      print(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::::");

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json; charset=UTF-8',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => MasterTableItem.fromJson(json)).toList();
      } else {
        print(
          'Error al obtener master table: ${response.statusCode} - ${response.body}',
        );
        throw Exception(
          'Error del servidor (${response.statusCode}): ${response.body}',
        );
      }
    } catch (e) {
      print('Excepción en obtenerDatosMasterTable: $e');
      throw Exception('Error de conexión: $e');
    }
  }
}
