import 'dart:convert';
import 'dart:io';
import 'package:cmsmobile/environments/environments.dart';
import 'package:cmsmobile/screens/services/SessionManager.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:path/path.dart' as p;
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:cmsmobile/screens/services/DatabaseHelper.dart';

class FileMediaService {
  static final String _baseUrlMetadata =
      '${Environments().apiTicket()}FileMediaTicket/';

  static final String _baseUrlImage = '${Environments().apiTicket()}Imagen/';

  /// Guarda el metadato del archivo en la base de datos
  static Future<bool> guardarFileMediaTicketUnit(
    Map<String, dynamic> model,
  ) async {
    try {
      final userData = await SessionManager.getUserData();
      final String token = userData['token'] ?? '';
      final String url = '${_baseUrlMetadata}GuardarFileMediaTicketUnit';

      final connectivityResult = await (Connectivity().checkConnectivity());
      if (connectivityResult.isEmpty || connectivityResult.contains(ConnectivityResult.none)) {
        print('Guardando metadata de archivo OFFLINE');
        // Usamos un folderName 'METADATA' temporalmente, lo manejaremos en la sync
        await DatabaseHelper().insertArchivo(
          model['ticketId'] ?? 0, 'metadata_only', 'metadata', 'metadata', jsonEncode(model));
        return true;
      }

      print('--> HTTP POST [Metadata/Online]: $url');
      print('    Payload: ${jsonEncode(model)}');
      
      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode(model),
      ).timeout(const Duration(seconds: 15));

      print('<-- Respuesta [Metadata/Online]: ${response.statusCode} | Body: ${response.body}');

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('Error en guardarFileMediaTicketUnit: $e -> ENCOLANDO OFFLINE');
      await DatabaseHelper().insertArchivo(
        model['ticketId'] ?? 0, 'metadata_only', 'metadata', 'metadata', jsonEncode(model));
      return true;
    }
  }

  /// Sube el archivo binario al servidor
  /// Nota: Si el endpoint de subida es diferente, favor ajustarlo aquí.
  static Future<bool> uploadFile({
    required File file,
    required String fileName,
    required int ticketId,
    required String folderName,
  }) async {
    try {
      final userData = await SessionManager.getUserData();
      final String token = userData['token'] ?? '';

      final String url =
          '${_baseUrlImage}CrearCarpetaMobile/$ticketId/$folderName';
      print('--> HTTP POST [FileBin/Online]: $url');
      print('    Archivo a enviar: ${file.path}, Peso: ${file.lengthSync()}');

      final connectivityResult = await (Connectivity().checkConnectivity());
      if (connectivityResult.isEmpty || connectivityResult.contains(ConnectivityResult.none)) {
        print('Guardando archivo OFFLINE para subir luego: $fileName');
        await DatabaseHelper().insertArchivo(ticketId, file.path, fileName, folderName, '');
        return true;
      }

      final request = http.MultipartRequest('POST', Uri.parse(url));
      request.headers['Authorization'] = 'Bearer $token';

      final String extension = p.extension(file.path).toLowerCase();
      final String mimeType = extension == '.png' ? 'image/png' : 'image/jpeg';
      print('DEBUG: Extension: $extension, MimeType: $mimeType');

      request.files.add(
        await http.MultipartFile.fromPath(
          'Archivo', // El nombre del campo que espera el backend (IFormFile Archivo)
          file.path,
          filename: fileName,
          contentType: MediaType.parse(mimeType),
        ),
      );

      print('    Cargando binarios a la petición HTTP Multipart...');
      final streamedResponse = await request.send().timeout(const Duration(seconds: 45));
      final response = await http.Response.fromStream(streamedResponse);
      
      print('<-- Respuesta [FileBin/Online]: ${response.statusCode} | Body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        print('Archivo subido exitosamente: $fileName');
        return true;
      } else {
        print(
          'Error al subir archivo: ${response.statusCode} - ${response.body}',
        );
        return false;
      }
    } catch (e) {
      print('Excepción en uploadFile: $e -> ENCOLANDO OFFLINE');
      await DatabaseHelper().insertArchivo(ticketId, file.path, fileName, folderName, '');
      return true;
    }
  }
}
