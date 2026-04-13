// module_service.dart
import 'dart:convert';
import 'package:cmsmobile/environments/environments.dart';
import 'package:http/http.dart' as http;

class Module {
  final int id;
  final String nombre;
  final String descripcion;
  final String icon;
  final String color;
  final String codec;
  final int estado;
  final int permisos;
  final String ccia;

  Module({
    required this.id,
    required this.nombre,
    required this.descripcion,
    required this.icon,
    required this.color,
    required this.codec,
    required this.estado,
    required this.permisos,
    required this.ccia,
  });

  factory Module.fromJson(Map<String, dynamic> json) {
    return Module(
      id: json['id'] ?? 0,
      nombre: json['nombre'] ?? '',
      descripcion: json['descripcion'] ?? '',
      icon: json['icon'] ?? '',
      color: json['color'] ?? '',
      codec: json['codec'] ?? '',
      estado: json['estado'] ?? 0,
      permisos: json['permisos'] ?? 0,
      ccia: json['ccia'] ?? '',
    );
  }
}

class ModuleService {
  // static const String _baseUrl =
  // 'http://192.168.55.40:5130/api/ModuleMobil/ObtenerModuleMobile/';

  static final String _baseUrl =
      '${Environments().api()}ModuleMobil/ObtenerModuleMobile/';

  // Función para obtener los módulos
  static Future<List<Module>> getModules(String companyCode) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl$companyCode'),
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
      );

      print('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
      print('Respuesta del consumo de modulos mobile!!');
      print(response);
      print(Uri.parse('$_baseUrl$companyCode'));
      print('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Module.fromJson(json)).toList();
      } else {
        throw Exception('Error al cargar módulos: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
}
