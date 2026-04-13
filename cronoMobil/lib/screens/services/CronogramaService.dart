import 'dart:convert';
import 'package:cmsmobile/environments/environments.dart';
import 'package:http/http.dart' as http;
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:cmsmobile/screens/services/DatabaseHelper.dart';

// Modelo de datos para el cronograma
class CronogramaItem {
  final String codcrono;
  final String codagencia;
  final String codusertecnic;
  final String nombreAgencia;
  final String codcliente;
  final String horarioatenciond;
  final String imagenCliente;
  final String horarioatencionhm;
  final String nombreCliente;
  final String provinciaAgencia;
  final String cantonAgencia;
  final String observacion;
  final String feccrea;
  final String codusercreacrono;
  final String nombreCreadorCrono;
  final String nombreTecnico;
  final int mes;
  final int dia;
  final int anio;
  final String fechamantenimiento;
  final String codlocalidad;
  final int estado;
  final int idmantenimiento;
  final int estadoMantenimiento;
  final int cantidadAsignaciones;
  final int idRequer;
  final String tipoMaquinaria;
  final String marcaMaquinaria;
  final String modeloMaquinaria;
  final String descripcionProblema;
  final String horaInicialReal;
  final String horaFinalReal;
  final String imagenTicketClienteGenerada;
  final String fecreaRealIni;
  final String fecreaRealFin;
  final int idAsignacionTecnico;

  CronogramaItem({
    required this.codcrono,
    required this.codagencia,
    required this.codusertecnic,
    required this.nombreAgencia,
    required this.codcliente,
    required this.horarioatenciond,
    required this.imagenCliente,
    required this.horarioatencionhm,
    required this.nombreCliente,
    required this.provinciaAgencia,
    required this.cantonAgencia,
    required this.observacion,
    required this.feccrea,
    required this.codusercreacrono,
    required this.nombreCreadorCrono,
    required this.nombreTecnico,
    required this.mes,
    required this.dia,
    required this.anio,
    required this.fechamantenimiento,
    required this.codlocalidad,
    required this.estado,
    required this.idmantenimiento,
    required this.estadoMantenimiento,
    required this.cantidadAsignaciones,
    required this.idRequer,
    required this.tipoMaquinaria,
    required this.marcaMaquinaria,
    required this.modeloMaquinaria,
    required this.descripcionProblema,
    required this.horaInicialReal,
    required this.horaFinalReal,
    required this.imagenTicketClienteGenerada,
    required this.fecreaRealIni,
    required this.fecreaRealFin,
    required this.idAsignacionTecnico,
  });

  factory CronogramaItem.fromJson(Map<String, dynamic> json) {
    return CronogramaItem(
      codcrono: json['codcrono'] ?? '',
      codagencia: json['codagencia'] ?? '',
      codusertecnic: json['codusertecnic'] ?? '',
      nombreAgencia: json['nombreAgencia'] ?? '',
      codcliente: json['codcliente'] ?? '',
      horarioatenciond: json['horarioatenciond'] ?? '',
      imagenCliente: json['imagenCliente'] ?? '',
      horarioatencionhm: json['horarioatencionhm'] ?? '',
      nombreCliente: json['nombreCliente'] ?? '',
      provinciaAgencia: json['provinciaAgencia'] ?? '',
      cantonAgencia: json['cantonAgencia'] ?? '',
      observacion: json['observacion'] ?? '',
      feccrea: json['feccrea'] ?? '',
      codusercreacrono: json['codusercreacrono'] ?? '',
      nombreCreadorCrono: json['nombreCreadorCrono'] ?? '',
      nombreTecnico: json['nombreTecnico'] ?? '',
      mes: json['mes'] ?? 0,
      dia: json['dia'] ?? 0,
      anio: json['anio'] ?? 0,
      fechamantenimiento: json['fechamantenimiento'] ?? '',
      codlocalidad: json['codlocalidad'] ?? '',
      estado: json['estado'] ?? 0,
      idmantenimiento: json['idmantenimiento'] ?? 0,
      estadoMantenimiento: json['estadoMantenimiento'] ?? 0,
      cantidadAsignaciones: json['cantidadAsignaciones'] ?? 0,
      idRequer: json['idRequer'] ?? 0,
      tipoMaquinaria: json['tipoMaquinaria'] ?? '',
      marcaMaquinaria: json['marcaMaquinaria'] ?? '',
      modeloMaquinaria: json['modeloMaquinaria'] ?? '',
      descripcionProblema: json['descripcionProblema'] ?? '',
      horaInicialReal: json['horaInicialReal'] ?? '',
      horaFinalReal: json['horaFinalReal'] ?? '',
      imagenTicketClienteGenerada: json['imagenTicketClienteGenerada'] ?? '',
      fecreaRealIni: json['fecreaRealIni'] ?? '',
      fecreaRealFin: json['fecreaRealFin'] ?? '',
      idAsignacionTecnico: json['idAsignacionTecnico'] ?? 0,
    );
  }
}

