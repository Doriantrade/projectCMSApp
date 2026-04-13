import 'dart:convert';
import 'dart:io';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:path/path.dart' as p;
import 'package:cmsmobile/environments/environments.dart';
import 'package:cmsmobile/screens/services/DatabaseHelper.dart';
import 'package:cmsmobile/screens/services/SessionManager.dart';

class SyncService {
  static bool _isSyncing = false;

  static Future<void> syncOfflineData() async {
    if (_isSyncing) return;

    final connectivityResult = await (Connectivity().checkConnectivity());
    if (connectivityResult.isEmpty || connectivityResult.contains(ConnectivityResult.none)) {
      return; // Aún sin internet
    }

    _isSyncing = true;
    print('🔄 Iniciando sincronización de datos offline...');

    try {
      final dbHelper = DatabaseHelper();
      final userData = await SessionManager.getUserData();
      final String token = userData['token'] ?? '';

      // 1. Sincronizar acciones de estado
      final acciones = await dbHelper.getAccionesEstado();
      for (var accion in acciones) {
        bool success = false;
        final payload = jsonDecode(accion['payload']);
        if (accion['tipo'] == 'asignacion') {
          success = await _syncAsignacion(payload);
        } else if (accion['tipo'] == 'estado') {
          success = await _syncEstado(payload);
        }
        if (success) {
          await dbHelper.deleteAccionEstado(accion['id']);
          print('✅ Acción sincronizada y eliminada: ${accion['id']}');
        }
      }

      // 2. Sincronizar Resumen Mantenimiento
      final resumenes = await dbHelper.getResumenMantenimiento();
      for (var resumen in resumenes) {
        final payload = jsonDecode(resumen['payload']);
        bool success = await _syncResumen(payload, token);
        if (success) {
          await dbHelper.deleteResumenMantenimiento(resumen['id']);
          print('✅ Resumen sincronizado y eliminado: ${resumen['id']}');
        }
      }

      // 3. Sincronizar Archivos y Metadata
      final archivos = await dbHelper.getArchivosPendientes();
      for (var archivo in archivos) {
        bool fileSuccess = true;
        
        // Si no es "metadata_only", primero subir el archivo
        if (archivo['filePath'] != 'metadata_only') {
          File file = File(archivo['filePath']);
          if (await file.exists()) {
            fileSuccess = await _syncArchivoBinario(file, archivo['ticketId'], archivo['fileName'], archivo['folderName'], token);
          } else {
            print('⚠️ Archivo físico no encontrado, se ignora la subida binaria.');
          }
        }

        if (fileSuccess) {
          final metadataString = archivo['metadataJson'];
          bool metaSuccess = true;
          if (metadataString != null && metadataString.toString().isNotEmpty) {
            final payload = jsonDecode(metadataString);
            metaSuccess = await _syncFileMetadata(payload, token);
          }

          if (metaSuccess) {
            await dbHelper.deleteArchivo(archivo['id']);
            print('✅ Archivo/metadata sincronizado y eliminado: ${archivo['id']}');
          }
        }
      }

    } catch (e) {
      print('❌ Error general en sincronización: $e');
    } finally {
      print('🔄 Finalizada sincronización offline.');
      _isSyncing = false;
    }
  }

  static Future<bool> _syncAsignacion(Map<String, dynamic> payload) async {
    final String url = '${Environments().apiTicket()}AsignacionTecnicoTicket/actualizarHoraAsignacion/${payload["idAsignacionTecnico"]}/${payload["tipo"]}';
    print('--> HTTP GET (Asignacion): $url');
    print('    Payload interno: $payload');
    try {
      final response = await http.get(Uri.parse(url), headers: {'Content-Type': 'application/json; charset=UTF-8'});
      print('<-- Respuesta Asignacion: ${response.statusCode} | Body: ${response.body}');
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('<-- Excepción Asignacion: $e');
      return false;
    }
  }

  static Future<bool> _syncEstado(Map<String, dynamic> payload) async {
    final String url = '${Environments().api()}Mantenimiento/actualizarEstado/${payload["idMantenimiento"]}';
    print('--> HTTP PUT (Estado): $url');
    print('    Headers: { nuevoEstado: ${payload["nuevoEstado"]}, usuario: ${payload["usuario"]} }');
    try {
      final response = await http.put(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'nuevoEstado': payload["nuevoEstado"].toString(),
          'usuario': payload["usuario"].toString(),
        },
      );
      print('<-- Respuesta Estado: ${response.statusCode} | Body: ${response.body}');
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('<-- Excepción Estado: $e');
      return false;
    }
  }

  static Future<bool> _syncResumen(Map<String, dynamic> payload, String token) async {
    final String url = '${Environments().apiTicket()}ResumenMantenimiento/GuardarResumenMantenimientos';
    print('--> HTTP POST (Resumen): $url');
    print('    Body: ${jsonEncode(payload)}');
    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json; charset=UTF-8'},
        body: jsonEncode(payload),
      );
      print('<-- Respuesta Resumen: ${response.statusCode} | Body: ${response.body}');
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('<-- Excepción Resumen: $e');
      return false;
    }
  }

  static Future<bool> _syncArchivoBinario(File file, int ticketId, String fileName, String folderName, String token) async {
    final String url = '${Environments().apiTicket()}Imagen/CrearCarpetaMobile/$ticketId/$folderName';
    print('--> HTTP MULTIPART (Archivo): $url');
    print('    Archivo: ${file.path}');
    try {
      final request = http.MultipartRequest('POST', Uri.parse(url));
      request.headers['Authorization'] = 'Bearer $token';

      final String extension = p.extension(file.path).toLowerCase();
      final String mimeType = extension == '.png' ? 'image/png' : 'image/jpeg';
      request.files.add(
        await http.MultipartFile.fromPath(
          'Archivo', file.path, filename: fileName, contentType: MediaType.parse(mimeType)
        ),
      );
      final streamedResponse = await request.send();
      final responseString = await streamedResponse.stream.bytesToString();
      print('<-- Respuesta Archivo: ${streamedResponse.statusCode} | Body: $responseString');
      return streamedResponse.statusCode == 200 || streamedResponse.statusCode == 201;
    } catch (e) {
      print('<-- Excepción Archivo: $e');
      return false;
    }
  }

  static Future<bool> _syncFileMetadata(Map<String, dynamic> payload, String token) async {
    final String url = '${Environments().apiTicket()}FileMediaTicket/GuardarFileMediaTicketUnit';
    print('--> HTTP POST (Metadata): $url');
    print('    Body: ${jsonEncode(payload)}');
    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {'Authorization': 'Bearer $token', 'Content-Type': 'application/json; charset=UTF-8'},
        body: jsonEncode(payload),
      );
      print('<-- Respuesta Metadata: ${response.statusCode} | Body: ${response.body}');
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('<-- Excepción Metadata: $e');
      return false;
    }
  }
}
