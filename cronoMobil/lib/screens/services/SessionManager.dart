// session_manager.dart
import 'package:shared_preferences/shared_preferences.dart';

class SessionManager {
  static const String _keyNombre = 'nombre';
  static const String _keyApellido = 'apellido';
  static const String _keyEmail = 'email';
  static const String _keyCodUser = 'coduser';
  static const String _keyToken = 'token'; // Nuevo key para token

  static Future<void> saveUserData(Map<String, dynamic> userData) async {
    final prefs = await SharedPreferences.getInstance();

    await prefs.setString(_keyNombre, userData['nombre'] ?? '');
    await prefs.setString(_keyApellido, userData['apellido'] ?? '');
    await prefs.setString(_keyEmail, userData['email'] ?? '');
    await prefs.setString(_keyCodUser, userData['coduser'] ?? '');
    // Guardar el token. Asumimos que viene como 'token' en el mapa userData
    await prefs.setString(_keyToken, userData['token'] ?? '');
  }

  static Future<Map<String, String>> getUserData() async {
    final prefs = await SharedPreferences.getInstance();

    return {
      'nombre': prefs.getString(_keyNombre) ?? '',
      'apellido': prefs.getString(_keyApellido) ?? '',
      'email': prefs.getString(_keyEmail) ?? '',
      'coduser': prefs.getString(_keyCodUser) ?? '',
      'token': prefs.getString(_keyToken) ?? '', // Recuperar token
    };
  }

  static Future<void> clearUserData() async {
    final prefs = await SharedPreferences.getInstance();

    await prefs.remove(_keyNombre);
    await prefs.remove(_keyApellido);
    await prefs.remove(_keyEmail);
    await prefs.remove(_keyCodUser);
    await prefs.remove(_keyToken);
  }

  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyCodUser) != null;
  }
}
