import 'dart:async';
import 'package:cmsmobile/screens/services/ModuleService.dart';
import 'package:flutter/material.dart';
import 'package:cmsmobile/screens/services/SessionManager.dart';
import 'package:cmsmobile/screens/services/LocationService.dart';
import 'package:cmsmobile/screens/services/SyncService.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class Dashboard extends StatefulWidget {
  const Dashboard({super.key});

  @override
  State<Dashboard> createState() => _DashboardState();
}

class _DashboardState extends State<Dashboard> {
  Map<String, String> _userData = {};
  List<Module> _modules = [];
  bool _isLoading = true;
  bool _modulesLoading = true;
  Map<String, dynamic>? _lastLocation;
  StreamSubscription? _locationSubscription;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;
  
  // Debug toggle state
  int _debugTapCount = 0;
  bool _showDataInspector = false;
  Timer? _debugTapTimer;

  void _handleDebugTap() {
    _debugTapTimer?.cancel();
    setState(() {
      _debugTapCount++;
      if (_debugTapCount == 5) {
        _showDataInspector = true;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🛠️ Modo Debug Activado: Data Inspector visible.'),
            backgroundColor: Colors.purple,
            duration: Duration(seconds: 2),
          ),
        );
      }
    });

    // Reset tap count if not tapped again within 2 seconds
    _debugTapTimer = Timer(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _debugTapCount = 0;
        });
      }
    });
  }

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _loadModules();
    _initLocationListener();
    _initConnectivityListener();
  }

  void _initConnectivityListener() {
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen((List<ConnectivityResult> result) {
      if (result.isNotEmpty && !result.contains(ConnectivityResult.none)) {
        if (mounted) {
          print('🌐 Conexión recuperada. Recargando módulos automáticamente...');
          _loadModules();
          SyncService.syncOfflineData();
        }
      }
    });
  }

  void _initLocationListener() {
    _locationSubscription = LocationService().locationUpdates.listen((data) {
      if (mounted) {
        setState(() {
          _lastLocation = data;
        });
      }
    });
  }

  Future<void> _loadUserData() async {
    final userData = await SessionManager.getUserData();
    setState(() {
      _userData = userData;
    });
  }

  Future<void> _loadModules() async {
    try {
      final companyCode = 'CMS-001-2023';
      final modules = await ModuleService.getModules(companyCode);

      setState(() {
        _modules = modules;
        _modulesLoading = false;
        _isLoading = false;
      });

      // print('=== MÓDULOS CARGADOS ===');
      // for (var module in modules) {
      //   print('Módulo: ${module.nombre}');
      //   print('Estado: ${module.estado}');
      //   print('Icono: ${module.icon}');
      //   print('------------------------');
      // }
    } catch (e) {
      if (mounted) {
        setState(() {
          _modulesLoading = false;
          _isLoading = false;
        });
      }
      print('Error al cargar módulos: $e');
    }
  }

  Future<void> _logout() async {
    _locationSubscription?.cancel();
    await SessionManager.clearUserData();
    Navigator.pushReplacementNamed(context, 'Login');
  }

  void _navigateToModule(Module module) {
    if (module.estado == 0) {
      return;
    } else if (module.estado == 2) {
      _showMaintenanceAlert(module.nombre);
      return;
    }

    print('Navegando a: ${module.nombre}');

    // Navegación según el módulo seleccionado
    switch (module.nombre) {
      case 'Cronograma de Mantenimientos':
        Navigator.pushNamed(context, 'CronogramaMantenimientos');
        break;
      case 'Data Inspector':
        Navigator.pushNamed(context, 'TrackingMonitor');
        break;
      // Agregar más casos para otros módulos aquí
      default:
        print('Módulo no implementado: ${module.nombre}');
        // Puedes mostrar un mensaje o un diálogo informativo
        break;
    }
  }

  void _showMaintenanceAlert(String moduleName) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF00796B),
          icon: const Icon(Icons.help_outline, color: Colors.orange, size: 50),
          title: const Text(
            'En Mantenimiento',
            style: TextStyle(color: Colors.white),
            textAlign: TextAlign.center,
          ),
          content: Text(
            'El módulo "$moduleName" está en mantenimiento. Por favor, intente más tarde.',
            style: const TextStyle(color: Colors.white),
            textAlign: TextAlign.center,
          ),
          actionsAlignment: MainAxisAlignment.center,
          actions: <Widget>[
            TextButton(
              style: TextButton.styleFrom(
                backgroundColor: Colors.orange,
                foregroundColor: Colors.white,
              ),
              child: const Text('ENTENDIDO'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }

  Widget _buildModuleCard(Module module) {
    if (module.estado == 0) {
      return const SizedBox.shrink();
    }

    return Card(
      elevation: 4,
      margin: const EdgeInsets.all(8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: InkWell(
        onTap: () => _navigateToModule(module),
        borderRadius: BorderRadius.circular(15),
        child: Container(
          padding: const EdgeInsets.all(16), // Reducido de 20 a 16
          constraints: const BoxConstraints(
            minHeight: 160, // Altura mínima para consistencia
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min, // IMPORTANTE: Evita overflow
            children: [
              // Icono del módulo
              Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    constraints: const BoxConstraints(
                      maxWidth: 70, // Reducido de 80 a 70
                      maxHeight: 70, // Reducido de 80 a 70
                    ),
                    child: module.nombre == 'Data Inspector'
                      ? Icon(
                          Icons.storage,
                          size: 40,
                          color: Theme.of(context).primaryColor,
                        )
                      : Image.asset(
                          module.icon,
                          errorBuilder: (context, error, stackTrace) {
                            return Icon(
                              Icons.widgets,
                              size: 40, // Reducido de 50 a 40
                              color: Theme.of(context).primaryColor,
                            );
                          },
                        ),
                  ),
                  if (module.estado == 2)
                    Container(
                      width: 70, // Reducido para coincidir con el icono
                      height: 70, // Reducido para coincidir con el icono
                      decoration: BoxDecoration(
                        color: const Color.fromARGB(101, 0, 0, 0),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.build,
                        color: Colors.orange,
                        size: 30, // Reducido de 40 a 30
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12), // Reducido de 15 a 12
              // Nombre del módulo
              Text(
                module.nombre,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14, // Reducido de 16 a 14
                  fontWeight: FontWeight.bold,
                  color: module.estado == 2 ? Colors.grey : Colors.black87,
                ),
                maxLines: 2, // Límite de líneas
                overflow:
                    TextOverflow.ellipsis, // Puntos suspensivos si es muy largo
              ),
              // Texto de estado si está en mantenimiento
              if (module.estado == 2)
                const Padding(
                  padding: EdgeInsets.only(top: 4),
                  child: Text(
                    'En Mantenimiento',
                    style: TextStyle(
                      fontSize: 11, // Reducido de 12 a 11
                      color: Colors.orange,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Filtrar módulos para mostrar solo los que no tienen estado 0
    final List<Module> visibleModules = _modules
        .where((module) => module.estado != 0)
        .toList();

    // Inyectar módulo de monitoreo manualmente para debug si está activado
    if (_showDataInspector) {
      visibleModules.add(Module(
        id: 999,
        nombre: 'Data Inspector',
        descripcion: 'Estado del rastreador',
        icon: 'lib/assets/icons/gps_icon.png', // Intentará cargar esto o usará Icon por defecto
        color: '#00796B',
        codec: 'GPS',
        estado: 1,
        permisos: 1,
        ccia: 'CMS',
      ));
    }

    return Scaffold(
      appBar: AppBar(
        title: Image.asset(
          'lib/assets/logo/logo_crono_mobile_b.png',
          height: 25,
        ),
        backgroundColor: const Color(0xFF00796B),
        actions: [
          if (!_isLoading && _userData['nombre']!.isNotEmpty)
            GestureDetector(
              onTap: _handleDebugTap,
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16.0,
                  vertical: 8.0,
                ),
                child: Center(
                  child: Text(
                    '${_userData['nombre']} ${_userData['apellido']}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ),

          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
            onPressed: _logout,
            tooltip: 'Cerrar sesión',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF00796B)),
              ),
            )
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Título de módulos
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 8.0),
                    child: Text(
                      'Módulos Disponibles ( ${visibleModules.length} )',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color.fromARGB(221, 15, 109, 94),
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Grid de módulos
                  _modulesLoading
                      ? const Center(child: CircularProgressIndicator())
                      : visibleModules.isEmpty
                      ? const Center(
                          child: Text(
                            'No hay módulos disponibles',
                            style: TextStyle(fontSize: 16, color: Colors.grey),
                          ),
                        )
                      : Expanded(
                          child: GridView.builder(
                            gridDelegate:
                                const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 2,
                                  crossAxisSpacing: 10,
                                  mainAxisSpacing: 10,
                                  childAspectRatio: 0.9,
                                ),
                            itemCount: visibleModules.length,
                            itemBuilder: (context, index) {
                              return _buildModuleCard(visibleModules[index]);
                            },
                          ),
                        ),
                ],
              ),
            ),
    );
  }

  @override
  void dispose() {
    _locationSubscription?.cancel();
    _connectivitySubscription?.cancel();
    _debugTapTimer?.cancel();
    super.dispose();
  }
}
