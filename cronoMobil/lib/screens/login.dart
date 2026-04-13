import 'package:cmsmobile/screens/services/AuthService.dart';
import 'package:cmsmobile/screens/services/DeviceService.dart';
import 'package:cmsmobile/screens/services/SessionManager.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

class Login extends StatefulWidget {
  const Login({super.key});

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;

  @override
  void initState() {
    super.initState();
  }

  void _showAlertDialog(String title, String message, bool isSuccess) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF00796B),
          icon: isSuccess
              ? const Icon(Icons.done_outline, color: Colors.green, size: 50)
              : const Icon(Icons.cancel, color: Colors.red, size: 50),
          title: Text(
            title,
            style: const TextStyle(color: Colors.white),
            textAlign: TextAlign.center,
          ),
          content: Text(
            message,
            style: const TextStyle(color: Colors.white),
            textAlign: TextAlign.center,
          ),
          actionsAlignment: MainAxisAlignment.center,
          actions: <Widget>[
            TextButton(
              style: TextButton.styleFrom(
                backgroundColor: isSuccess ? Colors.green : Colors.red,
                foregroundColor: Colors.white,
              ),
              child: const Text('OK'),
              onPressed: () {
                Navigator.of(context).pop();
                // Si es éxito, navegar al dashboard después de cerrar el alert
                if (isSuccess) {
                  Navigator.pushReplacementNamed(context, 'Dashboard');
                }
              },
            ),
          ],
        );
      },
    );
  }

  Future<void> _handleLogin() async {
    // Validar campos
    if (_emailController.text.isEmpty || _passwordController.text.isEmpty) {
      _showAlertDialog('Error', 'Por favor, complete todos los campos', false);
      return;
    }

    // Validar formato de email básico
    if (!_emailController.text.contains('@')) {
      _showAlertDialog('Error', 'Por favor, ingrese un email válido', false);
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final response = await AuthService.login(
        _emailController.text,
        _passwordController.text,
      );

      setState(() {
        _isLoading = false;
      });

      if (response['success'] == true) {
        // Guardar datos del usuario en session storage
        final userData = response['data'];
        if (userData != null) {
          await SessionManager.saveUserData(userData);
          
          // Registrar dispositivo y ubicación en segundo plano (sin await para no bloquear UI principal)
          try {
             String codUser = userData['coduser'] ?? '';
             if (codUser.isNotEmpty) {
                 // Ejecutar asincrónicamente sin detener el flujo de login
                 DeviceService.registrarDispositivo(codUser).then((datosLogin) {
                    // Actualizar el servicio de fondo con los nuevos datos
                    DeviceService.startPeriodicTracking();

                    if (datosLogin != null && mounted) {
                        final screenHeight = MediaQuery.of(context).size.height;
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              "Dispositivo Registrado:\nUsuario: ${datosLogin['coduser']} - MAC: ${datosLogin['mac']}",
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            behavior: SnackBarBehavior.floating,
                            backgroundColor: Colors.green,
                            duration: const Duration(seconds: 4),
                            margin: EdgeInsets.only(
                              bottom: screenHeight > 200 ? screenHeight - 150 : 50,
                              left: 20,
                              right: 20,
                            ),
                          )
                        );
                    }
                 });
             }
          } catch (e) {
             print('Error al registrar dispositivo en segundo plano: $e');
          }
        }

        _showAlertDialog('Éxito', response['message'], true);
      } else {
        _showAlertDialog('Error', response['message'], false);
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      _showAlertDialog('Error', 'Ocurrió un error inesperado: $e', false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        backgroundColor: const Color(0xFF383838),
        body: Column(
          children: <Widget>[
            // Logo y texto superior
            Expanded(
              flex: 1,
              child: Container(
                padding: const EdgeInsets.all(25.0),
                alignment: Alignment.bottomCenter,
                child: Image.asset('lib/assets/logo/logo.png', height: 100),
              ),
            ),
            const SizedBox(height: 20),
            // Contenedor del formulario - Ocupa el resto de la pantalla
            Expanded(
              flex: 2,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20.0),
                decoration: BoxDecoration(
                  color: const Color(0xFF00796B),
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(40),
                  ),
                ),
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Image.asset(
                            'lib/assets/logo/logo_crono_mobile.png',
                            height: 30,
                          ),
                          const SizedBox(width: 8),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Campo de email
                      const Text(
                        'Email:',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _emailController,
                        autofocus: true,
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: const Color.fromARGB(90, 253, 253, 253),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide.none,
                          ),
                          hintText: 'ejemplo@mail.com',
                          hintStyle: TextStyle(
                            color: const Color.fromARGB(170, 255, 255, 255),
                          ),
                        ),
                        style: const TextStyle(color: Colors.white),
                      ),
                      const SizedBox(height: 16),

                      // Campo de contraseña
                      const Text(
                        'Password:',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: const Color.fromARGB(96, 255, 255, 255),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: BorderSide.none,
                          ),
                          hintText: '*****',
                          hintStyle: TextStyle(
                            color: const Color.fromARGB(215, 255, 255, 255),
                          ),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword
                                  ? Icons.visibility
                                  : Icons.visibility_off,
                              color: Colors.white70,
                            ),
                            onPressed: () {
                              setState(() {
                                _obscurePassword = !_obscurePassword;
                              });
                            },
                          ),
                        ),
                        style: const TextStyle(color: Colors.white),
                      ),
                      const SizedBox(height: 24),

                      // Botón "INGRESAR"
                      SizedBox(
                        width: double.infinity,
                        child: _isLoading
                            ? const Center(
                                child: CircularProgressIndicator(
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    Colors.white,
                                  ),
                                ),
                              )
                            : ElevatedButton.icon(
                                onPressed: _handleLogin,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF004D40),
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 15,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                                icon: const Icon(
                                  Icons.login,
                                  color: Colors.white,
                                ),
                                label: const Text(
                                  'INGRESAR',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                      ),
                      const SizedBox(height: 20),

                      // Texto inferior alineado a la derecha
                      const Align(
                        alignment: Alignment.centerRight,
                        child: Text(
                          '2025 - Ecuador\nSolo personal autorizado por la empresa.\nVersión 2.0.0.1 - BETA',
                          style: TextStyle(color: Colors.white, fontSize: 12),
                          textAlign: TextAlign.right,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