class CronogramaService {
  static final String _baseUrl = '${Environments().api()}Cronograma/';
  // Función para obtener el cronograma
  static Future<List<CronogramaItem>> getCronograma(
    String coduser,
    String companyCode,
  ) async {
    final connectivityResult = await (Connectivity().checkConnectivity());
    if (connectivityResult.isEmpty || connectivityResult.contains(ConnectivityResult.none)) {
      print('Buscando cronogramas localmente...');
      return _getCronogramasOffline(coduser, companyCode);
    }
    
    try {
      final response = await http.get(
        Uri.parse(
          '${_baseUrl}ObtenerCronogramaMobilTecnico/$coduser/$companyCode',
        ),
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
      ).timeout(const Duration(seconds: 15));
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        
        // Save to offline cache
        await DatabaseHelper().insertCronogramas(coduser, companyCode, response.body);
        
        return data.map((json) => CronogramaItem.fromJson(json)).toList();
      } else {
        throw Exception('Error al cargar cronograma: ${response.statusCode}');
      }
    } catch (e) {
      print('Error de conexión obteniendo cronograma, usando cache: $e');
      return _getCronogramasOffline(coduser, companyCode);
    }
  }

  static Future<List<CronogramaItem>> _getCronogramasOffline(String coduser, String companyCode) async {
    try {
      final rows = await DatabaseHelper().getCronogramas(coduser, companyCode);
      if (rows.isNotEmpty) {
        final String jsonString = rows.first['jsonModel'];
        final List<dynamic> data = jsonDecode(jsonString);
        return data.map((json) => CronogramaItem.fromJson(json)).toList();
      }
    } catch (e) {
      print('Error consultando SQLite: $e');
    }
    return [];
  }

  // Actualizar hora de asignación (Entrada 'E' o Salida 'S')
  static Future<bool> actualizarHoraAsignacion(
    String idAsignacionTecnico,
    String tipo,
  ) async {
    final String url =
        '${Environments().apiTicket()}AsignacionTecnicoTicket/actualizarHoraAsignacion/$idAsignacionTecnico/$tipo';

    print("::::::::::::::::::::::::API::::::::::::::::::::::::::::");
    print(url);
    print(":::::::::::::::::::::::::::::::::::::::::::::::::::::::");

    final connectivityResult = await (Connectivity().checkConnectivity());
    if (connectivityResult.isEmpty || connectivityResult.contains(ConnectivityResult.none)) {
      print('Guardando actualización de hora de asignación OFFLINE');
      final payload = jsonEncode({"idAsignacionTecnico": idAsignacionTecnico, "tipo": tipo});
      await DatabaseHelper().insertAccionEstado('asignacion', payload);
      return true;
    }

    try {
      print('--> HTTP GET [Asignación/Salida/Online]: $url');
      final response = await http.get(
        Uri.parse(url),
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
      ).timeout(const Duration(seconds: 15));
      
      print('<-- Respuesta [Asignación/Salida/Online]: ${response.statusCode} | Body: ${response.body}');
      
      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      } else {
        throw Exception(
          'Error del servidor (${response.statusCode}): ${response.body}',
        );
      }
    } catch (e) {
      print('Excepción en actualizarHoraAsignacion: $e -> ENCOLANDO OFFLINE');
      final payload = jsonEncode({"idAsignacionTecnico": idAsignacionTecnico, "tipo": tipo});
      await DatabaseHelper().insertAccionEstado('asignacion', payload);
      return true;
    }
  }

  /// Actualiza el estado del mantenimiento dentro de su ciclo de vida.
  ///
  /// [idMantenimiento]: El ID único del mantenimiento obtenido del CronogramaItem.
  /// [nuevoEstado]: El nuevo código de estado (1: Llegada, 2: Visto, 3: Iniciado, 5: Finalizado).
  /// [usuario]: El código del usuario técnico logueado.
  ///
  /// Esta función realiza una petición HTTP PUT a la API de mantenimiento,
  /// enviando los parámetros de estado y usuario a través de los headers.
  static Future<bool> actualizarEstado({
    required int idMantenimiento,
    required int nuevoEstado,
    required String usuario,
  }) async {
    // Construcción de la URL endpoint para la actualización
    final String url =
        '${Environments().api()}Mantenimiento/actualizarEstado/$idMantenimiento';

    // Registro informativo en consola para trazabilidad durante el desarrollo
    print("::::::::::::::::::::API ACTUALIZAR ESTADO::::::::::::::::::::::");
    print("URL: $url");
    print("Headers Enviados -> nuevoEstado: $nuevoEstado, usuario: $usuario");
    print(":::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::");

    // Ejecución de la petición PUT con los headers requeridos por el backend
    final connectivityResult = await (Connectivity().checkConnectivity());
    if (connectivityResult.isEmpty || connectivityResult.contains(ConnectivityResult.none)) {
      print('Guardando cambio de estado OFFLINE');
      final payload = jsonEncode({
        "idMantenimiento": idMantenimiento,
        "nuevoEstado": nuevoEstado,
        "usuario": usuario
      });
      await DatabaseHelper().insertAccionEstado('estado', payload);
      return true;
    }

    try {
      final payloadToSend = {
          'Content-Type': 'application/json; charset=UTF-8',
          'nuevoEstado': nuevoEstado.toString(),
          'usuario': usuario,
      };
      print('--> HTTP PUT [Estado/Online]: $url');
      print('    Headers: $payloadToSend');
      
      final response = await http.put(
        Uri.parse(url),
        headers: payloadToSend,
      ).timeout(const Duration(seconds: 15));

      print('<-- Respuesta [Estado/Online]: ${response.statusCode} | Body: ${response.body}');

      // Evaluación del código de respuesta del servidor (200 o 201 indican éxito)
      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      // Captura y registro de excepciones de red o errores inesperados
      print('Excepción en actualizarEstado: $e -> ENCOLANDO OFFLINE');
      final payload = jsonEncode({
        "idMantenimiento": idMantenimiento,
        "nuevoEstado": nuevoEstado,
        "usuario": usuario
      });
      await DatabaseHelper().insertAccionEstado('estado', payload);
      return true;
    }
  }
}
